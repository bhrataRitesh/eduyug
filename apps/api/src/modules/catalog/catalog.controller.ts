import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';
import {
  CreateSectionDto,
  UpdateSectionDto,
  CreateLessonDto,
  UpdateLessonDto,
} from './dto/section-lesson.dto';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { RolesGuard } from '../identity/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, UserPayload } from '@eduyug/shared-types';

@Controller('api/v1/courses')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  // --------------------------------------------------------------------------
  // Public Catalog Endpoints
  // --------------------------------------------------------------------------

  @Get()
  async getPublicCatalog(
    @Query('search') search?: string,
    @Query('difficulty') difficulty?: string,
  ) {
    return this.catalogService.getPublicCatalog(search, difficulty);
  }

  @Get('detail/:slug')
  async getCourseBySlug(@Param('slug') slug: string) {
    return this.catalogService.getCourseBySlug(slug);
  }

  @Get('id/:id')
  async getCourseById(@Param('id') id: string) {
    return this.catalogService.getCourseById(id);
  }

  // --------------------------------------------------------------------------
  // Instructor Authoring & Curriculum Management Endpoints
  // --------------------------------------------------------------------------

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @Get('instructor/my-courses')
  async getMyCourses(@CurrentUser() user: UserPayload) {
    return this.catalogService.getInstructorCourses(user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @Post()
  async createCourse(
    @CurrentUser() user: UserPayload,
    @Body() dto: CreateCourseDto,
  ) {
    return this.catalogService.createCourse(user.sub, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @Patch(':id')
  async updateCourse(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
  ) {
    return this.catalogService.updateCourse(user.sub, id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  async publishCourse(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body('changeSummary') changeSummary?: string,
  ) {
    return this.catalogService.publishCourse(user.sub, id, changeSummary);
  }

  // --- Sections ---

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @Post(':id/sections')
  async createSection(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() dto: CreateSectionDto,
  ) {
    return this.catalogService.createSection(user.sub, id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @Patch(':id/sections/:sectionId')
  async updateSection(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Param('sectionId') sectionId: string,
    @Body() dto: UpdateSectionDto,
  ) {
    return this.catalogService.updateSection(user.sub, id, sectionId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @Delete(':id/sections/:sectionId')
  async deleteSection(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Param('sectionId') sectionId: string,
  ) {
    return this.catalogService.deleteSection(user.sub, id, sectionId);
  }

  // --- Lessons ---

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @Post(':id/sections/:sectionId/lessons')
  async createLesson(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Param('sectionId') sectionId: string,
    @Body() dto: CreateLessonDto,
  ) {
    return this.catalogService.createLesson(user.sub, id, sectionId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @Patch(':id/sections/:sectionId/lessons/:lessonId')
  async updateLesson(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Param('sectionId') sectionId: string,
    @Param('lessonId') lessonId: string,
    @Body() dto: UpdateLessonDto,
  ) {
    return this.catalogService.updateLesson(user.sub, id, sectionId, lessonId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @Delete(':id/sections/:sectionId/lessons/:lessonId')
  async deleteLesson(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Param('sectionId') sectionId: string,
    @Param('lessonId') lessonId: string,
  ) {
    return this.catalogService.deleteLesson(user.sub, id, sectionId, lessonId);
  }
}
