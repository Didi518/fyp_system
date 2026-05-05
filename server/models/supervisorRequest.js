import mongoose from 'mongoose';

const supervisorRequestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [
        true,
        'Une demande de supervision doit être associée à un étudiant',
      ],
    },
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Le superviseur est requis'],
    },
    message: {
      type: String,
      required: [true, 'Le message de la demande est requis'],
      trim: true,
      maxlength: [
        250,
        'Le message de la demande ne peut pas dépasser 250 caractères',
      ],
    },
    status: {
      type: String,
      default: 'pending',
      enum: ['pending', 'accepted', 'rejected'],
    },
  },
  {
    timestamps: true,
  },
);

supervisorRequestSchema.index({ student: 1 });
supervisorRequestSchema.index({ supervisor: 1 });
supervisorRequestSchema.index({ status: 1 });
supervisorRequestSchema.index(
  { student: 1, supervisor: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'pending' },
  },
);

export const SupervisorRequest =
  mongoose.models.SupervisorRequest ||
  mongoose.model('SupervisorRequest', supervisorRequestSchema);
