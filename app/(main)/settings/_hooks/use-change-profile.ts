import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useUserStore } from "@/store/use-user-store"
import { useRef } from "react"
import { z } from "zod"

// Define the profile schema
const profileSchema = z.object({
  fullname: z.string().min(2, "Full name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
})

type ProfileSchema = z.infer<typeof profileSchema>

export const useChangeProfile = () => {
  const {  fullname, username } = useUserStore()
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)

  const form = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullname: fullname ?? "",
      username: username ?? "",
    },
  })

  const submitHandler = form.handleSubmit(async ({ fullname, username }) => {
    // try {
    //   const res = await updateProfileAsync({ username, fullname })
    //   if (res?.error) {
    //     form.setError("root.serverError", { message: res.error })
    //   } else {
    //     closeButtonRef.current?.click()
    //   }
    // } catch (error) {
    //   form.setError("root.serverError", {
    //     message: "An unexpected error occurred. Please try again.",
    //   })
    // }
    console.log(fullname, username)
  })

  const resetFormHandler = () => {
    form.reset()
    form.clearErrors()
  }

  return {
    errors: form.formState.errors,
    isLoadingSubmit: form.formState.isSubmitting,
    resetFormHandler,
    submitHandler,
    form,
    closeButtonRef,
  }
}

