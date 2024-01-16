import express from "express";
import {  getChatResponse } from "../services/chatService.js";

const router = express.Router();

router.post("/message", async (req, res) => {
  try {
    const { message } = req.body;
    const response = await getChatResponse(message);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
