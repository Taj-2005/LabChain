import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVerification extends Document {
  experimentId: mongoose.Types.ObjectId;
  hash: string; // Cryptographic hash of experiment results
  signature: string; // ECDSA signature
  publicKey: string; // Public key used for verification
  timestamp: Date;
  createdBy: mongoose.Types.ObjectId;
  blockchainTxHash?: string; // Optional: on-chain transaction hash
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const VerificationSchema = new Schema<IVerification>(
  {
    experimentId: {
      type: Schema.Types.ObjectId,
      ref: "Experiment",
      required: true,
      index: true,
    },
    hash: {
      type: String,
      required: true,
      index: true,
    },
    signature: {
      type: String,
      required: true,
    },
    publicKey: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    blockchainTxHash: {
      type: String,
      sparse: true, // Optional field
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
VerificationSchema.index({ experimentId: 1, timestamp: -1 });
VerificationSchema.index({ hash: 1 });

const Verification: Model<IVerification> =
  mongoose.models.Verification ||
  mongoose.model<IVerification>("Verification", VerificationSchema);

export default Verification;
