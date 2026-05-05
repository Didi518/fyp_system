import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Une notification doit être associée à un utilisateur'],
    },
    message: {
      type: String,
      required: [true, 'Une notification doit contenir un message'],
      trim: true,
      maxlength: [
        1000,
        'Le message de la notification ne peut pas dépasser 1000 caractères',
      ],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      enum: [
        'request',
        'approval',
        'rejection',
        'feedback',
        'deadline',
        'general',
        'meeting',
        'system',
      ],
      default: 'general',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low',
    },
  },
  {
    timestamps: true,
  },
);

notificationSchema.index({ user: 1, isRead: -1 });

export const Notification =
  mongoose.models.Notification ||
  mongoose.model('Notification', notificationSchema);
