import mongoose from "mongoose";
import {
  CLAIM_STATUS,
  CLAIM_STATUS_LIST,
  CANONICAL_VERDICT_IDS,
  SUPPORTED_LANGUAGES,
  REVIEW_STATUS,
  REVIEW_STATUS_LIST,
} from "../config/constants.js";

const ClaimSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Claim title or summary is required"],
      trim: true,
      maxlength: [300, "Title cannot exceed 300 characters"],
    },
    claimText: {
      type: String,
      required: [true, "Claim statement text is required"],
      trim: true,
      minlength: [5, "Claim text must be at least 5 characters"],
      maxlength: [5000, "Claim text cannot exceed 5000 characters"],
    },
    sourceUrl: {
      type: String,
      trim: true,
      default: "",
    },
    language: {
      type: String,
      default: "English",
      enum: {
        values: SUPPORTED_LANGUAGES,
        message: "Unsupported language selection",
      },
    },
    context: {
      type: String,
      trim: true,
      default: "",
      maxlength: [2000, "Context cannot exceed 2000 characters"],
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
      index: true,
    },
    submittedDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: CLAIM_STATUS_LIST,
        message: "Invalid claim status",
      },
      default: CLAIM_STATUS.UNDER_REVIEW,
      index: true,
    },
    verdictId: {
      type: String,
      enum: {
        values: [...CANONICAL_VERDICT_IDS, null],
        message: "Verdict must be one of the five canonical verdicts or null",
      },
      default: null,
      index: true,
    },
    reviewStatus: {
      type: String,
      enum: {
        values: REVIEW_STATUS_LIST,
        message: "Invalid review status",
      },
      default: REVIEW_STATUS.AWAITING_REVIEW,
      index: true,
    },
    categoryTags: {
      type: [String],
      default: ["General Election"],
    },
    verificationReport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VerificationReport",
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound text index for search across title and claimText
ClaimSchema.index({ title: "text", claimText: "text" });

export const Claim = mongoose.model("Claim", ClaimSchema);
export default Claim;
