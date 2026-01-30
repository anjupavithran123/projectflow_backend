import express from "express";
import {
  createTicket,
  getTicketsByProject,
  updateTicket,
  deleteTicket,
  assignTicket
} from "../controllers/ticketController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createTicket);
router.get("/project/:projectId", protect, getTicketsByProject);
router.put("/:id", protect, updateTicket);
router.delete("/:id", protect, deleteTicket);
router.put("/:id/assign", protect, assignTicket);

export default router;
