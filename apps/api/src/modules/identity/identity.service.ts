import { Injectable, UnauthorizedException, ConflictException, Inject, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { DRIZZLE_DB } from '../database/database.module';
import { EduYugDb, users, profiles, refreshTokens, eq } from '@eduyug/database';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole, AuthTokens, UserProfileResponse } from '@eduyug/shared-types';

@Injectable()
export class IdentityService {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: EduYugDb,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<{ user: UserProfileResponse; tokens: AuthTokens }> {
    const existing = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, dto.email.toLowerCase()))
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictException('Email is already registered');
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const [newUser] = await this.db
      .insert(users)
      .values({
        email: dto.email.toLowerCase(),
        passwordHash,
        role: dto.role || UserRole.LEARNER,
        isVerified: false,
      })
      .returning();

    const [newProfile] = await this.db
      .insert(profiles)
      .values({
        userId: newUser.id,
        firstName: dto.firstName,
        lastName: dto.lastName || null,
      })
      .returning();

    const tokens = await this.generateTokens(newUser.id, newUser.email, newUser.role as UserRole, newUser.isVerified);

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role as UserRole,
        isVerified: newUser.isVerified,
        profile: {
          firstName: newProfile.firstName,
          lastName: newProfile.lastName,
          avatarUrl: newProfile.avatarUrl,
          headline: newProfile.headline,
          bio: newProfile.bio,
        },
      },
      tokens,
    };
  }

  async login(dto: LoginDto, deviceInfo?: string, ipAddress?: string): Promise<{ user: UserProfileResponse; tokens: AuthTokens }> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, dto.email.toLowerCase()))
      .limit(1);

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account has been deactivated');
    }

    const [userProfile] = await this.db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1);

    const tokens = await this.generateTokens(user.id, user.email, user.role as UserRole, user.isVerified, deviceInfo, ipAddress);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role as UserRole,
        isVerified: user.isVerified,
        profile: userProfile ? {
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          avatarUrl: userProfile.avatarUrl,
          headline: userProfile.headline,
          bio: userProfile.bio,
        } : null,
      },
      tokens,
    };
  }

  async refreshToken(rawRefreshToken: string): Promise<AuthTokens> {
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || 'default_refresh_secret';
    let decoded: any;

    try {
      decoded = this.jwtService.verify(rawRefreshToken, { secret: refreshSecret });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');

    const [storedToken] = await this.db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.tokenHash, tokenHash))
      .limit(1);

    if (!storedToken || new Date() > storedToken.expiresAt) {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    // Revoke old refresh token (rotation)
    await this.db.delete(refreshTokens).where(eq(refreshTokens.id, storedToken.id));

    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, decoded.sub))
      .limit(1);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User account not found or deactivated');
    }

    return this.generateTokens(user.id, user.email, user.role as UserRole, user.isVerified);
  }

  async getCurrentUser(userId: string): Promise<UserProfileResponse> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [userProfile] = await this.db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1);

    return {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      isVerified: user.isVerified,
      profile: userProfile ? {
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        avatarUrl: userProfile.avatarUrl,
        headline: userProfile.headline,
        bio: userProfile.bio,
      } : null,
    };
  }

  private async generateTokens(
    userId: string,
    email: string,
    role: UserRole,
    isVerified: boolean,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<AuthTokens> {
    const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET') || 'default_jwt_secret';
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || 'default_refresh_secret';
    const accessExpiresIn = this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m';
    const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';

    const payload = { sub: userId, email, role, isVerified };

    const accessToken = this.jwtService.sign(payload, {
      secret: accessSecret,
      expiresIn: accessExpiresIn,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: refreshExpiresIn,
    });

    // Hash refresh token for DB persistence
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.db.insert(refreshTokens).values({
      userId,
      tokenHash,
      deviceInfo,
      ipAddress,
      expiresAt,
    });

    return { accessToken, refreshToken };
  }
}
