import express from "express";
import User from "../models/user.js";
import Course from "../models/course.js";
import Lesson from "../models/lesson.model.js";
import Script from "../models/script.js";
import Enrollment from "../models/enrollment.js";
import Purchase from "../models/purchase.js";
import bcrypt from "bcryptjs";

const router = express.Router();

//  USER MANAGEMENT

// Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get single user
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create user
router.post("/users", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    res.status(201).json({ message: "User created", user: { id: user._id, name, email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update user
router.put("/users/:id", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const updateData = { name, email };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    if (role) {
      updateData.role = role;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User updated", user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete user
router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// COURSE MANAGEMENT

// Get all courses
router.get("/courses", async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get single course
router.get("/courses/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create course
router.post("/courses", async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json({ message: "Course created", course });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update course
router.put("/courses/:id", async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json({ message: "Course updated", course });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete course
router.delete("/courses/:id", async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json({ message: "Course deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// DASHBOARD STATS
router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalLessons = await Lesson.countDocuments();
    const totalScripts = await Script.countDocuments();
    res.json({ totalUsers, totalCourses, totalLessons, totalScripts });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// LESSON MANAGEMENT

// Get all lessons
router.get("/lessons", async (req, res) => {
  try {
    const lessons = await Lesson.find().populate("course_id", "title").sort({ createdAt: -1 });
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get lessons by course
router.get("/lessons/course/:courseId", async (req, res) => {
  try {
    const lessons = await Lesson.find({ course_id: req.params.courseId }).sort({ order: 1 });
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get single lesson
router.get("/lessons/:id", async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate("course_id", "title");
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create lesson
router.post("/lessons", async (req, res) => {
  try {
    const { course_id, title, vimeo_video_id, order, is_free_preview } = req.body;

    const lesson = await Lesson.create({
      course_id,
      title,
      vimeo_video_id,
      order,
      is_free_preview: is_free_preview || false,
    });

    res.status(201).json({ message: "Lesson created", lesson });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update lesson
router.put("/lessons/:id", async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    res.json({ message: "Lesson updated", lesson });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete lesson
router.delete("/lessons/:id", async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndDelete(req.params.id);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    res.json({ message: "Lesson deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ============ SCRIPT MANAGEMENT ============

// Get all scripts
router.get("/scripts", async (req, res) => {
  try {
    const scripts = await Script.find().sort({ createdAt: -1 });
    res.json(scripts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get single script
router.get("/scripts/:id", async (req, res) => {
  try {
    const script = await Script.findById(req.params.id);
    if (!script) return res.status(404).json({ message: "Script not found" });
    res.json(script);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create script
router.post("/scripts", async (req, res) => {
  try {
    const script = await Script.create(req.body);
    res.status(201).json({ message: "Script created", script });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update script
router.put("/scripts/:id", async (req, res) => {
  try {
    const script = await Script.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!script) return res.status(404).json({ message: "Script not found" });
    res.json({ message: "Script updated", script });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete script
router.delete("/scripts/:id", async (req, res) => {
  try {
    const script = await Script.findByIdAndDelete(req.params.id);
    if (!script) return res.status(404).json({ message: "Script not found" });
    res.json({ message: "Script deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ============ ENROLLMENT MANAGEMENT (COURSES) ============

// Get all enrollments
router.get("/enrollments", async (req, res) => {
  try {
    const enrollments = await Enrollment.find().populate("user_id", "name email").populate("course_id", "title price").sort({ createdAt: -1 });
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Enroll user in course (manual enrollment)
router.post("/enrollments", async (req, res) => {
  try {
    const { user_id, course_id } = req.body;

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({ user_id, course_id });
    if (existingEnrollment) {
      return res.status(400).json({ message: "User already enrolled in this course" });
    }

    const enrollment = await Enrollment.create({
      user_id,
      course_id,
      progress_percentage: 0,
    });

    const populatedEnrollment = await Enrollment.findById(enrollment._id).populate("user_id", "name email").populate("course_id", "title price");

    res.status(201).json({ message: "User enrolled successfully", enrollment: populatedEnrollment });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete enrollment
router.delete("/enrollments/:id", async (req, res) => {
  try {
    const enrollment = await Enrollment.findByIdAndDelete(req.params.id);
    if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });
    res.json({ message: "Enrollment removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ============ PURCHASE MANAGEMENT (SCRIPTS) ============

// Get all script purchases
router.get("/purchases", async (req, res) => {
  try {
    const purchases = await Purchase.find({ item_type: "script" }).populate("user_id", "name email").sort({ createdAt: -1 });

    // Get script details for each purchase
    const purchasesWithScripts = await Promise.all(
      purchases.map(async (purchase) => {
        const script = await Script.findById(purchase.item_id);
        return {
          ...purchase.toObject(),
          script: script ? { _id: script._id, title: script.title, price: script.price } : null,
        };
      })
    );

    res.json(purchasesWithScripts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Assign script to user (manual purchase)
router.post("/purchases", async (req, res) => {
  try {
    const { user_id, item_id, amount } = req.body;

    // Check if already purchased
    const existingPurchase = await Purchase.findOne({ user_id, item_id, item_type: "script" });
    if (existingPurchase) {
      return res.status(400).json({ message: "User already has this script" });
    }

    const purchase = await Purchase.create({
      user_id,
      item_id,
      item_type: "script",
      amount: amount || 0,
      payment_status: "completed",
      payment_id: "MANUAL_" + Date.now(),
    });

    const script = await Script.findById(item_id);
    const user = await User.findById(user_id).select("name email");

    res.status(201).json({
      message: "Script assigned successfully",
      purchase: {
        ...purchase.toObject(),
        user_id: user,
        script: script ? { _id: script._id, title: script.title, price: script.price } : null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete purchase
router.delete("/purchases/:id", async (req, res) => {
  try {
    const purchase = await Purchase.findByIdAndDelete(req.params.id);
    if (!purchase) return res.status(404).json({ message: "Purchase not found" });
    res.json({ message: "Purchase removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
