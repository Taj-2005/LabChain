import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExperiment extends Document {
  owner: mongoose.Types.ObjectId;
  title: string;
  protocol: Record<string, unknown>; // JSON protocol structure
  attachments: mongoose.Types.ObjectId[];
  versions: Array<{
    version: number;
    protocol: Record<string, unknown>;
    createdAt: Date;
    notes?: string;
  }>;
  status: "draft" | "active" | "completed" | "archived";
  replicationAttempts: Array<{
    attemptId: string;
    experimenter: mongoose.Types.ObjectId;
    startedAt: Date;
    completedAt?: Date;
    results?: Record<string, unknown>;
    notes?: string;
  }>;
  version: number; // Current version number for conflict resolution
  createdAt: Date;
  updatedAt: Date;
}

const ExperimentSchema = new Schema<IExperiment>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    protocol: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
    attachments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Attachment",
      },
    ],
    versions: [
      {
        version: { type: Number, required: true },
        protocol: { type: Schema.Types.Mixed, required: true },
        createdAt: { type: Date, default: Date.now },
        notes: String,
      },
    ],
    status: {
      type: String,
      enum: ["draft", "active", "completed", "archived"],
      default: "draft",
    },
    replicationAttempts: [
      {
        attemptId: { type: String, required: true },
        experimenter: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        startedAt: { type: Date, default: Date.now },
        completedAt: Date,
        results: Schema.Types.Mixed,
        notes: String,
      },
    ],
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
ExperimentSchema.index({ owner: 1, createdAt: -1 });
ExperimentSchema.index({ status: 1 });

const Experiment: Model<IExperiment> =
  mongoose.models.Experiment ||
  mongoose.model<IExperiment>("Experiment", ExperimentSchema);

export default Experiment;
