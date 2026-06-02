export interface Env {
  DB: D1Database;
  IMAGES: R2Bucket;
  KV_CACHE: KVNamespace;
  JWT_SECRET: string;
  LINE_CHANNEL_ID: string;
  LINE_CHANNEL_SECRET: string;
  LINE_CHANNEL_ACCESS_TOKEN: string;
  ENVIRONMENT: string;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  lineUserId?: string;
  timezone: string;
  language: string;
  createdAt: string;
  updatedAt: string;
}

export interface Cat {
  id: string;
  userId: string;
  name: string;
  gender?: 'M' | 'F';
  breed?: string;
  dateOfBirth?: string;
  weightKg?: number;
  healthStatus: 'normal' | 'treating' | 'caution';
  microchipId?: string;
  photoUrl?: string;
  chronicDiseases?: string;
  drugAllergies?: string;
  forbiddenFoods?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vaccination {
  id: string;
  catId: string;
  vaccineName: string;
  vaccinationDate: string;
  expirationDate?: string;
  clinicName?: string;
  veterinarianName?: string;
  lotNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface MedicalHistory {
  id: string;
  catId: string;
  recordDate: string;
  type: 'illness' | 'injury' | 'checkup' | 'surgery';
  symptoms?: string;
  diagnosis?: string;
  clinicName?: string;
  veterinarianName?: string;
  treatmentDate?: string;
  cost?: number;
  treatmentResult?: string;
  createdAt: string;
}

export interface Medication {
  id: string;
  catId: string;
  medicineName: string;
  dosage?: string;
  frequency?: string;
  route?: 'oral' | 'liquid' | 'topical' | 'injection';
  startDate: string;
  endDate?: string;
  purpose?: string;
  sideEffects?: string;
  isActive: boolean;
  createdAt: string;
}

export interface DietInfo {
  id: string;
  catId: string;
  foodName: string;
  foodType: 'dry' | 'wet' | 'mixed';
  portionSize?: number;
  unit?: 'g' | 'ml' | 'cup';
  frequencyPerDay?: number;
  isMainFood: boolean;
  createdAt: string;
}

export interface FeedingSchedule {
  id: string;
  catId: string;
  timeOfDay: string;
  dietId?: string;
  isEnabled: boolean;
  notificationEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  catId?: string;
  type: 'vaccine' | 'medication' | 'checkup' | 'diet' | 'reminder';
  title: string;
  message: string;
  status: 'pending' | 'sent' | 'failed';
  scheduledDate: string;
  sentDate?: string;
  createdAt: string;
}

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
