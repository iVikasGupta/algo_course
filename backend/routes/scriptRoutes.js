import express from "express";
import Script from "../models/script.js";
import Purchase from "../models/purchase.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

/* GET ALL SCRIPTS */
router.get("/", async (req, res) => {
  try {
    const scripts = await Script.find().sort({ createdAt: -1 });
    res.json(scripts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* GET USER'S PURCHASED SCRIPTS - Must be before /:id route */
router.get("/user/purchased", protect, async (req, res) => {
  try {
    const purchases = await Purchase.find({
      user_id: req.user.id,
      item_type: "script",
    }).sort({ createdAt: -1 });

    // Get script details for each purchase
    const scriptIds = purchases.map((p) => p.item_id);
    const scripts = await Script.find({ _id: { $in: scriptIds } });

    // Combine purchase info with script details
    const purchasedScripts = purchases
      .map((purchase) => {
        const script = scripts.find((s) => s._id.toString() === purchase.item_id.toString());
        return {
          purchase_id: purchase._id,
          purchased_at: purchase.createdAt,
          script: script,
        };
      })
      .filter((item) => item.script !== null);

    res.json(purchasedScripts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* GET SINGLE SCRIPT */
router.get("/:id", async (req, res) => {
  try {
    const script = await Script.findById(req.params.id);
    if (!script) {
      return res.status(404).json({ message: "Script not found" });
    }
    res.json(script);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* CREATE SCRIPT (Admin) */
router.post("/", async (req, res) => {
  try {
    const script = await Script.create(req.body);
    res.status(201).json(script);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* UPDATE SCRIPT */
router.put("/:id", async (req, res) => {
  try {
    const script = await Script.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!script) {
      return res.status(404).json({ message: "Script not found" });
    }
    res.json(script);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* DELETE SCRIPT */
router.delete("/:id", async (req, res) => {
  try {
    const script = await Script.findByIdAndDelete(req.params.id);
    if (!script) {
      return res.status(404).json({ message: "Script not found" });
    }
    res.json({ message: "Script deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* CHECK SCRIPT PURCHASE */
router.get("/:id/check-purchase", protect, async (req, res) => {
  try {
    const purchase = await Purchase.findOne({
      user_id: req.user.id,
      item_id: req.params.id,
      item_type: "script",
    });
    res.json({ purchased: !!purchase });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* PURCHASE SCRIPT */
router.post("/:id/purchase", protect, async (req, res) => {
  try {
    const script = await Script.findById(req.params.id);
    if (!script) {
      return res.status(404).json({ message: "Script not found" });
    }

    // Check if already purchased
    const existingPurchase = await Purchase.findOne({
      user_id: req.user.id,
      item_id: req.params.id,
      item_type: "script",
    });

    if (existingPurchase) {
      return res.status(400).json({ message: "Script already purchased" });
    }

    // Create purchase record
    const purchase = await Purchase.create({
      user_id: req.user.id,
      item_id: req.params.id,
      item_type: "script",
      amount: script.price,
    });

    res.status(201).json({ message: "Script purchased successfully", purchase });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* DOWNLOAD SCRIPT (after purchase) */
router.get("/:id/download", protect, async (req, res) => {
  try {
    // Check if user has purchased this script
    const purchase = await Purchase.findOne({
      user_id: req.user.id,
      item_id: req.params.id,
      item_type: "script",
    });

    if (!purchase) {
      return res.status(403).json({ message: "Please purchase this script first" });
    }

    const script = await Script.findById(req.params.id);
    if (!script) {
      return res.status(404).json({ message: "Script not found" });
    }

    // Generate download content (script code/file)
    const scriptContent = `
// ${script.title}
// Type: ${script.script_type}
// Generated for licensed user
// 
// This is a placeholder. In production, actual script files would be served.
// 
// Features:
${script.features.map((f) => `// - ${f}`).join("\n")}
//
// Performance Stats:
// Win Rate: ${script.win_rate}%
// Total Trades: ${script.total_trades}
// Profit: ${script.profit_percentage}%
// Max Drawdown: ${script.max_drawdown}%
// Sharpe Ratio: ${script.sharpe_ratio}

// Your licensed script code would go here...
console.log("${script.title} - Licensed Script");
`;

    res.setHeader("Content-Type", "text/plain");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${script.title.replace(/\s+/g, "_")}.${script.script_type === "Python" ? "py" : script.script_type === "MT5" ? "mq5" : "pine"}"`
    );
    res.send(scriptContent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
