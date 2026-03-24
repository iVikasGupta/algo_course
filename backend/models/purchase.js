import mongoose from "mongoose";

const PurchaseSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    item_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    item_type: {
      type: String,
      enum: ["script", "course"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    payment_status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "completed",
    },
    payment_id: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Purchase", PurchaseSchema);