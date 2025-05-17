// services/openaiService.js
import {OpenAI} from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function calculateLeadScore(lead) {
  // Start with a base score
  let score = 50;

  // ===== STATUS SCORING =====
  const statusScores = {
    new: 0,
    contacted: 15,
    converted: 30,
  };
  score += statusScores[lead.status] || 0;

  // ===== EMAIL ANALYSIS =====
  if (lead.email) {
    // Extract domain
    const emailParts = lead.email.split("@");
    if (emailParts.length === 2) {
      const domain = emailParts[1].toLowerCase();

      // Premium business domains (major corporations)
      const topTierDomains = [
        "microsoft.com",
        "apple.com",
        "google.com",
        "amazon.com",
        "ibm.com",
        "oracle.com",
        "salesforce.com",
        "adobe.com",
        "intel.com",
        "cisco.com",
        "dell.com",
        "hp.com",
      ];

      // Good corporate domains by TLD
      const goodTLDs = [".edu", ".gov", ".org", ".io"];

      // Consumer domains (generally lower value leads)
      const consumerDomains = [
        "gmail.com",
        "hotmail.com",
        "yahoo.com",
        "outlook.com",
        "aol.com",
        "icloud.com",
        "mail.com",
        "protonmail.com",
      ];

      // Apply scoring based on domain type
      if (topTierDomains.includes(domain)) {
        score += 20; // High-value enterprise domains
      } else if (goodTLDs.some(tld => domain.endsWith(tld))) {
        score += 10; // Educational, government, non-profit domains
      } else if (consumerDomains.includes(domain)) {
        score -= 5; // Consumer email domains
      } else if (
        domain.endsWith(".com") ||
        domain.endsWith(".net") ||
        domain.endsWith(".co")
      ) {
        score += 5; // Generic business domains
      }

      // Email format analysis
      const localPart = emailParts[0].toLowerCase();

      // Generic email addresses tend to be lower value
      const genericEmails = [
        "info",
        "contact",
        "hello",
        "admin",
        "sales",
        "support",
        "help",
      ];
      if (genericEmails.includes(localPart)) {
        score -= 5; // Generic company email
      }

      // Personal emails with real names tend to be higher value
      if (/^[a-z]+\.[a-z]+/.test(localPart)) {
        score += 5; // Likely a firstname.lastname format
      }
    }
  } else {
    // No email is a negative signal
    score -= 10;
  }

  // ===== COMPANY ANALYSIS =====
  if (lead.company) {
    const companyName = lead.company.toLowerCase();

    // Legal entity indicators suggest established businesses
    const legalTerms = [
      "inc",
      "llc",
      "ltd",
      "corp",
      "limited",
      "gmbh",
      "incorporated",
      "corporation",
    ];
    if (
      legalTerms.some(term => {
        return (
          companyName.endsWith(` ${term}`) ||
          companyName.endsWith(`.${term}`) ||
          companyName.endsWith(`,${term}`) ||
          companyName === term
        );
      })
    ) {
      score += 8;
    }

    // Company name length (often correlates with establishment)
    const nameLength = companyName.length;
    if (nameLength > 20) score += 5;
    else if (nameLength > 12) score += 3;
    else if (nameLength < 4) score -= 3; // Very short names might be incomplete

    // Industry indicators in company name - some industries have higher average deal values
    const highValueIndustries = [
      "tech",
      "software",
      "finance",
      "financial",
      "invest",
      "capital",
      "health",
      "medical",
      "pharma",
      "insurance",
      "consulting",
      "enterprise",
      "solutions",
      "systems",
      "global",
    ];

    if (highValueIndustries.some(industry => companyName.includes(industry))) {
      score += 7;
    }

    // Startups and innovation signals
    const startupTerms = [
      "startup",
      "innovation",
      "technologies",
      "labs",
      "ai",
    ];
    if (startupTerms.some(term => companyName.includes(term))) {
      score += 5;
    }
  } else {
    // Missing company name is a negative signal
    score -= 10;
  }

  // ===== NAME ANALYSIS =====
  if (lead.name) {
    const name = lead.name.trim();
    const nameParts = name.split(/\s+/);

    // Proper names with first and last name are better signals
    if (nameParts.length >= 2) {
      score += 5;
    }

    // Check for titles that suggest decision-making authority
    const titleIndicators = [
      "ceo",
      "cto",
      "cfo",
      "coo",
      "president",
      "vp",
      "director",
      "head",
      "manager",
      "chief",
      "founder",
      "owner",
    ];

    const nameLower = name.toLowerCase();
    if (titleIndicators.some(title => nameLower.includes(title))) {
      score += 10; // Decision makers have much higher lead value
    }

    // Very short or likely incomplete name
    if (name.length < 5) {
      score -= 3;
    }
  } else {
    // Missing name is a negative signal
    score -= 10;
  }

  // ===== ADDITIONAL RULES =====

  // If we have all the crucial information, boost score
  if (lead.name && lead.email && lead.company && lead.status) {
    score += 5; // Complete lead information
  }

  // Leads with both high-level titles and enterprise domains
  if (lead.name && lead.email) {
    const nameLower = lead.name.toLowerCase();
    const titleIndicators = [
      "ceo",
      "cto",
      "cfo",
      "coo",
      "president",
      "vp",
      "director",
    ];
    const hasTitleIndicator = titleIndicators.some(title =>
      nameLower.includes(title)
    );

    const domain = lead.email.split("@")[1]?.toLowerCase();
    const enterpriseDomains = [
      "microsoft.com",
      "apple.com",
      "google.com",
      "amazon.com",
    ];
    const hasEnterpriseDomain = enterpriseDomains.some(d => domain === d);

    if (hasTitleIndicator && hasEnterpriseDomain) {
      score += 15; // High-value enterprise decision maker
    }
  }

  // Clamp final score between 1 and 100
  return Math.max(1, Math.min(100, Math.round(score)));
}
// Helper function to extract numerical score from AI response
const extractScoreFromText = text => {
  const match = text.match(/\b\d{1,3}\b/);
  return match ? Math.min(100, Math.max(1, parseInt(match[0]))) : 50;
};

export const getAIScore = async lead => {
  try {
    const prompt = `
      Analyze this sales lead and provide a quality score between 1-100.
      Consider these factors in your evaluation:
      - Name completeness and professionalism
      - Email domain quality
      - Company reputation (based on name)
      - Current engagement status
      
      Lead Details:
      Name: ${lead.name}
      Email: ${lead.email}
      Company: ${lead.company}
      Status: ${lead.status}
      
      Provide only the numerical score and brief 1-sentence justification.
      Example: "85 - Strong professional email and established company"
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {role: "system", content: "You are a sales lead evaluation assistant."},
        {role: "user", content: prompt},
      ],
      temperature: 0.7,
      max_tokens: 60,
    });

    const aiResponse = response.choices[0].message.content;
    return {
      score: extractScoreFromText(aiResponse),
      reasoning: aiResponse,
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    return {
      score: 50, // Fallback score
      reasoning: "Error in AI evaluation - using default score",
    };
  }
};
