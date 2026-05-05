import mongoose from 'mongoose';

const deadlineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Le nom/titre de la deadline est requis'],
      trim: true,
      maxlength: [
        100,
        'Le nom/titre de la deadline ne peut pas dépasser 100 caractères',
      ],
    },
    dueDate: {
      type: Date,
      required: [true, "La date d'échéance est requise"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'La deadline doit être associée à un utilisateur'],
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

deadlineSchema.index({ dueDate: 1 });
deadlineSchema.index({ project: 1 });
deadlineSchema.index({ createdBy: 1 });

export const Deadline =
  mongoose.models.Deadline || mongoose.model('Deadline', deadlineSchema);
