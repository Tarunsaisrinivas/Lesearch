import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUserStore } from "@/store/use-user-store";
import { useRef } from "react";

// Define Zod schema for validation
const ResetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string().min(8, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // Apply error to confirmPassword field
  });

// Define the TypeScript type based on the schema
type ResetPasswordFormType = z.infer<typeof ResetPasswordSchema>;

export const useResetPassword = () => {
  const { updatePasswordAsync } = useUserStore();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const form = useForm<ResetPasswordFormType>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" }, // Ensure default values are always defined
    mode: "onChange", // Helps with validation feedback
  });

  const submitHandler = form.handleSubmit(async ({ password }) => {
    const res = await updatePasswordAsync(password);

    if (res?.error) form.setError("root.apiError", { message: res.error });
    else closeButtonRef.current?.click();
  });

  const resetFormHandler = () => {
    form.reset();
    form.clearErrors(["password", "confirmPassword"]);
  };

  return {
    form,
    errors: form.formState.errors,
    isLoadingSubmit: form.formState.isSubmitting,
    submitHandler,
    resetFormHandler,
    closeButtonRef,
  };
};
