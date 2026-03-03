export type Interest = "STEM" | "Arts" | "Sports" | "Coding" | "Outdoor" | "Cooking" | "Music" | "Robotics";

export interface ChildProfile {
  id: string;
  name: string; // Internal name/alias (no PII required, can be "Child 1")
  grade: number;
  age: number;
  interests: Interest[];
  pastFavorites: string;
}

export interface Camp {
  id: string;
  name: string;
  location: string;
  zipCode: string;
  description: string;
  weeks: number[]; // 1-10 corresponding to June-August
  ageRange: { min: number; max: number };
  price: number;
  tags: string[];
  website?: string;
}

export interface ScheduleEntry {
  childId: string;
  campId: string;
  weekIndex: number; // 0-9
}

export interface AppState {
  zipCode: string;
  children: ChildProfile[];
  blackoutWeeks: number[]; // 0-9
  schedule: ScheduleEntry[];
  uploadedCamps: Camp[];
}
