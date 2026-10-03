import { getDb, users, profiles, categories, courses, courseVersions, sections, lessons, mediaAssets, transcripts, transcriptChunks, enrollments, eq } from '@eduyug/database';
import { UserRole, CourseStatus, LessonType, MediaStatus } from '@eduyug/shared-types';
import * as bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Starting EduYug database seed...');
  const db = getDb();

  // 1. Create Instructor User
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password123!', salt);

  const existingInstructor = await db.select().from(users).where(eq(users.email, 'instructor@eduyug.com')).limit(1);
  let instructorId = existingInstructor[0]?.id;

  if (!instructorId) {
    const [inst] = await db.insert(users).values({
      email: 'instructor@eduyug.com',
      passwordHash,
      role: UserRole.INSTRUCTOR,
      isVerified: true,
    }).returning();
    instructorId = inst.id;

    await db.insert(profiles).values({
      userId: instructorId,
      firstName: 'Ritesh',
      lastName: 'Kumar',
      headline: 'Principal Distributed Systems Engineer',
      bio: 'Author and architect specializing in low-latency event-driven microservices with Kafka, Go, and PostgreSQL.',
    });
    console.log('✅ Created Instructor: instructor@eduyug.com / Password123!');
  } else {
    console.log('ℹ️ Instructor already exists');
  }

  // 2. Create Learner User
  const existingLearner = await db.select().from(users).where(eq(users.email, 'learner@eduyug.com')).limit(1);
  let learnerId = existingLearner[0]?.id;

  if (!learnerId) {
    const [learn] = await db.insert(users).values({
      email: 'learner@eduyug.com',
      passwordHash,
      role: UserRole.LEARNER,
      isVerified: true,
    }).returning();
    learnerId = learn.id;

    await db.insert(profiles).values({
      userId: learnerId,
      firstName: 'Aryan',
      lastName: 'Sharma',
      headline: 'Software Engineer',
    });
    console.log('✅ Created Learner: learner@eduyug.com / Password123!');
  } else {
    console.log('ℹ️ Learner already exists');
  }

  // 3. Categories
  const existingCat = await db.select().from(categories).where(eq(categories.slug, 'distributed-systems')).limit(1);
  let categoryId = existingCat[0]?.id;

  if (!categoryId) {
    const [cat] = await db.insert(categories).values({
      name: 'Distributed Systems',
      slug: 'distributed-systems',
      description: 'Master large-scale distributed architectures, consensus algorithms, and event streaming.',
    }).returning();
    categoryId = cat.id;

    await db.insert(categories).values([
      {
        name: 'Full Stack Engineering',
        slug: 'full-stack-engineering',
        description: 'Modern reactive web applications with TypeScript, Next.js, and Node.js.',
      },
      {
        name: 'AI & Machine Learning',
        slug: 'ai-machine-learning',
        description: 'Embeddings, Retrieval-Augmented Generation (RAG), and LLM application engineering.',
      },
    ]);
    console.log('✅ Created Course Categories');
  }

  // 4. Media Asset
  const [media] = await db.insert(mediaAssets).values({
    instructorId,
    originalFilename: 'distributed-systems-module-1.mp4',
    rawS3Key: 'raw/distributed-systems-module-1.mp4',
    hlsMasterPlaylistUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    durationSeconds: 720,
    status: MediaStatus.READY,
    resolutions: ['1080p', '720p', '480p', '360p'],
  }).returning();

  // 5. Course: Distributed Systems with Kafka & Go
  const existingCourse = await db.select().from(courses).where(eq(courses.slug, 'distributed-systems-kafka-go')).limit(1);
  let courseId = existingCourse[0]?.id;

  if (!courseId) {
    const [course] = await db.insert(courses).values({
      instructorId,
      categoryId,
      title: 'Production-Grade Distributed Systems with Kafka & Go',
      slug: 'distributed-systems-kafka-go',
      subtitle: 'Master event streaming, consumer group rebalancing, and exactly-once semantics at scale.',
      description: 'An exhaustive masterclass on designing resilient, fault-tolerant distributed backends with Apache Kafka, Go routines, and PostgreSQL pgvector RAG tutors.',
      priceInr: '4999.00',
      salePriceInr: '2999.00',
      language: 'English',
      difficultyLevel: 'advanced',
      status: CourseStatus.PUBLISHED,
    }).returning();
    courseId = course.id;

    // Course Version Snapshot
    const [version] = await db.insert(courseVersions).values({
      courseId,
      versionNumber: 1,
      snapshotTree: { title: 'v1.0.0 Initial Release', releasedAt: new Date().toISOString() },
      changeSummary: 'Initial production release with 2 modules and 4 video lessons.',
    }).returning();

    await db.update(courses).set({ publishedVersionId: version.id }).where(eq(courses.id, courseId));

    // Sections
    const [sec1] = await db.insert(sections).values({
      courseId,
      title: 'Module 1: Foundations of Event Streaming',
      orderIndex: 0,
    }).returning();

    const [sec2] = await db.insert(sections).values({
      courseId,
      title: 'Module 2: High-Throughput Consumers & Partitioning',
      orderIndex: 1,
    }).returning();

    // Lessons
    const [les1] = await db.insert(lessons).values({
      sectionId: sec1.id,
      courseId,
      title: 'Event Streaming vs Message Queues: Trade-offs & Architecture',
      lessonType: LessonType.VIDEO,
      contentText: 'In this video lesson, we contrast log-centric architectures like Kafka against message-oriented brokers like RabbitMQ. Key topics include disk sequentially, zero-copy kernel transfers, and consumer state management.',
      mediaAssetId: media.id,
      durationSeconds: 380,
      isPreview: true,
      orderIndex: 0,
    }).returning();

    const [les2] = await db.insert(lessons).values({
      sectionId: sec1.id,
      courseId,
      title: 'Kafka Consumer Group Protocol & Offset Commit Semantics',
      lessonType: LessonType.VIDEO,
      contentText: 'Detailed breakdown of partition assignment strategies, heartbeat threads, session timeouts, and manual synchronous vs asynchronous offset committing in Go.',
      mediaAssetId: media.id,
      durationSeconds: 490,
      isPreview: false,
      orderIndex: 1,
    }).returning();

    await db.insert(lessons).values([
      {
        sectionId: sec2.id,
        courseId,
        title: 'Zero-Allocation Serialization with Protocol Buffers in Go',
        lessonType: LessonType.VIDEO,
        contentText: 'Practical implementation of Protocol Buffers v3 and Schema Registry client in Go.',
        mediaAssetId: media.id,
        durationSeconds: 520,
        isPreview: false,
        orderIndex: 0,
      },
      {
        sectionId: sec2.id,
        courseId,
        title: 'Exactly-Once Semantics (EOS) & Idempotent Producers',
        lessonType: LessonType.VIDEO,
        contentText: 'Understanding transaction coordinator logs and two-phase commit across partitions.',
        mediaAssetId: media.id,
        durationSeconds: 610,
        isPreview: false,
        orderIndex: 1,
      },
    ]);

    // Transcripts for Lesson 2 (Kafka Consumer Group)
    const [transcript] = await db.insert(transcripts).values({
      mediaAssetId: media.id,
      courseId,
      lessonId: les2.id,
      language: 'en',
      fullText: 'Welcome to this lesson on the Kafka consumer group protocol and offset committing. In this segment, we discuss partition assignment strategies and rebalance storms. At 01:00 we see how heartbeat threads keep consumer liveness. At 02:25 we examine manual offset commit semantics and how duplicate message delivery can occur if auto-commit is enabled. In the next chapter, we implement a graceful rebalance listener in Go.',
    }).returning();

    // Generate dummy 1536-dim normalized vector
    const mockVector = new Array(1536).fill(0).map((_, i) => (i % 2 === 0 ? 0.025 : -0.025));

    await db.insert(transcriptChunks).values([
      {
        transcriptId: transcript.id,
        courseId,
        lessonId: les2.id,
        chunkIndex: 0,
        startTimeSeconds: '0.00',
        endTimeSeconds: '60.00',
        content: 'Introduction to Kafka consumer groups, partition allocation across cluster brokers, and coordinator election.',
        embedding: mockVector,
      },
      {
        transcriptId: transcript.id,
        courseId,
        lessonId: les2.id,
        chunkIndex: 1,
        startTimeSeconds: '60.00',
        endTimeSeconds: '145.00',
        content: 'Heartbeat threads, session timeout intervals, and avoiding unnecessary consumer group rebalance storms during garbage collection.',
        embedding: mockVector,
      },
      {
        transcriptId: transcript.id,
        courseId,
        lessonId: les2.id,
        chunkIndex: 2,
        startTimeSeconds: '145.00',
        endTimeSeconds: '280.00',
        content: 'The instructor explains manual vs automatic offset committing and potential duplicate processing risks in detail at this timestamp.',
        embedding: mockVector,
      },
    ]);

    // Enroll Learner in the Course
    await db.insert(enrollments).values({
      userId: learnerId,
      courseId,
      courseVersionId: version.id,
    });

    console.log('✅ Created Course: "Production-Grade Distributed Systems with Kafka & Go"');
    console.log('✅ Created Sections, Lessons, Media Asset, Transcripts & Vector Chunks');
    console.log('✅ Enrolled Learner in course for testing');
  }

  console.log('🎉 Seed completed successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
