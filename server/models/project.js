import mongoose from 'mongoose';

import { ACTIVE_STATUSES } from '../constants/constants.js';

const feedbackSchema = new mongoose.Schema(
  {
    supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['positive', 'negative', 'general'] },
    title: String,
    message: String,
  },
  { timestamps: true },
);

const projectSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },

    status: {
      type: String,
      enum: [...ACTIVE_STATUSES, 'rejected', 'completed', 'failed', 'archived'],
      default: 'pending',
    },

    archivedAt: { type: Date, default: null },

    files: [
      {
        fileType: String,
        fileUrl: String,
        originalName: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    feedback: [feedbackSchema],

    deadline: Date,
  },
  { timestamps: true },
);

projectSchema.index({ student: 1, status: 1 });
projectSchema.index({ supervisor: 1, status: 1 });

export const Project =
  mongoose.models.Project || mongoose.model('Project', projectSchema);
