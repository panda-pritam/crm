import Lead from "../models/Lead.js";
import {calculateLeadScore, getAIScore} from "../services/scoringService.js";

// Get all leads
export const getLeads = async (req, res) => {
  try {
    const leads = await Lead.findAll();
    res.json(leads);
  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Server error"});
  }
};

// Get lead by ID
export const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);

    if (!lead) {
      return res.status(404).json({message: "Lead not found"});
    }

    res.json(lead);
  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Server error"});
  }
};

// Create new lead
export const createLead = async (req, res) => {
  try {
    const {name, email, company, status} = req.body;
    const lead = await Lead.create({name, email, company, status});
    res.status(201).json(lead);
  } catch (error) {
    console.error(error);
    res.status(400).json({
      message: "Invalid lead data",
      errors: error.errors?.map(e => e.message),
    });
  }
};

// Update lead
export const updateLead = async (req, res) => {
  try {
    const {name, email, company, status} = req.body;
    const lead = await Lead.findByPk(req.params.id);

    if (!lead) {
      return res.status(404).json({message: "Lead not found"});
    }

    await lead.update({name, email, company, status});
    res.json(lead);
  } catch (error) {
    console.error(error);
    res.status(400).json({
      message: "Invalid lead data",
      errors: error.errors?.map(e => e.message),
    });
  }
};

// Delete lead
export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);

    if (!lead) {
      return res.status(404).json({message: "Lead not found"});
    }

    await lead.destroy();
    res.json({message: "Lead deleted successfully"});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Server error"});
  }
};

export const scoreLead = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);

    if (!lead) {
      return res.status(404).json({error: "Lead not found"});
    }

    const score = await calculateLeadScore(lead);

    res.json({
      lead_id: lead.id,
      score: score,
    });
  } catch (error) {
    console.error("Error scoring lead:", error);
    res.status(500).json({error: "Internal server error"});
  }
};
