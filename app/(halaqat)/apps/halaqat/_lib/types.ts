export type Role = "admin" | "teacher";
export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export type Profile = {
  id: string;
  full_name: string;
  role: Role;
  phone: string | null;
  active: boolean;
};

export type Halaqa = {
  id: number;
  name: string;
  teacher_id: string | null;
  schedule: string | null;
  location: string | null;
  active: boolean;
};

export type Student = {
  id: number;
  full_name: string;
  halaqa_id: number | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  birth_date: string | null;
  joined_on: string;
  active: boolean;
  notes: string | null;
};

export type Attendance = {
  id: number;
  student_id: number;
  halaqa_id: number;
  day: string;
  status: AttendanceStatus;
  note: string | null;
};

/** Result returned by form server actions to show feedback. */
export type FormState = { error?: string; ok?: string } | undefined;
