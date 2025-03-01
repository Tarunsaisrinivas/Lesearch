import { Emoji } from "@/components/popover/emoji-picker-popover";
import { createClient } from "@/lib/supabase/client";
import { type Database } from "@/lib/supabase/database.types";
import { toastError, toastLoading } from "@/components/toast";
import { REALTIME_POSTGRES_CHANGES_LISTEN_EVENT } from "@supabase/supabase-js";
import { toast } from "sonner";
import { create } from "zustand";

// Types
type Page = Pick<
  Database["public"]["Tables"]["pages"]["Row"],
  | "uuid"
  | "title"
  | "emoji"
  | "parent_uuid"
  | "created_at"
  | "updated_at"
  | "is_locked"
  | "is_public"
>;

type TreeNode = Page & {
  is_deleted?: boolean | null;
};

interface SidebarState {
  loading: Record<string, boolean>;
  publicSidebarTree: Map<string, Page> | null;
  privateSidebarTree: Map<string, Page> | null;
  sidebarTreeCollapsed: Map<
    string,
    { uuid: string; parent_uuid: string | null }
  >;
}

interface TreeMutations {
  _insertIntoSidebarTree(doc: TreeNode, isPublic: boolean): void;
  _deleteFromSidebarTree(doc: TreeNode, isPublic: boolean): void;
  _updateSidebarTree(doc: TreeNode, isPublic: boolean): void;
}

interface TreeOperations {
  childExistInSidebarTree(uuid: string, isPublic: boolean): boolean;
  sidebarTreeCollapseHandler(
    node: { uuid: string; parent_uuid: string | null },
    flag?: "new",
  ): void;
  sidebarTreeRealtimeHandler(payload: {
    eventType: `${REALTIME_POSTGRES_CHANGES_LISTEN_EVENT}`;
    doc: TreeNode;
  }): void;
}

interface AsyncOperations {
  getPersonalSidebarTreeAsync(uuid?: string): Promise<void>;
  getPrivateSidebarTreeAsync(uuid?: string): Promise<void>;
  renameDocAsync(opt: {
    uuid: string;
    title: string;
    emoji: Emoji | null;
  }): Promise<void>;
  deleteDocAsync(uuid: string): Promise<{ uuid: string } | void>;
  createDocAsync(opt: {
    uuid?: string;
    title?: string;
    emoji?: Emoji;
    isPublic?: boolean;
  }): Promise<{
    uuid: string;
    parent_uuid: string | null;
    error: null;
    is_public: boolean;
  } | void>;
}

type SidebarStore = SidebarState &
  TreeMutations &
  TreeOperations &
  AsyncOperations;

const initialState: SidebarState = {
  loading: { root: true },
  publicSidebarTree: null,
  privateSidebarTree: null,
  sidebarTreeCollapsed: new Map(),
};

export const useSidebarStore = create<SidebarStore>()((set, get) => ({
  ...initialState,

  // Tree Query Methods
  childExistInSidebarTree(uuid, isPublic) {
    const tree = isPublic ? get().privateSidebarTree : get().publicSidebarTree;
    return tree
      ? [...tree.values()].some(({ parent_uuid }) => parent_uuid === uuid)
      : false;
  },

  // Internal Tree Mutations
  _insertIntoSidebarTree(doc, isPublic) {
    const treeKey = isPublic ? "privateSidebarTree" : "publicSidebarTree";
    set((state) => ({
      [treeKey]: new Map(
        state[treeKey]
          ? [...state[treeKey]!, [doc.uuid, doc]]
          : [[doc.uuid, doc]],
      ),
    }));
  },

  _deleteFromSidebarTree(doc, isPublic) {
    const treeKey = isPublic ? "privateSidebarTree" : "publicSidebarTree";
    set((state) => {
      const newTree = new Map(state[treeKey]);
      newTree.delete(doc.uuid);
      return { [treeKey]: newTree };
    });
  },

  _updateSidebarTree(doc, isPublic) {
    const treeKey = isPublic ? "privateSidebarTree" : "publicSidebarTree";
    set((state) => {
      const tree = state[treeKey];
      if (!tree) return {};

      if (!tree.has(doc.uuid) && !doc.is_deleted) {
        // Restore from trash
        return { [treeKey]: new Map([...tree, [doc.uuid, doc]]) };
      } else if (tree.has(doc.uuid) && doc.is_deleted) {
        // Move to trash
        const newTree = new Map(tree);
        newTree.delete(doc.uuid);
        return { [treeKey]: newTree };
      } else if (tree.has(doc.uuid) && !doc.is_deleted) {
        // Normal update
        return { [treeKey]: new Map([...tree, [doc.uuid, doc]]) };
      }
      return {};
    });
  },

  // Event Handlers
  sidebarTreeRealtimeHandler({ eventType, doc }) {
    const isPublic = doc.is_public ?? false;
    switch (eventType) {
      case "INSERT":
        return get()._insertIntoSidebarTree(doc, isPublic);
      case "DELETE":
        return get()._deleteFromSidebarTree(doc, isPublic);
      case "UPDATE":
        return get()._updateSidebarTree(doc, isPublic);
    }
  },

  sidebarTreeCollapseHandler({ uuid, parent_uuid }, flag) {
    set((state) => {
      const collapsedList = new Map(state.sidebarTreeCollapsed);

      if (flag === "new") {
        const tree = state.publicSidebarTree; // Consider which tree to use here. Might need logic to handle both.
        if (tree && parent_uuid) {
          const parentNode = tree.get(parent_uuid);
          if (parentNode) {
            collapsedList.set(parentNode.uuid, {
              uuid: parentNode.uuid,
              parent_uuid: parentNode.parent_uuid,
            });

            // Recursively collapse parent nodes
            get().sidebarTreeCollapseHandler(
              { uuid: parent_uuid, parent_uuid: parentNode.parent_uuid },
              "new",
            );
          }
        }
      } else {
        if (collapsedList.has(uuid)) {
          collapsedList.delete(uuid);
        } else {
          collapsedList.set(uuid, { uuid, parent_uuid });
        }
      }

      return { sidebarTreeCollapsed: collapsedList };
    });
  },

  // Async Operations
  async getPersonalSidebarTreeAsync(uuid) {
    if (uuid && get().childExistInSidebarTree(uuid, false)) return;

    const loadingKey = uuid ?? "root";
    set((state) => ({
      loading: { ...state.loading, [loadingKey]: true },
    }));

    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      const query = supabase
        .from("pages")
        .select(
          "uuid, title, emoji, parent_uuid, created_at, updated_at, is_locked, is_public",
        )
        .or("is_deleted.is.null,is_deleted.is.false")
        .eq("is_public", false)
        .eq("user_id", userData.user?.id)
        .order("created_at");

      if (uuid) {
        query.eq("parent_uuid", uuid);
      } else {
        query.is("parent_uuid", null);
      }

      const { data, error } = await query;
      if (error) throw error;

      set((state) => {
        const currentTree = state.publicSidebarTree ?? new Map();
        const newNodes = new Map(data.map((item) => [item.uuid, item]));
        return {
          publicSidebarTree: new Map([...currentTree, ...newNodes]),
          loading: { ...state.loading, [loadingKey]: false },
        };
      });
    } catch (error) {
      console.error("Failed to load public sidebar tree:", error);
      toastError({
        description:
          "Failed to load public sidebar tree. Please check your connection & try again.",
      });
      set((state) => ({
        loading: { ...state.loading, [loadingKey]: false },
      }));
    }
  },

  async getPrivateSidebarTreeAsync(uuid) {
    if (uuid && get().childExistInSidebarTree(uuid, true)) return;

    const loadingKey = uuid ?? "root";
    set((state) => ({
      loading: { ...state.loading, [loadingKey]: true },
    }));

    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      const query = supabase
        .from("pages")
        .select(
          "uuid, title, emoji, parent_uuid, created_at, updated_at, is_locked, is_public",
        )
        .or("is_deleted.is.null,is_deleted.is.false")
        .eq("is_public", true)
        .eq("user_id", userData.user?.id)
        .order("created_at");

      if (uuid) {
        query.eq("parent_uuid", uuid);
      } else {
        query.is("parent_uuid", null);
      }

      const { data, error } = await query;
      if (error) throw error;

      set((state) => {
        const currentTree = state.privateSidebarTree ?? new Map();
        const newNodes = new Map(data.map((item) => [item.uuid, item]));
        return {
          privateSidebarTree: new Map([...currentTree, ...newNodes]),
          loading: { ...state.loading, [loadingKey]: false },
        };
      });
    } catch (error) {
      console.error("Failed to load private sidebar tree:", error);
      toastError({
        description:
          "Failed to load private sidebar tree. Please check your connection & try again.",
      });
      set((state) => ({
        loading: { ...state.loading, [loadingKey]: false },
      }));
    }
  },

  async renameDocAsync({ uuid, title, emoji }) {
    set((state) => {
      const publicTree = state.publicSidebarTree;
      const privateTree = state.privateSidebarTree;
      const item = publicTree?.get(uuid) || privateTree?.get(uuid);

      if (!item) return {};

      const isPublic = !!privateTree?.get(uuid);
      const treeKey = isPublic ? "privateSidebarTree" : "publicSidebarTree";
      const updatedTree = new Map(state[treeKey]);
      updatedTree.set(uuid, { ...item, title, emoji });

      return { [treeKey]: updatedTree };
    });

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("pages")
        .update({ title: title ?? null, emoji: emoji ?? null })
        .eq("uuid", uuid);

      if (error) throw error;
    } catch (error) {
      console.error("Rename error:", error);
      // Rollback on error
      set((state) => {
        const publicTree = state.publicSidebarTree;
        const privateTree = state.privateSidebarTree;
        const item = publicTree?.get(uuid) || privateTree?.get(uuid);

        if (!item) return {};

        const isPublic = !!privateTree?.get(uuid);
        const treeKey = isPublic ? "privateSidebarTree" : "publicSidebarTree";
        const updatedTree = new Map(state[treeKey]);
        updatedTree.set(uuid, item);

        return { [treeKey]: updatedTree };
      });
      toastError({
        description:
          "Failed to rename document. Please check your connection & try again.",
      });
    }
  },

  async deleteDocAsync(uuid) {
    const item =
      get().publicSidebarTree?.get(uuid) || get().privateSidebarTree?.get(uuid);
    const isPublic = !!get().privateSidebarTree?.get(uuid);

    if (!item) return;

    // Optimistic update
    set((state) => {
      const treeKey = isPublic ? "privateSidebarTree" : "publicSidebarTree";
      const updatedTree = new Map(state[treeKey]);
      updatedTree.delete(uuid);
      return { [treeKey]: updatedTree };
    });

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("pages")
        .update({ is_deleted: true })
        .eq("uuid", uuid);

      if (error) throw error;
      return { uuid };
    } catch (error) {
      console.error("Delete error:", error);
      // Rollback on error
      set((state) => {
        const treeKey = isPublic ? "privateSidebarTree" : "publicSidebarTree";
        const updatedTree = new Map(state[treeKey]);
        updatedTree.set(uuid, item);
        return { [treeKey]: updatedTree };
      });
      toastError({
        description:
          "Move to trash failed. Please check your connection & try again.",
      });
    }
  },

  async createDocAsync({
    uuid,
    title = "untitled",
    emoji = null,
    isPublic = false,
  }) {
    const toastId = uuid ?? "create";
    const loadingToast = toastLoading({
      description: "Creating new page...",
      id: toastId,
    });

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("pages")
        .insert({ parent_uuid: uuid, title, emoji, is_public: isPublic })
        .select("uuid, parent_uuid, is_public")
        .single();

      if (error) throw error;

      toast.dismiss(loadingToast);
      toast.success("New Note Created!");

      // Update the store
      get()._insertIntoSidebarTree(
        {
          uuid: data.uuid,
          parent_uuid: data.parent_uuid,
          title,
          emoji,
          is_public: data.is_public,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_locked: false,
        },
        data.is_public,
      );

      return {
        uuid: data.uuid,
        parent_uuid: data.parent_uuid,
        is_public: data.is_public,
        error: null,
      };
    } catch (error) {
      console.error("Create error:", error);
      toastError({
        description:
          "Failed to create new page. Please check your connection & try again.",
        id: toastId,
      });
    }
  },
}));
