"use client";
import { PropsWithChildren, useEffect, useState } from "react";

import FullScreenLoading from "@/components/full-screen-loading";
import { createClient } from "@/lib/supabase/client";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { User } from "@supabase/supabase-js";

const LayoutWrapper = dynamic(() => import("./_components/layout-wrapper"), {
  ssr: false,
  loading: () => <FullScreenLoading />,
});

export default function MainLayout({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        console.log("No User Found:", error.message);
      } else {
        setUser(user);
      }
      setIsLoading(false);
    };

    fetchUser();
  }, []);

  if (isLoading) return <FullScreenLoading />;

  if (!user) return redirect("/login");

  if (!user.user_metadata.firstname) return redirect("/complete-profile");

  return <LayoutWrapper currentUser={user}>{children}</LayoutWrapper>;
}
