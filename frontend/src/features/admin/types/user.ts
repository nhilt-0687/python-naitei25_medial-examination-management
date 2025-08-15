export interface AuthUser {
  userId: number;
  name: string;
  email: string;
  phone: string;
  role: "DOCTOR" | "ADMIN" | "RECEPTIONIST" | "PATIENT";
  createdAt: string;
}
