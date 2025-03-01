import { ProfileForm } from "../complete-profile/_components/ProfileForm";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/client"; // Adjust path according to your project

export default async function ProfileRootPage() {
  const supabase = createClient();
  // Fetch the session data asynchronously from Supabase
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Check if user has the necessary profile information
  if (
    session?.user?.user_metadata?.firstname &&
    session?.user?.user_metadata?.lastname
  ) {
    // Redirect to the /documents page if user information is complete
    redirect("/documents");
  }

  // If user info is incomplete, return the ProfileForm
  return <ProfileForm />;
}
