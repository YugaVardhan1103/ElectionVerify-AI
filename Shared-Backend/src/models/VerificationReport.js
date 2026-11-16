import mongoose from "mongoose";
import { CANONICAL_VERDICT_IDS } from "../config/constants.js";
import { EvidenceSourceSchema } from "./EvidenceSource.js";

const EvidenceItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    sourceUrl: {
      type: String,
      trim: true,
      default: "",
    },
    publisher: {
      type: String,
      trim: true,
      default: "",
    },
    publicationDate: {
      type: Date,
      default: null,
    },
    relevance: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: true }
);

const VerificationReportSchema = new mongoose.Schema(
  {
    claim: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Claim",
      required: true,
      unique: true,
      index: true,
    },
    verdictId: {
      type: String,
      enum: {
        values: CANONICAL_VERDICT_IDS,
        message: "Verdict must be one of the five canonical verdicts",
      },
      required: [true, "Verification verdict ID is required"],
      index: true,
    },
    summary: {
      type: String,
      required: [true, "Report summary is required"],
      trim: true,
    },
    assessment: {
      type: String,
      required: [true, "Detailed assessment is required"],
      trim: true,
    },
    evidenceAssessment: {
      type: String,
      trim: true,
      default: "",
    },
    supportingEvidence: {
      type: [EvidenceItemSchema],
      default: [],
    },
    contradictingEvidence: {
      type: [EvidenceItemSchema],
      default: [],
    },
    sources: {
      type: [EvidenceSourceSchema],
      default: [],
    },
    aiMetadata: {
      provider: {
        type: String,
        default: "none",
      },
      model: {
        type: String,
        default: "none",
      },
      executionTimeMs: {
        type: Number,
        default: 0,
      },
      tokenUsage: {
        prompt: { type: Number, default: 0 },
        completion: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
      },
      isConfigured: {
        type: Boolean,
        default: false,
      },
      verificationDate: {
        type: Date,
        default: Date.now,
      },
    },
    humanReview: {
      isReviewed: {
        type: Boolean,
        default: false,
        index: true,
      },
      reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      notes: {
        type: String,
        trim: true,
        default: "",
      },
      reviewedAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

export const VerificationReport = mongoose.model(
  "VerificationReport",
  VerificationReportSchema
);
export default VerificationReport;
