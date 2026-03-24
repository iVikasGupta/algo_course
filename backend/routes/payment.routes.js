import express from "express";
import { protect } from "../middleware/auth.js";
import { createOrder } from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create-order", protect, createOrder);

export default router;
