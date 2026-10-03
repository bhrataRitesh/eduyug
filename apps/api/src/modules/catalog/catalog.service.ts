import { Injectable, NotFoundException, ForbiddenException, Inject, BadRequestException } from '@nestjs/common';
import { DRIZZLE_DB } from '../database/database.module';
import {
  EduYugDb,
  courses,
  sections,
  lessons,
  courseVersions,
  users,
  profiles,
  eq,
  and,
  desc,
  asc,
  sql,
} from '@eduyug/database';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';
import { CreateSectionDto, UpdateSectionDto, CreateLessonDto, UpdateLessonDto } from './dto/section-lesson.dto';
import { CourseStatus, CourseCardSummary, CourseDetail, SectionSummary, LessonType } from '@eduyug/shared-types';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class CatalogService {
  constructor(@Inject(DRIZZLE_DB) private readonly db: EduYugDb) {}

  async createCourse(instructorId: string, dto: CreateCourseDto): Promise<CourseDetail> {
    const baseSlug = slugify(dto.title);
    const uniqueSuffix = Math.random().toString(36).substring(2, 7);
    const slug = `${baseSlug}-${uniqueSuffix}`;

    const [course] = await this.db
      .insert(courses)
      .values({
        instructorId,
        title: dto.title,
        slug,
        subtitle: dto.subtitle,
        description: dto.description,
        categoryId: dto.categoryId,
        priceInr: dto.priceInr ? dto.priceInr.toFixed(2) : '0.00',
        language: dto.language || 'English',
        difficultyLevel: dto.difficultyLevel || 'all_levels',
        status: CourseStatus.DRAFT,
      })
      .returning();

    return this.getCourseById(course.id);
  }

  async getPublicCatalog(search?: string, difficulty?: string): Promise<CourseCardSummary[]> {
    const conditions = [eq(courses.status, CourseStatus.PUBLISHED)];

    if (difficulty && difficulty !== 'all') {
      conditions.push(eq(courses.difficultyLevel, difficulty));
    }

    if (search && search.trim().length > 0) {
      conditions.push(sql`${courses.title} ILIKE ${`%${search.trim()}%`}`);
    }

    const matchedCourses = await this.db
      .select({
        id: courses.id,
        title: courses.title,
        slug: courses.slug,
        subtitle: courses.subtitle,
        thumbnailUrl: courses.thumbnailUrl,
        priceInr: courses.priceInr,
        salePriceInr: courses.salePriceInr,
        language: courses.language,
        difficultyLevel: courses.difficultyLevel,
        status: courses.status,
        instructorFirstName: profiles.firstName,
        instructorLastName: profiles.lastName,
      })
      .from(courses)
      .leftJoin(profiles, eq(profiles.userId, courses.instructorId))
      .where(and(...conditions))
      .orderBy(desc(courses.createdAt));

    const result: CourseCardSummary[] = [];

    for (const c of matchedCourses) {
      const [lessonStats] = await this.db
        .select({
          totalLessons: sql<number>`count(${lessons.id})::int`,
          totalDuration: sql<number>`coalesce(sum(${lessons.durationSeconds}), 0)::int`,
        })
        .from(lessons)
        .where(eq(lessons.courseId, c.id));

      result.push({
        id: c.id,
        title: c.title,
        slug: c.slug,
        subtitle: c.subtitle,
        thumbnailUrl: c.thumbnailUrl,
        priceInr: c.priceInr,
        salePriceInr: c.salePriceInr,
        language: c.language,
        difficultyLevel: c.difficultyLevel,
        status: c.status as CourseStatus,
        instructorName: `${c.instructorFirstName || 'EduYug'} ${c.instructorLastName || 'Instructor'}`.trim(),
        totalLessons: lessonStats?.totalLessons || 0,
        totalDurationSeconds: lessonStats?.totalDuration || 0,
      });
    }

    return result;
  }

  async getCourseBySlug(slug: string): Promise<CourseDetail> {
    const [course] = await this.db
      .select({
        id: courses.id,
        instructorId: courses.instructorId,
        categoryId: courses.categoryId,
        title: courses.title,
        slug: courses.slug,
        subtitle: courses.subtitle,
        description: courses.description,
        thumbnailUrl: courses.thumbnailUrl,
        trailerVideoUrl: courses.trailerVideoUrl,
        priceInr: courses.priceInr,
        salePriceInr: courses.salePriceInr,
        language: courses.language,
        difficultyLevel: courses.difficultyLevel,
        status: courses.status,
        instructorFirstName: profiles.firstName,
        instructorLastName: profiles.lastName,
      })
      .from(courses)
      .leftJoin(profiles, eq(profiles.userId, courses.instructorId))
      .where(eq(courses.slug, slug))
      .limit(1);

    if (!course) {
      throw new NotFoundException(`Course not found with slug: ${slug}`);
    }

    const sectionsList = await this.getCurriculumTree(course.id);

    return {
      id: course.id,
      instructorId: course.instructorId,
      instructorName: `${course.instructorFirstName || 'EduYug'} ${course.instructorLastName || 'Instructor'}`.trim(),
      categoryId: course.categoryId,
      title: course.title,
      slug: course.slug,
      subtitle: course.subtitle,
      description: course.description,
      thumbnailUrl: course.thumbnailUrl,
      trailerVideoUrl: course.trailerVideoUrl,
      priceInr: course.priceInr,
      salePriceInr: course.salePriceInr,
      language: course.language,
      difficultyLevel: course.difficultyLevel,
      status: course.status as CourseStatus,
      sections: sectionsList,
    };
  }

  async getCourseById(courseId: string): Promise<CourseDetail> {
    const [course] = await this.db
      .select({
        id: courses.id,
        instructorId: courses.instructorId,
        categoryId: courses.categoryId,
        title: courses.title,
        slug: courses.slug,
        subtitle: courses.subtitle,
        description: courses.description,
        thumbnailUrl: courses.thumbnailUrl,
        trailerVideoUrl: courses.trailerVideoUrl,
        priceInr: courses.priceInr,
        salePriceInr: courses.salePriceInr,
        language: courses.language,
        difficultyLevel: courses.difficultyLevel,
        status: courses.status,
        instructorFirstName: profiles.firstName,
        instructorLastName: profiles.lastName,
      })
      .from(courses)
      .leftJoin(profiles, eq(profiles.userId, courses.instructorId))
      .where(eq(courses.id, courseId))
      .limit(1);

    if (!course) {
      throw new NotFoundException(`Course not found with ID: ${courseId}`);
    }

    const sectionsList = await this.getCurriculumTree(course.id);

    return {
      id: course.id,
      instructorId: course.instructorId,
      instructorName: `${course.instructorFirstName || 'EduYug'} ${course.instructorLastName || 'Instructor'}`.trim(),
      categoryId: course.categoryId,
      title: course.title,
      slug: course.slug,
      subtitle: course.subtitle,
      description: course.description,
      thumbnailUrl: course.thumbnailUrl,
      trailerVideoUrl: course.trailerVideoUrl,
      priceInr: course.priceInr,
      salePriceInr: course.salePriceInr,
      language: course.language,
      difficultyLevel: course.difficultyLevel,
      status: course.status as CourseStatus,
      sections: sectionsList,
    };
  }

  async getInstructorCourses(instructorId: string): Promise<CourseDetail[]> {
    const instructorCourses = await this.db
      .select()
      .from(courses)
      .where(eq(courses.instructorId, instructorId))
      .orderBy(desc(courses.updatedAt));

    const results: CourseDetail[] = [];
    for (const c of instructorCourses) {
      const curriculum = await this.getCurriculumTree(c.id);
      results.push({
        id: c.id,
        instructorId: c.instructorId,
        categoryId: c.categoryId,
        title: c.title,
        slug: c.slug,
        subtitle: c.subtitle,
        description: c.description,
        thumbnailUrl: c.thumbnailUrl,
        trailerVideoUrl: c.trailerVideoUrl,
        priceInr: c.priceInr,
        salePriceInr: c.salePriceInr,
        language: c.language,
        difficultyLevel: c.difficultyLevel,
        status: c.status as CourseStatus,
        sections: curriculum,
      });
    }
    return results;
  }

  async updateCourse(instructorId: string, courseId: string, dto: UpdateCourseDto): Promise<CourseDetail> {
    await this.assertCourseOwnership(instructorId, courseId);

    const updateData: Partial<typeof courses.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (dto.title) updateData.title = dto.title;
    if (dto.subtitle !== undefined) updateData.subtitle = dto.subtitle;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.categoryId !== undefined) updateData.categoryId = dto.categoryId;
    if (dto.priceInr !== undefined) updateData.priceInr = dto.priceInr.toFixed(2);
    if (dto.salePriceInr !== undefined) updateData.salePriceInr = dto.salePriceInr.toFixed(2);
    if (dto.language) updateData.language = dto.language;
    if (dto.difficultyLevel) updateData.difficultyLevel = dto.difficultyLevel;
    if (dto.thumbnailUrl !== undefined) updateData.thumbnailUrl = dto.thumbnailUrl;
    if (dto.trailerVideoUrl !== undefined) updateData.trailerVideoUrl = dto.trailerVideoUrl;

    await this.db.update(courses).set(updateData).where(eq(courses.id, courseId));

    return this.getCourseById(courseId);
  }

  // --- Curriculum: Sections ---

  async createSection(instructorId: string, courseId: string, dto: CreateSectionDto) {
    await this.assertCourseOwnership(instructorId, courseId);

    const [newSection] = await this.db
      .insert(sections)
      .values({
        courseId,
        title: dto.title,
        orderIndex: dto.orderIndex ?? 0,
      })
      .returning();

    return newSection;
  }

  async updateSection(instructorId: string, courseId: string, sectionId: string, dto: UpdateSectionDto) {
    await this.assertCourseOwnership(instructorId, courseId);

    const [updated] = await this.db
      .update(sections)
      .set({
        ...(dto.title && { title: dto.title }),
        ...(dto.orderIndex !== undefined && { orderIndex: dto.orderIndex }),
        updatedAt: new Date(),
      })
      .where(and(eq(sections.id, sectionId), eq(sections.courseId, courseId)))
      .returning();

    if (!updated) throw new NotFoundException('Section not found');
    return updated;
  }

  async deleteSection(instructorId: string, courseId: string, sectionId: string) {
    await this.assertCourseOwnership(instructorId, courseId);
    await this.db.delete(sections).where(and(eq(sections.id, sectionId), eq(sections.courseId, courseId)));
    return { success: true, message: 'Section removed' };
  }

  // --- Curriculum: Lessons ---

  async createLesson(instructorId: string, courseId: string, sectionId: string, dto: CreateLessonDto) {
    await this.assertCourseOwnership(instructorId, courseId);

    const [section] = await this.db
      .select({ id: sections.id })
      .from(sections)
      .where(and(eq(sections.id, sectionId), eq(sections.courseId, courseId)))
      .limit(1);

    if (!section) throw new NotFoundException('Section not found in this course');

    const [newLesson] = await this.db
      .insert(lessons)
      .values({
        courseId,
        sectionId,
        title: dto.title,
        lessonType: dto.lessonType || LessonType.VIDEO,
        contentText: dto.contentText,
        durationSeconds: dto.durationSeconds || 0,
        isPreview: dto.isPreview || false,
        orderIndex: dto.orderIndex ?? 0,
      })
      .returning();

    return newLesson;
  }

  async updateLesson(
    instructorId: string,
    courseId: string,
    sectionId: string,
    lessonId: string,
    dto: UpdateLessonDto,
  ) {
    await this.assertCourseOwnership(instructorId, courseId);

    const [updated] = await this.db
      .update(lessons)
      .set({
        ...(dto.title && { title: dto.title }),
        ...(dto.lessonType && { lessonType: dto.lessonType }),
        ...(dto.contentText !== undefined && { contentText: dto.contentText }),
        ...(dto.durationSeconds !== undefined && { durationSeconds: dto.durationSeconds }),
        ...(dto.isPreview !== undefined && { isPreview: dto.isPreview }),
        ...(dto.orderIndex !== undefined && { orderIndex: dto.orderIndex }),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(lessons.id, lessonId),
          eq(lessons.sectionId, sectionId),
          eq(lessons.courseId, courseId),
        ),
      )
      .returning();

    if (!updated) throw new NotFoundException('Lesson not found');
    return updated;
  }

  async deleteLesson(instructorId: string, courseId: string, sectionId: string, lessonId: string) {
    await this.assertCourseOwnership(instructorId, courseId);
    await this.db
      .delete(lessons)
      .where(
        and(
          eq(lessons.id, lessonId),
          eq(lessons.sectionId, sectionId),
          eq(lessons.courseId, courseId),
        ),
      );
    return { success: true, message: 'Lesson removed' };
  }

  // --- Course Publication & Immutable Versioning ---

  async publishCourse(instructorId: string, courseId: string, changeSummary?: string) {
    await this.assertCourseOwnership(instructorId, courseId);

    const curriculumTree = await this.getCurriculumTree(courseId);
    if (curriculumTree.length === 0) {
      throw new BadRequestException('Cannot publish a course with zero sections');
    }

    const totalLessons = curriculumTree.reduce((acc, s) => acc + s.lessons.length, 0);
    if (totalLessons === 0) {
      throw new BadRequestException('Cannot publish a course without any lessons');
    }

    // Determine next version number
    const [latestVersion] = await this.db
      .select({ versionNumber: courseVersions.versionNumber })
      .from(courseVersions)
      .where(eq(courseVersions.courseId, courseId))
      .orderBy(desc(courseVersions.versionNumber))
      .limit(1);

    const nextVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

    // Freeze snapshot into course_versions
    const [versionRecord] = await this.db
      .insert(courseVersions)
      .values({
        courseId,
        versionNumber: nextVersionNumber,
        snapshotTree: curriculumTree,
        changeSummary: changeSummary || `Release v${nextVersionNumber}`,
      })
      .returning();

    // Mark course as published
    await this.db
      .update(courses)
      .set({
        status: CourseStatus.PUBLISHED,
        publishedVersionId: versionRecord.id,
        updatedAt: new Date(),
      })
      .where(eq(courses.id, courseId));

    return {
      success: true,
      versionNumber: nextVersionNumber,
      publishedVersionId: versionRecord.id,
      status: CourseStatus.PUBLISHED,
    };
  }

  // --- Helpers ---

  private async assertCourseOwnership(instructorId: string, courseId: string) {
    const [course] = await this.db
      .select({ instructorId: courses.instructorId })
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.instructorId !== instructorId) {
      throw new ForbiddenException('You do not have permission to manage this course');
    }
  }

  private async getCurriculumTree(courseId: string): Promise<SectionSummary[]> {
    const courseSections = await this.db
      .select()
      .from(sections)
      .where(eq(sections.courseId, courseId))
      .orderBy(asc(sections.orderIndex));

    const tree: SectionSummary[] = [];

    for (const sec of courseSections) {
      const sectionLessons = await this.db
        .select()
        .from(lessons)
        .where(eq(lessons.sectionId, sec.id))
        .orderBy(asc(lessons.orderIndex));

      tree.push({
        id: sec.id,
        courseId: sec.courseId,
        title: sec.title,
        orderIndex: sec.orderIndex,
        lessons: sectionLessons.map((l) => ({
          id: l.id,
          sectionId: l.sectionId,
          courseId: l.courseId,
          title: l.title,
          lessonType: l.lessonType as any,
          durationSeconds: l.durationSeconds,
          isPreview: l.isPreview,
          orderIndex: l.orderIndex,
          contentText: l.contentText,
          mediaAssetId: l.mediaAssetId,
        })),
      });
    }

    return tree;
  }
}
