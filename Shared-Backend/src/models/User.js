import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/environment.js";
import { USER_ROLES, USER_ROLES_LIST } from "../config/constants.js";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/u,
        "Please enter a valid email address",
      ],
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Exclude from query results by default for security
    },
    role: {
      type: String,
      enum: {
        values: USER_ROLES_LIST,
        message: "Invalid user role",
      },
      default: USER_ROLES.USER,
      index: true,
    },
    accountStatus: {
      type: String,
      enum: ["Active", "Suspended", "Pending"],
      default: "Active",
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    authProvider: {
      type: String,
      enum: ["local", "google", "facebook"],
      default: "local",
    },
    providerId: {
      type: String,
      default: null,
      index: true,
    },
    preferences: {
      preferredLanguage: {
        type: String,
        default: "English",
      },
      theme: {
        type: String,
        enum: ["Light", "Dark", "System"],
        default: "System",
      },
      notifications: {
        emailNotifications: {
          type: Boolean,
          default: true,
        },
        resultNotifications: {
          type: Boolean,
          default: true,
        },
        announcementNotifications: {
          type: Boolean,
          default: false,
        },
      },
    },
    joinedDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Hash password before saving if modified
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method to compare plain password with hash
UserSchema.methods.comparePassword = async function (candidatePassword) {
  if (!candidatePassword || !this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate signed JWT token
UserSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role,
      name: this.name,
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN,
    }
  );
};

export const User = mongoose.model("User", UserSchema);
export default User;
