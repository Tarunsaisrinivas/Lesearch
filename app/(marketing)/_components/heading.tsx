"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Spinner } from "@/components/spinner";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

export const Heading = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
    };

    fetchUser();
  }, []);

  return (
    <div className="mb-16 max-w-4xl text-center select-none">
      <h1 className="mb-3 text-3xl font-bold md:mb-5 md:text-5xl">
        Your💡
        <span className="bg-gradient-to-r from-amber-500 via-orange-600 to-yellow-500 bg-clip-text text-transparent underline">
          ideas
        </span>
        , 📚{" "}
        <span className="bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-500 bg-clip-text text-transparent underline ">
          docs
        </span>
        , <br /> & 🎯{" "}
        <span className="bg-gradient-to-r from-rose-500 via-orange-600 to-red-500 bg-clip-text text-transparent underline ">
          projects
        </span>
        . Together.
      </h1>

      <p className="mb-3 font-medium md:text-xl">
        LeSearch is the AI-driven platform to explore, <br /> summarize, and
        optimize research papers.
      </p>

      {isLoading ? (
        <div className="w-full flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : user ? (
        <Button asChild>
          <Link href="/documents">
            View Dashboard
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      ) : (
        <Button>
          <Link href="/login">Get Started</Link>
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      )}
    </div>
  );
};
