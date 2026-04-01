import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import crypto from 'node:crypto';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Le nom est requis'],
      trim: true,
      maxLength: [50, 'Le nom ne peut pas dépasser 50 caractères'],
    },
    email: {
      type: String,
      required: [true, "L'adresse e-mail est requise"],
      unique: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Veuillez fournir une adresse e-mail valide',
      ],
    },
    password: {
      type: String,
      required: false,
      select: false,
      minLength: [8, 'Le mot de passe doit comporter au moins 8 caractères'],
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S+$/,
        'Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial',
      ],
    },
    role: {
      type: String,
      default: 'Étudiant',
      enum: ['Étudiant', 'Enseignant', 'Admin'],
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    activationToken: String,
    activationTokenExpire: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
    department: {
      type: String,
      trim: true,
      default: null,
    },
    expertises: {
      type: [String],
      default: [],
    },
    maxStudents: {
      type: Number,
      default: 10,
      min: [1, "Le nombre maximum d'étudiants doit être au moins 1"],
    },
    assignedStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
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

userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  if (!this.password) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

userSchema.methods.getActivationToken = function () {
  const activationToken = crypto.randomBytes(20).toString('hex');

  this.activationToken = crypto
    .createHash('sha256')
    .update(activationToken)
    .digest('hex');

  this.activationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 heures

  return activationToken;
};

export const User = mongoose.model('User', userSchema);
