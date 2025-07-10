import { z } from "zod/v4";

export const formSchema = z.object({
  "first-name": z.string().min(1, { message: "This field is required" }),
  "second-name": z.string().min(1, { message: "This field is required" }),
  age: z
    .number({ error: "This field must be a number" })
    .min(1, { message: "This field is required" })
    .gte(6, { message: "Must be greater than or equal to  6" })
    .lte(17, { message: "Must be less than or equal to 17" }),
});
