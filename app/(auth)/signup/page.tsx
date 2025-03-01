import { AuthForm } from "@/app/(auth)/_components/AuthForm";

export default function SignUpPage() {
  return (
    <div className="flex justify-center items-start w-full  px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-2">
        <AuthForm Logintype="signup" />
      </div>
    </div>
  );
}
