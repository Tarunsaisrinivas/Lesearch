import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDocStore } from "@/store/use-doc-store";
import {
  CopyIcon,
  LockIcon,
  RedoIcon,
  UndoIcon,
  UnlockIcon,
} from "lucide-react";
import { PropsWithChildren, useRef, useState } from "react";
import { useCopyToClipboard } from "react-use";
import { timeAgo } from "@/lib/date";
import { Switch } from "@/components/ui/switch";

export default function HeaderMoreMenuPopover({ children }: PropsWithChildren) {
  const [, copy] = useCopyToClipboard();
  const ref = useRef<HTMLButtonElement | null>(null);
  const { doc, isLocked, toggleLock, undoRedoInstance } = useDocStore();
  const [rules, setRules] = useState({
    canUndo: false,
    canRedo: false,
  });

  const createdAt = doc
    ? timeAgo(doc.created_at as unknown as Date, { withAgo: true })
    : null;

  const updatedAt = doc
    ? timeAgo(doc.updated_at as unknown as Date, { withAgo: true })
    : null;

  const setUndoRedoStatus = () => {
    if (!undoRedoInstance) return;

    setRules({
      canRedo: undoRedoInstance.canRedo(),
      canUndo: undoRedoInstance.canUndo(),
    });
  };

  const undoRedoHandler = (type: "undo" | "redo") => {
    if (!undoRedoInstance) return;

    if (type === "undo" && rules.canUndo) {
      undoRedoInstance.undo();
    }
    if (type === "redo" && rules.canRedo) {
      undoRedoInstance.redo();
    }
    setUndoRedoStatus();
  };

  const openChangeHandler = (open: boolean) => {
    if (open) {
      setUndoRedoStatus();
    }
  };

  return (
    <Popover onOpenChange={openChangeHandler}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="max-w-[200px] overflow-hidden p-0 pt-1"
        align="end"
      >
        <div>
          <section className="border-b px-1 pb-1">
            <div className="w-full">
              <label
                className="flex h-8 w-full cursor-pointer items-center justify-between px-2 text-xs font-normal"
                htmlFor="toggle-lock"
              >
                <span className="flex">
                  {isLocked ? (
                    <UnlockIcon className="mr-2" size={16} />
                  ) : (
                    <LockIcon className="mr-2" size={16} />
                  )}
                  {isLocked ? "Unlock page" : "Lock page"}
                </span>

                <Switch
                  checked={isLocked}
                  id="toggle-lock"
                  onClick={() => {
                    toggleLock();
                  }}
                />
              </label>
            </div>
          </section>

          <section className="border-b px-1 py-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-full items-center justify-start px-2 text-xs font-normal"
              onClick={() => {
                ref.current?.click();
                if (doc?.uuid) {
                  copy(`${window.origin}/doc/${doc.uuid}`);
                }
              }}
            >
              <CopyIcon className="mr-2 h-4 w-4" />
              Copy link
            </Button>
          </section>

          <section className="border-b px-1 py-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-full items-center justify-start px-2 text-xs font-normal"
              onClick={() => undoRedoHandler("undo")}
              disabled={!rules.canUndo || isLocked || !undoRedoInstance}
            >
              <UndoIcon className="mr-2 h-4 w-4" />
              Undo
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-full items-center justify-start px-2 text-xs font-normal"
              onClick={() => undoRedoHandler("redo")}
              disabled={!rules.canRedo || isLocked || !undoRedoInstance}
            >
              <RedoIcon className="mr-2 h-4 w-4" />
              Redo
            </Button>
          </section>

          <section className="p-3">
            <p className="mb-2 flex flex-col text-muted-foreground">
              <span className="text-[10px]">Created {createdAt}</span>
            </p>
            <p className="flex flex-col text-muted-foreground">
              <span className="text-[10px]">Last updated {updatedAt}</span>
            </p>
          </section>

          <PopoverClose hidden asChild>
            <button ref={ref}>close</button>
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  );
}
