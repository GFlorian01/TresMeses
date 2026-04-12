// Tipos TypeScript que mapean a las tablas de Supabase

export type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface Cycle {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  goals: string[];
  is_active: boolean;
  created_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface DailyEntry {
  id: string;
  user_id: string;
  date: string;
  is_gym_day: boolean;
  is_recovery_day: boolean;
  reading_minutes: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface HabitCheck {
  id: string;
  daily_entry_id: string;
  habit_id: string;
  completed: boolean;
  created_at: string;
}

export interface MealEntry {
  id: string;
  daily_entry_id: string;
  meal_type: MealType;
  completed: boolean;
  description: string | null;
  created_at: string;
}

export interface WeeklyReview {
  id: string;
  user_id: string;
  cycle_id: string;
  week_number: number;
  score: number | null;
  reflection: string | null;
  cause_analysis: string | null;
  load_adjustment: string | null;
  created_at: string;
  updated_at: string;
}

// Tipos extendidos para queries con joins
export interface DailyEntryWithRelations extends DailyEntry {
  habit_checks: (HabitCheck & { habit: Habit })[];
  meal_entries: MealEntry[];
}
