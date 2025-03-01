import { useRef, useState } from "react";
import { type Database } from "@/lib/supabase/database.types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocStore } from "@/store/use-doc-store";
import { FileIcon } from "lucide-react";
import { type Emoji } from "@/components/popover/emoji-picker-popover";

interface TitleProps {
  initialData: Database["public"]["Tables"]["pages"]["Row"];
  className?: string;
}

export const HeaderTitle = ({ initialData, className = "" }: TitleProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { updateDocAsync } = useDocStore();

  const [title, setTitle] = useState(initialData.title || "Untitled");
  const [isEditing, setIsEditing] = useState(false);

  const emoji = initialData.emoji ? (initialData.emoji as Emoji) : null;

  const enableInput = () => {
    if (initialData.is_locked) return;

    setTitle(initialData.title || "");
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(0, inputRef.current.value.length);
    }, 0);
  };

  const disableInput = () => {
    setIsEditing(false);
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = event.target.value;
    setTitle(newTitle);
    updateDocAsync(initialData.uuid, {
      title: newTitle || "Untitled",
    });
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      disableInput();
    }
  };

  return (
    <div className={`flex items-center gap-x-2 ${className}`}>
      {emoji ? (
        <span
          role="img"
          aria-label={emoji.name}
          className="block w-4 text-sm antialiased"
        >
          {emoji.native}
        </span>
      ) : (
        <FileIcon className="h-4 w-4 shrink-0" />
      )}

      {isEditing ? (
        <Input
          ref={inputRef}
          onClick={enableInput}
          onBlur={disableInput}
          onChange={onChange}
          onKeyDown={onKeyDown}
          value={title}
          className="h-7 w-[200px] px-2 focus-visible:ring-transparent md:w-[300px]"
        />
      ) : (
        <Button
          onClick={enableInput}
          variant="ghost"
          size="sm"
          className="h-auto p-1 font-normal"
          disabled={!!initialData.is_locked}
        >
          <span className="block max-w-[180px] truncate md:max-w-[280px]">
            {title}
          </span>
        </Button>
      )}
    </div>
  );
};

HeaderTitle.Skeleton = function TitleSkeleton() {
  return (
    <div className="flex items-center gap-x-2">
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-7 w-[200px] rounded-md md:w-[300px]" />
    </div>
  );
};
