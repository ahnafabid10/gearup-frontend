// Shared fields returned by list endpoints and their nested relations.
// Screens should treat optional fields as unavailable until the API supplies them.
export type GearRecord = {
  id: string;
  title?: string;
  name?: string;
  slug?: string;
  isActive?: boolean;
  reviewNote?: string;
  _count?: { gearItems?: number };
  email?: string;
  role?: string;
  status?: string;
  dailyPrice?: number;
  depositAmount?: number;
  totalAmount?: number;
  amount?: number;
  brand?: string;
  description?: string;
  categoryId?: string;
  totalStock?: number;
  availableStock?: number;
  isAvailable?: boolean;
  images?: string[];
  specifications?: Record<string, string>;
  category?: GearRecord;
  provider?: GearRecord;
  gear?: GearRecord;
  rentalOrder?: GearRecord;
  customer?: GearRecord;
  review?: GearRecord;
  rating?: number;
  comment?: string;
  reviews?: GearRecord[];
  startDate?: string;
  endDate?: string;
  createdAt?: string;
};

export type ApiResult = {
  data: GearRecord[] | GearRecord | { data: GearRecord[] };
  meta?: { total?: number; totalPage?: number };
  message?: string;
};
