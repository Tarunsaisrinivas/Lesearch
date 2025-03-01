import { getErrorMessage } from "@/helper/error.helper";
import { createClient } from "@/lib/supabase/client";
import { toastError, toastLoading, toastSuccess } from "@/components/toast";
import { type SignOut, type User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { create } from "zustand";

type UserState = {
  currentUser: User | null;
  username: string | null;
  fullname: string | null;
  image: string | null;
};

type UserAction = {
  reset: () => void;

  setCurrentUser: (user: User) => void;

  setProfile: (opt: {
    username: string | null;
    fullname: string | null;
    image: string | null;
  }) => void;

  signOutAsync: (scope?: SignOut["scope"]) => Promise<{ error: string } | void>;

  updatePasswordAsync(password: string): Promise<{ error: string } | void>;

  getCurrentUserAsync: () => Promise<{ error: string } | void>;

  getCurrentProfileUserAsync: () => Promise<void>;

  updateProfileAsync(opt: {
    fullname: string;
    username: string;
    image: string;
  }): Promise<{ error: string } | void>;

  updateEmailAsync(email: string): Promise<{ error: string } | void>;

  updateEmailVerifyAsync(opt: {
    token: string;
    email: string;
  }): Promise<{ error: string } | void>;
};

const initialState: UserState = {
  currentUser: null,
  username: null,
  fullname: null,
  image: null,
};

export const useUserStore = create<UserState & UserAction>()((set, get) => ({
  ...initialState,

  setCurrentUser: (user) => set({ currentUser: user }),

  reset: () => set(initialState),

  setProfile: ({ username, fullname, image }) =>
    set({ username, fullname, image }),
  async updatePasswordAsync(password) {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw new Error(error.message);

      toastSuccess({ description: "Password has been changed successfully." });
    } catch (error) {
      return { error: getErrorMessage(error as Error) };
    }
  },

  async signOutAsync(scope = "local") {
    const message = {
      success: {
        local: "Successfully logged out.",
        global: "Successfully logged out all device",
        others: "Successfully logged out other device",
      },
      error: {
        local: "Something went wrong! Failed to log out",
        global: "Something went wrong! Failed to log out all device",
        others: "Something went wrong! Failed to log out other device",
      },
    };
    const id = toast("signOut");
    toastLoading({ description: "Logging out...", id });

    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.signOut({ scope });
      if (error) throw new Error(error.message);
      toastSuccess({ description: message.success[scope], id });
      window.location.reload();
    } catch (error) {
      console.log(error);
      toastError({ description: message.error[scope], id });
      return { error: message.error[scope] };
    }
  },

  async getCurrentProfileUserAsync() {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.getUser();
      if (error) throw new Error(error.message);
      set({
        fullname: data.user
          ? data.user.user_metadata.firstname +
            " " +
            data.user.user_metadata.lastname
          : null,
        username: data.user ? data.user.email?.split("@")[0] : null,
        image: data.user
          ? data.user.user_metadata.image || data.user.user_metadata.picture
          : null,
      });
    } catch (error) {
      console.log(error);
      toastError({ description: "Failed to get user profile!" });
    }
  },

  async getCurrentUserAsync() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();
      if (error) throw new Error(error.message);
      set({ currentUser: data.user });
    } catch (error) {
      console.log(error);
      const message = "Something went wrong. Please reload or try login again.";
      toastError({ description: message });
      return { error: message };
    }
  },

  async updateProfileAsync(opt) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("profiles")
        .upsert(opt, { onConflict: "user_id" })
        .select(`username, fullname`)
        .single();

      if (!error) {
        set({ username: data.username, fullname: data.fullname });
        toastSuccess({ description: "Profile has been changed successfully." });
        return;
      }

      throw new Error(
        error.message.includes("profiles_username_key")
          ? "Username is not available."
          : error.message,
      );
    } catch (error) {
      return { error: getErrorMessage(error as Error) };
    }
  },

  async updateEmailAsync(email) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.updateUser({ email });
      if (error) throw new Error(error.message);
    } catch (error) {
      return { error: getErrorMessage(error as Error) };
    }
  },

  async updateEmailVerifyAsync(opt) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.verifyOtp({
        ...opt,
        type: "email_change",
      });
      if (error) throw new Error(error.message);

      let currentUser = get().currentUser;

      currentUser = currentUser ? { ...currentUser, email: opt.email } : null;
      set({ currentUser });

      toastSuccess({ description: "Email has been changed successfully." });
    } catch (error) {
      return { error: getErrorMessage(error as Error) };
    }
  },
}));
