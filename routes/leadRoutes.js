import express from "express";
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  scoreLead,
} from "../controllers/Lead.js";

const router = express.Router();

// Routes for /api/leads
router.get("/", getLeads);
router.get("/:id", getLeadById);
router.post("/", createLead);
router.put("/:id", updateLead);
router.delete("/:id", deleteLead);
router.get("/:id/score", scoreLead);

export default router;
