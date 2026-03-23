import express from "express";
import Client from "../models/Client.js";

const router = express.Router();

// Get all clients
router.get("/", async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.json(clients);
  } catch (error) {
    console.error("Failed to fetch clients:", error.message);
    res.status(500).json({ message: "Failed to fetch clients" });
  }
});

// Add client
router.post("/", async (req, res) => {
  try {
    const payload = {
      company_name: req.body.company_name?.trim(),
      country: req.body.country?.trim(),
      entity_type: req.body.entity_type?.trim(),
      govt_id: req.body.govt_id?.trim() || undefined,
      govt_id_type: req.body.govt_id_type?.trim() || undefined,
    };

    if (!payload.company_name || !payload.country || !payload.entity_type) {
      return res.status(400).json({
        message: "company_name, country and entity_type are required",
      });
    }

    const client = await Client.create(payload);
    return res.status(201).json(client);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        message: "Client with this govt_id already exists",
      });
    }

    return res.status(500).json({ message: "Failed to create client" });
  }
});

export default router;