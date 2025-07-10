"use server";

import { formSchema } from "@/schemas/student";
import z from "zod/v4";

export const serverAction = async (values: z.infer<typeof formSchema>) => {
  console.log(values);
};

export const addStudent = async () => {}
