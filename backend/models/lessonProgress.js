import mongoose from "mongoose";

const lessonProgressSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lesson_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    is_completed: {
      type: Boolean,
      default: false,
    },
    time_spent_seconds: {
      type: Number,
      default: 0,
    },
    last_position_seconds: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Prevent duplicate progress entries
lessonProgressSchema.index({ user_id: 1, lesson_id: 1 }, { unique: true });

export default mongoose.models.LessonProgress || mongoose.model("LessonProgress", lessonProgressSchema);
