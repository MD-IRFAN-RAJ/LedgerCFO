import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  client_id: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
  title: { type: String, required: true },
  description: String,
  category: String,
  due_date: Date,
  status: {
    type: String,
    enum: ["Pending", "Completed"],
    default: "Pending"
  },
  priority: String
}, { timestamps: true });

export default mongoose.model("Task", taskSchema);