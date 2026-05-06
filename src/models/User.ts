import mongoose, { Schema, Model, Document } from "mongoose";
import bcrypt from "bcryptjs";
import { IUser } from "@/types";

export interface IUserDocument extends Omit<IUser, "_id">, Document {
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 60,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // never returned by default
    },
    role: {
      type: String,
      enum: ["user", "admin", "staff"],
      default: "user",
    },
    department: {
      type: String,
      enum: ["IT", "Electrical", "Maintenance", "Cleaning", "General"],
      default: undefined,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// ─── Pre-save: Hash password ──────────────────────────────────────────────────

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// ─── Instance Method: Compare password ───────────────────────────────────────

UserSchema.methods.comparePassword = async function (
  candidate: string,
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

// ─── toJSON: Strip sensitive fields ──────────────────────────────────────────

UserSchema.set("toJSON", {
  transform(_doc, ret: Partial<IUserDocument>) {
    delete ret.password;
    return ret;
  },
});

const User: Model<IUserDocument> =
  mongoose.models.User ?? mongoose.model<IUserDocument>("User", UserSchema);

export default User;
