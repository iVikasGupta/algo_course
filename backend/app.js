import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
// import videoRoutes from "./routes/video.routes.js";
import courseRoutes from "./routes/courseRoutes.js";
import pageRoutes from "./routes/page.routes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import lessonRoutes from "./routes/lesson.routes.js";
import scriptRoutes from "./routes/scriptRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import connectDB from "./config/database.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
// app.use("/api/video", videoRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/scripts", scriptRoutes);
app.use("/api/admin", adminRoutes);
app.set("view engine", "ejs");
app.set("views", "./views");

app.get("/", (req, res) => {
  res.send("API is running");
});

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
