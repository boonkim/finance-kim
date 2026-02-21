import mongoose, { Schema, model, models } from 'mongoose';

export interface IUser {
  _id: mongoose.Types.ObjectId;
  email: string;
  name?: string | null;
  image?: string | null;
  emailVerified?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: { type: String, default: null, trim: true },
    image: { type: String, default: null },
    emailVerified: { type: Date, default: null },
  },
  { timestamps: true }
);

// Schema validation: ต้องมีการตรวจสอบ Data Integrity ก่อนบันทึก (ตาม rules)
UserSchema.pre('save', function (next) {
  if (this.email && typeof this.email === 'string') {
    this.email = this.email.trim().toLowerCase();
  }
  next();
});

const User = models.User ?? model<IUser>('User', UserSchema);
export default User;
