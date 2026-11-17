import { z } from "zod";

export const employeeSchema = z.object({
  name: z.string().min(2),
  role: z.string().min(2),
  salary: z.coerce.number().nonnegative().optional(),
  phone: z.string().optional()
});

export const attendanceSchema = z.object({
  date: z.coerce.date(),
  status: z.enum(["PRESENT", "ABSENT", "LEAVE"])
});
