import mongoose from "mongoose";

const PerformanceSchema = new mongoose.Schema(
  {
    month: String,
    profit: Number,
  },
  { _id: false }
);

const ScriptSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    script_type: String,
    price: Number,

    win_rate: Number,
    total_trades: Number,
    profit_percentage: Number,
    max_drawdown: Number,
    sharpe_ratio: Number,

    features: [String],
    performance_data: [PerformanceSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Script", ScriptSchema);
