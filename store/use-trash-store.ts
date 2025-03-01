import { toastError } from "@/components/toast";
import { createClient } from "@/lib/supabase/client";
import { type Database } from "@/lib/supabase/database.types";
import { create } from "zustand";

type Page = Database["public"]["Tables"]["pages"]["Row"];
type List = Pick<
  Page,
  "title" | "emoji" | "created_at" | "updated_at" | "uuid" | "is_deleted"
>;

interface TrashState {
  list: List[] | null;
  loading: boolean;
  prevKeyword: string | null;
  nextPage: number;
  size: number;
  more: boolean;
}

interface TrashActions {
  getTrashAsync(keyword?: string | null): Promise<void>;
  nextPageAsync(): Promise<void>;
  deletePagePermanent(uuid: string): Promise<void>;
  restorePageAsync(uuid: string): Promise<void>;
}

const initialState: TrashState = {
  list: null,
  loading: false,
  prevKeyword: null,
  nextPage: 1,
  size: 10,
  more: false,
};

export const useTrashStore = create<TrashState & TrashActions>()(
  (set, get) => ({
    ...initialState,

    async getTrashAsync(keyword) {
      const prevKeyword = get().prevKeyword;
      const isNewKeyword = keyword
        ? prevKeyword !== keyword.trim().toLowerCase()
        : true;
      if (!isNewKeyword) return;

      const page = 1;
      const size = get().size;
      const start = page * size - size;
      const end = page * size - 1;

      set({ loading: true, list: null });

      try {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();
        let query = supabase
          .from("pages")
          .select("title, emoji, created_at, updated_at, uuid, is_deleted")
          .eq("user_id", userData.user?.id)
          .eq("is_deleted", true);

        if (keyword) query = query.ilike("title", `%${keyword}%`);

        const { data, error } = await query
          .range(start, end)
          .order("created_at", { ascending: false });
        if (error) throw new Error(error.message);

        set({
          loading: false,
          list: [...data],
          more: data.length === size,
          prevKeyword: keyword ? keyword.trim().toLowerCase() : null,
          nextPage: page + 1,
        });
      } catch (error) {
        set({ loading: false });
        console.log(error);
        toastError({ description: "An error occurred getTrash" });
      }
    },

    async nextPageAsync() {
      try {
        const size = get().size;
        const page = get().nextPage;

        const start = page * size - size;
        const end = page * size - 1;
        set({ loading: true });
        const supabase = createClient();
        let query = supabase
          .from("pages")
          .select("title, emoji, created_at, updated_at, uuid, is_deleted")
          .eq("is_deleted", true);

        if (get().prevKeyword)
          query = query.ilike("title", `%${get().prevKeyword}%`);

        const { data, error } = await query
          .range(start, end)
          .order("created_at", { ascending: false });

        if (error) throw new Error(error.message);
        const prevList = get().list;

        set({
          loading: false,
          more: data.length === size,
          list: prevList ? [...prevList, ...data] : [...data],
          nextPage: page + 1,
        });
      } catch (error) {
        set({ loading: false });
        console.log(error);
        toastError({ description: "Error" });
      }
    },

    async deletePagePermanent(uuid) {
      try {
        const supabase = createClient();

        // First, recursively delete all children
        const deleteChildren = async (parentUuid: string) => {
          const { data: children, error: fetchError } = await supabase
            .from("pages")
            .select("uuid")
            .eq("parent_uuid", parentUuid);

          if (fetchError) throw new Error(fetchError.message);

          for (const child of children || []) {
            await deleteChildren(child.uuid);
            await supabase.from("pages").delete().eq("uuid", child.uuid);
          }
        };

        // Delete children first
        await deleteChildren(uuid);
        const { error } = await supabase
          .from("pages")
          .delete()
          .eq("uuid", uuid);
        if (error) throw new Error(error.message);

        const list = get().list;
        set({ list: list ? list.filter((i) => i.uuid !== uuid) : null });
      } catch (error) {
        console.log(error);
        toastError({ description: "Error Deleting page" });
      }
    },

    async restorePageAsync(uuid) {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("pages")
          .update({ is_deleted: null })
          .eq("uuid", uuid);

        if (error) throw new Error(error.message);

        const list = get().list;
        set({ list: list ? list.filter((i) => i.uuid !== uuid) : null });
      } catch (error) {
        console.log(error);
        toastError({ description: "Error Restoring" });
      }
    },
  }),
);
