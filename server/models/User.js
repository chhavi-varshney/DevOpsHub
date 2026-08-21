import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 3,
      maxlength: 50,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["admin", "teamlead", "developer"],
      default: "developer",
    },

    avatar: {
      type: String,
      default: "",
    },
    
    githubId: {
      type: String,
      default: "",
    },

    githubUsername: {
      type: String,
      default: "",
    },

    githubAccessToken: {
      type: String,
      default: "",
      select: false,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {
      type: String,
      default: "",
    },

    resetPasswordExpire: {
      type: Date,
    },
  },
  
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;