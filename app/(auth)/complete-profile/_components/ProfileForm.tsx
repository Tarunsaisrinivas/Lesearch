"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from "next/image";
import { MdChangeCircle } from "react-icons/md";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import FullScreenLoading from "../../../../components/full-screen-loading";
import { User } from "@supabase/supabase-js";

type UserUpdateData = {
  data: {
    firstname: string;
    lastname: string;
    image: string;
  };
  password?: string; // Optional, only added if the user is updating the password
};

export function ProfileForm() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileImage, setProfileImage] = useState<string>("");
  const [imageFile, setImagefile] = useState<File>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const hasGoogleProvider = user?.app_metadata?.provider === "google";
  const hasEmailProvider = user?.app_metadata?.provider === "email";

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        console.error("No User Found:", error.message);
        setError("Failed to fetch user data.");
      } else if (user) {
        // Initialize user metadata
        setUser(user);
        setEmail(user?.email || "");
        setFirstName(user?.user_metadata?.firstname || "");
        setLastName(user?.user_metadata?.lastname || "");
        setProfileImage(
          user?.user_metadata?.picture ||
            `https://api.multiavatar.com/${Math.floor(Math.random() * 1000000)}.svg`,
        );
      }
      setIsLoading(false);
    };

    fetchUser();
  }, []);

  const uploadToSupabaseStorage = async (
    file: File,
  ): Promise<string | null> => {
    const supabase = createClient();

    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(`images/${email}`, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error("Failed to upload image:", error.message);
      setError("Failed to upload image.");
      return null;
    }

    const { data: avatar } = supabase.storage
      .from("avatars")
      .getPublicUrl(data.path);
    return avatar.publicUrl;
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setImagefile(file); // Optional chaining in case no file is selected
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setProfileImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const validatePassword = (password: string) => {
    // Regular expression to validate password: 8+ characters, at least 1 lowercase, 1 uppercase, and 1 digit
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (
      !hasEmailProvider &&
      !validatePassword(password) &&
      !validatePassword(confirmPassword)
    ) {
      setError(
        "Password must contain at least 8 characters, 1 lowercase letter, 1 uppercase letter, and 1 digit.",
      );
      return;
    }
    if (password && password !== confirmPassword) {
      setError("Passwords must match");
      return;
    }

    let imageurl;
    if (imageFile) {
      imageurl = await uploadToSupabaseStorage(imageFile);
    } else {
      imageurl = profileImage;
    }
    try {
      const supabase = createClient();

      const userUpdateData: UserUpdateData = {
        data: {
          firstname: firstName,
          lastname: lastName,
          image: imageurl || "",
        },
      };

      if (!hasEmailProvider && hasGoogleProvider) {
        userUpdateData.password = password; // Add the password only if the user signed up with Google and password is provided
      }

      const { error } = await supabase.auth.updateUser(userUpdateData);

      if (error) {
        throw new Error(error.message);
      }
      router.replace("/documents");
    } catch (error) {
      console.error("Error updating user:", error);
      setError("Error updating user profile.");
    } finally {
      setLoading(false);
    }
  };

  const changeRanPic = () => {
    const seed = Math.floor(Math.random() * 1000000);
    setProfileImage(`https://api.multiavatar.com/${seed}.svg`);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (isLoading) {
    return <FullScreenLoading />;
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900">
        Complete Your Profile
      </h2>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="flex relative gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
        {hasGoogleProvider && !hasEmailProvider && (
          <div className="relative">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 mb-2"
            />
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="current-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1"
            />
          </div>
        )}
        <div className="flex justify-center items-center gap-4">
          {profileImage && (
            <div className="w-fit h-fit">
              <Image
                src={profileImage}
                alt="Profile"
                height={150}
                width={150}
                objectFit="contain"
              />
              <Button onClick={changeRanPic} type="button">
                Change
                <MdChangeCircle />
              </Button>
            </div>
          )}
          <div>
            <Label htmlFor="image">Profile Picture</Label>
            <Input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
            />
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Submitting..." : "Complete Profile"}
        </Button>
      </form>
    </div>
  );
}
