import express from "express";
import { protect } from "../middleware/auth.js";
import { getLessonVideo, getLessonsByCourse, createLesson } from "../controllers/lesson.controller.js";

const router = express.Router();

// Get all lessons for a course (public - but video IDs are protected)
router.get("/course/:courseId", getLessonsByCourse);

// Get lesson video (protected - checks enrollment)
router.get("/:lessonId", protect, getLessonVideo);

// Create lesson (admin)
router.post("/", protect, createLesson);

export default router;
