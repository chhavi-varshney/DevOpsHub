import mongoose from "mongoose";

const deploymentSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    environment: {
      type: String,
      enum: ["Development", "Staging", "Production"],
      required: true,
    },

    status: {
      type: String,
      enum: ["Success", "Failed"],
      required: true,
    },

    deployedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    deployedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Deployment = mongoose.model(
  "Deployment",
  deploymentSchema
);

export default Deployment;