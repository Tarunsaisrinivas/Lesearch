import { createClient } from "@/lib/supabase/client";
import { type Database } from "@/lib/supabase/database.types";
import { toastError } from "@/components/toast";
import { REALTIME_POSTGRES_CHANGES_LISTEN_EVENT } from "@supabase/supabase-js";
import { create } from "zustand";
import { UndoRedoInstance } from "@/types";

export type Page = Database["public"]["Tables"]["pages"]["Row"];
type Status = "start" | "success" | "failed" | null;
type UpdateDocData = Partial<
  Pick<Page, "content" | "description" | "emoji" | "image_url" | "title">
>;

interface DocState {
  saveStatus: Status;
  failedSaveData: Partial<
    Pick<Page, "content" | "description" | "emoji" | "image_url" | "title">
  >;
  loadingDoc: boolean;
  doc: Page | null;
  isLocked: boolean;
  undoRedoInstance: UndoRedoInstance | null;
}

interface DocAction {
  setSaveStatus(status: Status): void;
  getDocAsync(
    uuid: string,
  ): Promise<{ uuid: string; parent_uuid: string | null } | void>;
  updateDocAsync(uuid: string, doc: UpdateDocData): Promise<void>;
  docRealtimeHandler(payload: {
    eventType: `${REALTIME_POSTGRES_CHANGES_LISTEN_EVENT}`;
    doc: Page;
    old: { id?: number };
  }): void;
  toggleLock(): Promise<void>;
  setUndoRedoInstance(instance: UndoRedoInstance | null): void;
}

const initialState: DocState = {
  saveStatus: null,
  loadingDoc: true,
  doc: null,
  failedSaveData: {},
  isLocked: false,
  undoRedoInstance: null,
};

export const useDocStore = create<DocState & DocAction>()((set, get) => ({
  ...initialState,

  setSaveStatus: (status) => set({ saveStatus: status }),

  setUndoRedoInstance: (undoRedoInstance) => set({ undoRedoInstance }),

  docRealtimeHandler: ({ eventType, doc, old }) => {
    const currentDoc = get().doc;
    if (eventType === "DELETE" && currentDoc?.id === old.id) {
      set(initialState);
    } else if (eventType === "UPDATE" && currentDoc?.uuid === doc.uuid) {
      set({ doc, loadingDoc: false });
    }
  },

  getDocAsync: async (uuid) => {
    if (!uuid) {
      toastError({ description: "Invalid document ID." });
      return;
    }

    set({ ...initialState });

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("uuid", uuid)
        .single();

      if (error) throw error;
      if (!data) throw new Error("Document not found");

      let docContent = data.content;
      // console.log(data)
      if (data.is_public && data.linked_to) {
        const { data: linkedPage, error: linkedError } = await supabase
          .from("pages")
          .select("content")
          .eq("uuid", data.linked_to)
          .single();

        if (linkedError) throw linkedError;
        // console.log(linkedPage)
        if (linkedPage) {
          docContent = linkedPage.content;
        }
      }
      set({
        loadingDoc: false,
        doc: { ...data, content: docContent },
        isLocked: !!data.is_locked,
      });

      return {
        uuid: data.uuid,
        parent_uuid: data.parent_uuid,
      };
    } catch (error) {
      console.error("Get doc error:", error);
      set({ loadingDoc: false }); // Ensure loading is set to false even on error
      toastError({
        description:
          "Something went wrong. Broken link or poor internet connection.",
      });
    }
  },

  updateDocAsync: async (uuid, docUpdate) => {
    if (!uuid) {
      toastError({
        title: "Save failed",
        description: "Invalid document ID.",
      });
      return;
    }

    try {
      const currentDoc = get().doc;
      if (!currentDoc) throw new Error("No document loaded");
      if (currentDoc.is_public) {
        return;
      }
      set({
        saveStatus: "start",
        doc: { ...currentDoc, ...docUpdate },
      });

      const supabase = createClient();
      const { error } = await supabase
        .from("pages")
        .update({
          ...get().failedSaveData,
          ...docUpdate,
        })
        .eq("uuid", uuid)
        .select("*")
        .single();

      if (error) throw error;

      set({
        loadingDoc: false,
        saveStatus: "success",
        failedSaveData: {},
      });
    } catch (error) {
      console.error("Update doc error:", error);
      set({
        saveStatus: "failed",
        failedSaveData: { ...get().failedSaveData, ...docUpdate },
        loadingDoc: false, // Ensure loading is set to false on error
      });
      toastError({
        title: "Save failed",
        description:
          "Something went wrong. Please check your connection & try again.",
      });
    }
  },

  toggleLock: async () => {
    const currentDoc = get().doc;
    if (!currentDoc) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("pages")
        .update({ is_locked: !currentDoc.is_locked })
        .eq("uuid", currentDoc.uuid);

      if (error) throw error;

      set((state) => ({
        doc: state.doc
          ? { ...state.doc, is_locked: !state.doc.is_locked }
          : null,
        isLocked: !currentDoc.is_locked,
        loadingDoc: false,
      }));
    } catch (error) {
      console.error("Toggle lock error:", error);
      set({ loadingDoc: false }); // Ensure loading is set to false on error
      toastError({
        title: "Lock failed",
        description:
          "Something went wrong. Please check your connection & try again.",
      });
    }
  },
}));
