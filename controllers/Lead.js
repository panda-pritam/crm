import Lead from "../models/Lead.js";
import {calculateLeadScore} from "../services/scoringService.js";

// Validation middleware
export const validateLeadData = (req, res, next) => {
  const {name, email, company, status} = req.body;

  if (!name || !email || !company) {
    return res.status(400).json({
      success: false,
      error: "Name, email, and company are required fields",
    });
  }

  if (status && !["new", "contacted", "converted"].includes(status)) {
    return res.status(400).json({
      success: false,
      error: "Status must be either new, contacted, or converted",
    });
  }

  next();
};

// Get all leads with pagination
export const getLeads = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const {count, rows: leads} = await Lead.findAndCountAll({
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });

    res.json({
      success: true,
      data: leads,
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch leads. Please try again later.",
    });
  }
};

// Get lead by ID
export const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: "Lead not found",
      });
    }

    res.json({
      success: true,
      data: lead,
    });
  } catch (error) {
    console.error("Error fetching lead:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch lead. Please try again later.",
    });
  }
};

// Create new lead
export const createLead = async (req, res) => {
  try {
    const {name, email, company, status = "new"} = req.body;

    const lead = await Lead.create({
      name,
      email,
      company,
      status,
    });

    res.status(201).json({
      success: true,
      data: lead,
      message: "Lead created successfully",
    });
  } catch (error) {
    console.error("Error creating lead:", error);

    if (
      error.name === "SequelizeValidationError" ||
      error.name === "SequelizeUniqueConstraintError"
    ) {
      const errors = error.errors.map(err => ({
        field: err.path,
        message: err.message,
      }));

      return res.status(400).json({
        success: false,
        error: "Validation failed",
        validationErrors: errors,
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to create lead. Please try again later.",
    });
  }
};

// Update lead
export const updateLead = async (req, res) => {
  try {
    const {name, email, company, status} = req.body;
    const lead = await Lead.findByPk(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: "Lead not found",
      });
    }

    await lead.update({name, email, company, status});

    res.json({
      success: true,
      data: lead,
      message: "Lead updated successfully",
    });
  } catch (error) {
    console.error("Error updating lead:", error);

    if (
      error.name === "SequelizeValidationError" ||
      error.name === "SequelizeUniqueConstraintError"
    ) {
      const errors = error.errors.map(err => ({
        field: err.path,
        message: err.message,
      }));

      return res.status(400).json({
        success: false,
        error: "Validation failed",
        validationErrors: errors,
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to update lead. Please try again later.",
    });
  }
};

// Delete lead
export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: "Lead not found",
      });
    }

    await lead.destroy();

    res.json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting lead:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete lead. Please try again later.",
    });
  }
};

// Score lead
export const scoreLead = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: "Lead not found",
      });
    }

    const score = await calculateLeadScore(lead);

    res.json({
      success: true,
      data: {
        lead_id: lead.id,
        score: score,
      },
    });
  } catch (error) {
    console.error("Error scoring lead:", error);
    res.status(500).json({
      success: false,
      error: "Failed to score lead. Please try again later.",
    });
  }
};
