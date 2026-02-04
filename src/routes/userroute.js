import express from "express";
import {supabase} from "../lib/supabase.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

/**
 * GET all users (id, name, email)
 */
router.get("/", protect, async (req, res) => {
  const { data, error } = await supabase
    .from("users") // your PUBLIC users table
    .select("id, name, email");

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  res.json(data);
});

export default router;
