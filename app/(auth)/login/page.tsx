import { AuthForm } from "@/app/(auth)/_components/AuthForm";

export default function LoginPage() {
  return (
    <div className="flex justify-center items-start w-full  px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-black dark:border-gray-500 dark:border-2">
      <div className="w-full max-w-md space-y-2">
        <AuthForm Logintype="login" />
      </div>
    </div>
  );
}
