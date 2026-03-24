import mongoose from "mongoose";
import dotenv from "dotenv";
import Course from "./models/course.js";
import Lesson from "./models/lesson.model.js";
import Script from "./models/script.js";
import Enrollment from "./models/enrollment.js";
import LessonProgress from "./models/lessonProgress.js";

dotenv.config();

const sampleCourses = [
  {
    title: "Forex Trading Fundamentals",
    description: "Master the basics of forex trading. Learn currency pairs, market analysis, and risk management strategies.",
    category: "forex",
    price: 99,
    duration: "10 hours",
    level: "Beginner",
    what_you_learn: [
      "Understanding currency pairs and how forex markets work",
      "Technical analysis fundamentals",
      "Risk management and position sizing",
      "Reading candlestick patterns",
    ],
  },
  {
    title: "Advanced Crypto Trading",
    description: "Take your cryptocurrency trading to the next level with advanced strategies and technical analysis.",
    category: "crypto",
    price: 149,
    duration: "15 hours",
    level: "Advanced",
    what_you_learn: ["Advanced chart patterns and indicators", "DeFi trading strategies", "Portfolio management for crypto", "Market sentiment analysis"],
  },
  {
    title: "Trading Basics 101",
    description: "Perfect starting point for complete beginners. Learn the fundamentals of trading and financial markets.",
    category: "basics",
    price: 49,
    duration: "6 hours",
    level: "Beginner",
    what_you_learn: ["Understanding financial markets", "Types of trading instruments", "Basic chart reading", "Setting up your first trade"],
  },
  {
    title: "Algorithmic Trading with MT5",
    description: "Learn to create automated trading strategies using MetaTrader 5 and Expert Advisors.",
    category: "algo",
    price: 199,
    duration: "20 hours",
    level: "Intermediate",
    what_you_learn: ["MQL5 programming basics", "Building Expert Advisors", "Backtesting strategies", "Risk management in algo trading"],
  },
];

// Sample lessons for each course
const createLessonsForCourse = (courseId, courseTitle) => {
  const lessons = [
    {
      course_id: courseId,
      title: `Introduction to ${courseTitle}`,
      vimeo_video_id: "76979871", // Sample Vimeo video ID
      order: 1,
      is_free_preview: true,
    },
    {
      course_id: courseId,
      title: "Getting Started - Setup & Tools",
      vimeo_video_id: "76979871",
      order: 2,
      is_free_preview: true,
    },
    {
      course_id: courseId,
      title: "Core Concepts & Terminology",
      vimeo_video_id: "76979871",
      order: 3,
      is_free_preview: false,
    },
    {
      course_id: courseId,
      title: "Practical Application",
      vimeo_video_id: "76979871",
      order: 4,
      is_free_preview: false,
    },
    {
      course_id: courseId,
      title: "Advanced Strategies",
      vimeo_video_id: "76979871",
      order: 5,
      is_free_preview: false,
    },
  ];
  return lessons;
};

// Sample trading scripts/bots
const sampleScripts = [
  {
    title: "Gold Scalper Pro",
    description: "High-frequency scalping bot optimized for XAUUSD with advanced risk management and dynamic position sizing.",
    script_type: "MT5",
    price: 299,
    win_rate: 72.5,
    total_trades: 1847,
    profit_percentage: 156.3,
    max_drawdown: 8.2,
    sharpe_ratio: 2.14,
    features: [
      "Automated entry and exit signals",
      "Dynamic position sizing based on account balance",
      "Built-in news filter to avoid high-impact events",
      "Trailing stop loss with break-even feature",
      "Multi-timeframe analysis (M5, M15, H1)",
      "Email and push notifications",
    ],
    performance_data: [
      { month: "Aug", profit: 18.5 },
      { month: "Sep", profit: 22.3 },
      { month: "Oct", profit: -5.2 },
      { month: "Nov", profit: 31.7 },
      { month: "Dec", profit: 28.4 },
      { month: "Jan", profit: 24.1 },
    ],
  },
  {
    title: "Crypto Momentum Bot",
    description: "Trend-following algorithm for major cryptocurrency pairs with machine learning pattern recognition.",
    script_type: "Python",
    price: 449,
    win_rate: 68.3,
    total_trades: 923,
    profit_percentage: 234.7,
    max_drawdown: 12.5,
    sharpe_ratio: 1.89,
    features: [
      "Machine learning pattern recognition",
      "Support for 20+ crypto pairs",
      "API integration with Binance, Coinbase, Kraken",
      "Customizable risk parameters",
      "Real-time dashboard with performance metrics",
      "Backtesting module included",
    ],
    performance_data: [
      { month: "Aug", profit: 45.2 },
      { month: "Sep", profit: 32.1 },
      { month: "Oct", profit: 18.6 },
      { month: "Nov", profit: -8.3 },
      { month: "Dec", profit: 52.4 },
      { month: "Jan", profit: 38.9 },
    ],
  },
  {
    title: "Forex Grid Master",
    description: "Advanced grid trading system for ranging markets with intelligent grid spacing and lot management.",
    script_type: "MT5",
    price: 199,
    win_rate: 81.2,
    total_trades: 2156,
    profit_percentage: 89.4,
    max_drawdown: 15.3,
    sharpe_ratio: 1.56,
    features: [
      "Intelligent grid spacing based on ATR",
      "Auto-adjust lot sizes for drawdown control",
      "Multiple currency pair support",
      "Hedge mode for volatile markets",
      "Visual grid display on chart",
      "Detailed trade logging",
    ],
    performance_data: [
      { month: "Aug", profit: 12.4 },
      { month: "Sep", profit: 15.8 },
      { month: "Oct", profit: 11.2 },
      { month: "Nov", profit: 18.3 },
      { month: "Dec", profit: 14.7 },
      { month: "Jan", profit: 16.9 },
    ],
  },
  {
    title: "TradingView Alert Bot",
    description: "Automated execution bot that converts TradingView alerts into live trades on multiple brokers.",
    script_type: "TradingView",
    price: 149,
    win_rate: 65.8,
    total_trades: 1234,
    profit_percentage: 67.2,
    max_drawdown: 9.8,
    sharpe_ratio: 1.72,
    features: [
      "Webhook integration with TradingView",
      "Support for 10+ brokers",
      "Custom alert message parsing",
      "Position management and scaling",
      "Trade journal with analytics",
      "Discord/Telegram notifications",
    ],
    performance_data: [
      { month: "Aug", profit: 8.9 },
      { month: "Sep", profit: 12.3 },
      { month: "Oct", profit: 15.6 },
      { month: "Nov", profit: 9.8 },
      { month: "Dec", profit: 11.2 },
      { month: "Jan", profit: 13.4 },
    ],
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    // Clear existing data
    await Course.deleteMany({});
    await Lesson.deleteMany({});
    await Script.deleteMany({});
    await Enrollment.deleteMany({});
    await LessonProgress.deleteMany({});
    console.log("Cleared existing courses, lessons, scripts, enrollments, and progress");

    // Insert sample courses
    const courses = await Course.insertMany(sampleCourses);
    console.log(`Added ${courses.length} sample courses`);

    // Insert lessons for each course
    for (const course of courses) {
      const lessons = createLessonsForCourse(course._id, course.title);
      await Lesson.insertMany(lessons);
      console.log(`Added ${lessons.length} lessons for: ${course.title}`);
    }

    // Insert sample scripts
    const scripts = await Script.insertMany(sampleScripts);
    console.log(`Added ${scripts.length} sample scripts`);

    console.log("Seeding completed!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDB();
