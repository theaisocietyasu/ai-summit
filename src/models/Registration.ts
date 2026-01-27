import { ObjectId } from 'mongodb';

export type AcademicYear = 'Freshman' | 'Sophomore' | 'Junior' | 'Senior' | "Master's" | 'PhD' | 'Staff';

export interface Registration {
  _id?: ObjectId;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  email: string;
  academic_year: AcademicYear;
  major?: string;
  field_of_study?: string;
  why_attend?: string;
  resume?: string;
  photo_release: boolean;
  relevant_courses?: string[];
  prior_work_exp?: string;
  is_waitlisted: boolean;
  is_approved: boolean;
  is_rejected: boolean;
  created_at: number;
  updated_at: number;
}
