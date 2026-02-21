import mongoose, { Schema, model, models } from 'mongoose';

export type CategoryType = 'income' | 'expense';

export interface ICategory {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  type: CategoryType;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ['income', 'expense'],
    },
  },
  { timestamps: true }
);

CategorySchema.index({ userId: 1, type: 1 });

const Category = models.Category ?? model<ICategory>('Category', CategorySchema);
export default Category;
