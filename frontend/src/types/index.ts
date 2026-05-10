export interface ImageRecord {
  _id: string;
  userId?: string;
  imageUrl: string;
  highlightedImageUrl?: string | null;
  isSatellite: boolean;
  buildingCount: number;
  createdAt: string;
}

export interface UserRecord {
  _id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}
