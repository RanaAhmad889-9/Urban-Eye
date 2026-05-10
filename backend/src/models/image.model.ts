import mongoose, { Document, Schema } from 'mongoose';

export interface IImage extends Document {
  userId?: mongoose.Types.ObjectId;
  imageUrl: string;
  highlightedImageUrl?: string;   // path to saved highlighted PNG
  isSatellite: boolean;
  buildingCount: number;
  createdAt: Date;
}

const ImageSchema = new Schema<IImage>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    imageUrl: { type: String, required: true },
    highlightedImageUrl: { type: String, default: null },
    isSatellite: { type: Boolean, required: true },
    buildingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IImage>('Image', ImageSchema);
