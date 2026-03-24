import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    vimeo_video_id: {
      type: String,
      required: true,
    },

    order: {
      type: Number,
      required: true,
    },

    is_free_preview: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Lesson || mongoose.model("Lesson", lessonSchema);
