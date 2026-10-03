import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getDb, EduYugDb } from '@eduyug/database';

export const DRIZZLE_DB = 'DRIZZLE_DB';

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE_DB,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): EduYugDb => {
        const url = configService.get<string>('DATABASE_URL');
        return getDb(url);
      },
    },
  ],
  exports: [DRIZZLE_DB],
})
export class DatabaseModule {}
