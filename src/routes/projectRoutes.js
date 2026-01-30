// src/routes/projectRoutes.js
import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createProject,
  listProjects,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  getProjectMembers,

} from "../controllers/projectcontroller.js";

const router = express.Router();

// CRUD
router.post("/", protect, createProject);
router.get("/", protect, listProjects);
router.put("/:projectId", protect, updateProject);
router.delete("/:projectId", protect, deleteProject);

// Members
router.post("/:projectId/members", protect, addMember);
router.delete("/:projectId/members/:userId", protect, removeMember);
router.get("/:projectId/members", protect, getProjectMembers);
export default router;
