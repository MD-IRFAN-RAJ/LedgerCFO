import express from "express";
import Task from "../models/Task.js";

const router = express.Router();

// Get tasks by client
router.get("/", async (req, res) => {
  const { clientId } = req.query;
  const tasks = await Task.find({ client_id: clientId });
  res.json(tasks);
});

// Create task
router.post("/", async (req, res) => {
  const task = new Task(req.body);
  await task.save();
  res.json(task);
});

// Update status
router.patch("/:id", async (req, res) => {
  const { status } = req.body;

  const task = await Task.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  res.json(task);
});

export default router;