import express from "express";
import Enrollment from "../models/enrollment.js";
import LessonProgress from "../models/lessonProgress.js";
import Lesson from "../models/lesson.model.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// ENROLL IN A COURSE
router.post("/", protect, async (req, res) => {
  try {
    const { course_id } = req.body;
    const user_id = req.user.id;

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({ user_id, course_id });
    if (existingEnrollment) {
      return res.status(400).json({ message: "Already enrolled in this course" });
    }

    const enrollment = await Enrollment.create({
      user_id,
      course_id,
      progress_percentage: 0,
    });

    res.status(201).json(enrollment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET USER'S ENROLLMENTS
router.get("/my-courses", protect, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user_id: req.user.id }).populate("course_id").sort({ createdAt: -1 });

    res.json(enrollments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

//CHECK IF USER IS ENROLLED IN A COURSE
router.get("/check/:courseId", protect, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      user_id: req.user.id,
      course_id: req.params.courseId,
    });

    res.json({ isEnrolled: !!enrollment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE PROGRESS
router.put("/progress/:courseId", protect, async (req, res) => {
  try {
    const { progress_percentage } = req.body;

    const enrollment = await Enrollment.findOneAndUpdate({ user_id: req.user.id, course_id: req.params.courseId }, { progress_percentage }, { new: true });

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }
    res.json(enrollment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET USER STATS (completed lessons, time spent)
router.get("/stats", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all lesson progress for user
    const lessonProgress = await LessonProgress.find({ user_id: userId });

    const completedLessons = lessonProgress.filter((lp) => lp.is_completed).length;
    const totalTimeSeconds = lessonProgress.reduce((sum, lp) => sum + (lp.time_spent_seconds || 0), 0);
    const totalMinutes = Math.round(totalTimeSeconds / 60);

    res.json({
      completedLessons,
      totalMinutes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE LESSON PROGRESS (mark complete, track time)
router.post("/lesson-progress", protect, async (req, res) => {
  try {
    const { lesson_id, course_id, is_completed, time_spent_seconds, last_position_seconds } = req.body;
    const user_id = req.user.id;

    // Find existing progress or create new
    let progress = await LessonProgress.findOne({ user_id, lesson_id });

    if (progress) {
      // Update existing - add time spent
      progress.time_spent_seconds = (progress.time_spent_seconds || 0) + (time_spent_seconds || 0);
      if (is_completed) {
        progress.is_completed = true;
      }
      if (last_position_seconds !== undefined) {
        progress.last_position_seconds = last_position_seconds;
      }
      await progress.save();
    } else {
      // Create new progress
      progress = await LessonProgress.create({
        user_id,
        lesson_id,
        course_id,
        is_completed: is_completed || false,
        time_spent_seconds: time_spent_seconds || 0,
        last_position_seconds: last_position_seconds || 0,
      });
    }

    // Update course progress percentage
    const totalLessons = await Lesson.countDocuments({ course_id });
    const completedLessons = await LessonProgress.countDocuments({
      user_id,
      course_id,
      is_completed: true,
    });

    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    await Enrollment.findOneAndUpdate({ user_id, course_id }, { progress_percentage: progressPercentage });

    res.json({
      progress,
      courseProgress: progressPercentage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET LESSON PROGRESS FOR A COURSE
router.get("/lesson-progress/:courseId", protect, async (req, res) => {
  try {
    const progress = await LessonProgress.find({
      user_id: req.user.id,
      course_id: req.params.courseId,
    });

    res.json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// MARK LESSON AS COMPLETE
router.post("/complete-lesson", protect, async (req, res) => {
  try {
    const { lesson_id, course_id } = req.body;
    const user_id = req.user.id;

    // Mark lesson as complete
    await LessonProgress.findOneAndUpdate(
      { user_id, lesson_id },
      {
        user_id,
        lesson_id,
        course_id,
        is_completed: true,
      },
      { upsert: true, new: true }
    );

    // Update course progress percentage
    const totalLessons = await Lesson.countDocuments({ course_id });
    const completedLessons = await LessonProgress.countDocuments({
      user_id,
      course_id,
      is_completed: true,
    });

    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    await Enrollment.findOneAndUpdate({ user_id, course_id }, { progress_percentage: progressPercentage });

    res.json({
      completedLessons,
      totalLessons,
      progressPercentage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// BEACON ENDPOINT - For saving progress on page close (no auth required for beacon)
router.post("/lesson-progress-beacon", async (req, res) => {
  try {
    const { lesson_id, course_id, time_spent_seconds, user_id } = req.body;

    if (!lesson_id || !course_id || !time_spent_seconds) {
      return res.status(200).send(); // Return 200 for beacon
    }

    // Find existing progress
    let progress = await LessonProgress.findOne({ lesson_id });

    if (progress) {
      progress.time_spent_seconds = (progress.time_spent_seconds || 0) + (time_spent_seconds || 0);
      await progress.save();
    }

    res.status(200).send();
  } catch (error) {
    console.error("Beacon error:", error);
    res.status(200).send(); // Always return 200 for beacon
  }
});

export default router;
