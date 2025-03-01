"use client";

import { ComponentRef, useRef, useState } from "react";
import { ImageIcon, Smile, X } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import { useCoverImage } from "@/hooks/use-cover-image";
import { Button } from "@/components/ui/button";
import EmojiPickerPopover from "@/components/popover/emoji-picker-popover";
import { useDocStore } from "@/store/use-doc-store";
import { useParams } from "next/navigation";
import { Database } from "@/lib/supabase/database.types";
import { type EmojiClickData } from "emoji-picker-react";
import { CoverImageDialog } from "./cover-image-dialog";

type Document = Database["public"]["Tables"]["pages"]["Row"];

const transformEmojiData = (emojiData: EmojiClickData) => {
  return {
    id: emojiData.unified,
    name: emojiData.names[0] || "",
    keywords: [],
    native: emojiData.emoji,
    shortcodes: "",
    unified: emojiData.unified,
  };
};

const getEmojiContent = (emoji: Document["emoji"]): string | null => {
  if (!emoji) return null;

  if (typeof emoji === "object" && emoji !== null && "native" in emoji) {
    return emoji.native as string;
  }

  return null;
};

export const Toolbar = ({
  initialData,
  preview,
}: {
  initialData: Document;
  preview?: boolean;
}) => {
  const params = useParams();
  const uuid = params.pages && params.pages[0];
  const inputRef = useRef<ComponentRef<typeof TextareaAutosize>>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialData.title || "Untitled");

  const { updateDocAsync, isLocked } = useDocStore();
  const coverImage = useCoverImage();

  const enableInput = () => {
    if (preview || isLocked) return;

    setIsEditing(true);
    setTimeout(() => {
      setValue(initialData.title || "Untitled");
      inputRef.current?.focus();
    }, 0);
  };

  const disableInput = () => setIsEditing(false);

  const onInput = async (value: string) => {
    if (typeof uuid !== "string") return;

    setValue(value);
    await updateDocAsync(uuid, {
      title: value || "Untitled",
    });
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      disableInput();
    }
  };

  const onIconSelect = (emojiData: EmojiClickData) => {
    if (typeof uuid !== "string") return;

    const transformedEmoji = transformEmojiData(emojiData);
    updateDocAsync(uuid, {
      emoji: transformedEmoji,
    });
  };

  const onRemoveIcon = async () => {
    if (typeof uuid !== "string") return;

    await updateDocAsync(uuid, {
      emoji: null,
    });
  };

  const hasIcon = initialData.emoji !== null;
  const iconContent = getEmojiContent(initialData.emoji);

  return (
    <>
      <div className="relative group">
        <div className="flex gap-5">
          {hasIcon && !preview && (
            <div className="flex items-start gap-x-2 group/icon pt-5 pb-5">
              <EmojiPickerPopover onEmojiSelect={onIconSelect}>
                <p className="text-6xl transition hover:scale-75">
                  {iconContent}
                </p>
              </EmojiPickerPopover>
              <Button
                onClick={onRemoveIcon}
                className="rounded-full text-xs text-muted-foreground opacity-0 transition group-hover/icon:opacity-100"
                variant="outline"
                size="icon"
                disabled={isLocked}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          {hasIcon && preview && <p className="pt-6 text-6xl">{iconContent}</p>}

          <div className="flex items-center gap-x-1 py-4 opacity-0 group-hover:opacity-100">
            {!hasIcon && !preview && (
              <EmojiPickerPopover onEmojiSelect={onIconSelect}>
                <Button
                  className="text-xs text-muted-foreground"
                  variant="outline"
                  size="sm"
                  disabled={isLocked}
                >
                  <Smile className="mr-2 h-4 w-4" />
                  Add icon
                </Button>
              </EmojiPickerPopover>
            )}
            {!initialData.image_url && !preview && (
              <Button
                onClick={coverImage.onOpen}
                className="text-xs text-muted-foreground"
                variant="outline"
                size="sm"
                disabled={isLocked}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Add cover
              </Button>
            )}
          </div>
        </div>
        {isEditing && !preview ? (
          <TextareaAutosize
            ref={inputRef}
            onBlur={disableInput}
            onKeyDown={onKeyDown}
            value={value}
            onChange={(e) => onInput(e.target.value)}
            className="resize-none break-words bg-transparent text-5xl font-bold outline-none text-[#3F3F3F] dark:text-[#CFCFCF]"
          />
        ) : (
          <div
            onClick={enableInput}
            className="break-words pb-[11.5px] text-5xl font-bold outline-none text-[#3F3F3F] dark:text-[#CFCFCF]"
          >
            {initialData.title || "Untitled"}
          </div>
        )}
      </div>
      <CoverImageDialog />
    </>
  );
};
