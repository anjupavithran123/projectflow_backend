// src/routes/comment.routes.js
import express from "express";
import {
  getComments,
  createComment,
  updateComment,
  deleteComment
} from "../controllers/comment.controller.js";

const router = express.Router();

router.get("/:ticketId", getComments);
router.post("/", createComment);
router.put("/:id", updateComment);
router.delete("/:id", deleteComment);

export default router;
