import mongoose from "mongoose";

export const EvidenceSourceSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, "Source URL is required"],
      trim: true,
    },
    title: {
      type: String,
      trim: true,
      default: "",
    },
    publisher: {
      type: String,
      trim: true,
      default: "Unknown",
    },
    publicationDate: {
      type: Date,
      default: null,
    },
    retrievalDate: {
      type: Date,
      default: Date.now,
    },
    snippet: {
      type: String,
      trim: true,
      default: "",
    },
    domainTrust: {
      type: String,
      enum: [
        "Official Gazette",
        "Statutory Election Body",
        "Recognized News Media",
        "Fact-Checking Organization",
        "Public Forum",
        "Unknown",
      ],
      default: "Unknown",
    },
    reliabilityScore: {
      type: Number,
      min: 0,
      max: 1,
      default: null, // Left null unless verified by human expert or authoritative domain registry
    },
  },
  {
    _id: true,
    timestamps: false,
  }
);

export const EvidenceSource = mongoose.model(
  "EvidenceSource",
  EvidenceSourceSchema
);
export default EvidenceSource;
