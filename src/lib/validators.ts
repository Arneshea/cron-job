import { z } from "zod";
import { validateCronExpression } from "./scheduling";

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const jobSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional().or(z.literal("")),
  schedule: z.string().min(1, "Schedule is required").refine(
    (val) => validateCronExpression(val) === null,
    (val) => ({ message: validateCronExpression(val) ?? "Invalid schedule" })
  ),
  graceMinutes: z.coerce.number().int().min(1).max(1440),
  alertWebhookUrl: z
    .string()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),
  alertEmail: z.string().email("Enter a valid email").optional().or(z.literal("")),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type JobInput = z.infer<typeof jobSchema>;
