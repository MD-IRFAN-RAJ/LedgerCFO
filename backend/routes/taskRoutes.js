import express from "express";
import Task from "../models/Task.js";

const router = express.Router();

const normalizeStatus = (value) => {
  const status = String(value || "").trim().toLowerCase();
  return status === "completed" ? "Completed" : "Pending";
};

// Get tasks by client
router.get("/", async (req, res) => {
  try {
    const { clientId } = req.query;
    const tasks = await Task.find({ client_id: clientId });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

// Create task
router.post("/", async (req, res) => {
  try {
    const payload = {
      ...req.body,
      status: normalizeStatus(req.body?.status),
    };

    const task = new Task(payload);
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: "Failed to create task" });
  }
});

// Update status
router.patch("/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status: normalizeStatus(req.body?.status) },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res.json(task);
  } catch (error) {
    return res.status(400).json({ message: "Failed to update task status" });
  }
});

export default router;