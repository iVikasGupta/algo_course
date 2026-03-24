import Lesson from "../models/lesson.model.js";
import Enrollment from "../models/enrollment.js";

export const getLessonVideo = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;

    //  Lesson nikalo
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    //  Enrollment check
    const enrolled = await Enrollment.findOne({
      user_id: userId,
      course_id: lesson.course_id,
    });

    //  Access control
    if (!enrolled && !lesson.is_free_preview) {
      return res.status(403).json({ message: "Course not purchased" });
    }

    //  Sirf ab Vimeo ID bhejo
    res.json({
      title: lesson.title,
      vimeo_video_id: lesson.vimeo_video_id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all lessons for a course
export const getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const lessons = await Lesson.find({ course_id: courseId }).sort({ order: 1 }).select("title order is_free_preview");

    res.json(lessons);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new lesson (admin)
export const createLesson = async (req, res) => {
  try {
    const { course_id, title, vimeo_video_id, order, is_free_preview } = req.body;

    const lesson = await Lesson.create({
      course_id,
      title,
      vimeo_video_id,
      order,
      is_free_preview: is_free_preview || false,
    });

    res.status(201).json(lesson);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
