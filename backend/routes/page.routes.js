import express from "express";

const router = express.Router();

router.get("/upload-course", (req, res) => {
  res.render("upload-course");
});

export default router;
