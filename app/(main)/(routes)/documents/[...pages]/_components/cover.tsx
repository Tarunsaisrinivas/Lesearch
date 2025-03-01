"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ImageIcon, X } from "lucide-react";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCoverImage } from "@/hooks/use-cover-image";
import { useDocStore } from "@/store/use-doc-store";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { COLOR_AND_GRADIENT } from "@/constants/color-gradient";

interface CoverImageProps {
  url?: string | null;
  preview?: boolean;
}

export const Cover = ({ url, preview }: CoverImageProps) => {
  const params = useParams();
  const uuid = params.pages && params.pages[0];
  const coverImage = useCoverImage();
  const { updateDocAsync } = useDocStore();
  const [cacheBuster, setCacheBuster] = useState<string>("");

  useEffect(() => {
    setCacheBuster(`?t=${Date.now()}`);
  }, [url, coverImage]);

  const bgColor = url ? COLOR_AND_GRADIENT.find((v) => v.name === url) : null;

  const onRemove = async () => {
    try {
      if (url) {
        const supabase = createClient();
        // Delete the image from Supabase storage
        const filePath = url.split("/").pop();
        if (filePath) {
          const { error: storageError } = await supabase.storage
            .from("covers")
            .remove([filePath]);

          if (storageError) throw storageError;
        }
      }

      // Update the document to remove cover image
      if (typeof uuid === "string") {
        await updateDocAsync(uuid, {
          image_url: null,
        });
        toast.success("Cover image removed");
      }
    } catch (error) {
      console.error("Failed to remove cover image:", error);
      toast.error("Failed to remove cover image");
    }
  };

  const onReplace = () => {
    if (url) {
      coverImage.onReplace(url);
      setCacheBuster(`?t=${Date.now()}`);
    }
  };

  return (
    <div
      className={cn(
        "relative w-full h-[30vh] group",
        !url && "h-[10vh]",
        url && "bg-muted",
      )}
    >
      {bgColor && (
        <div
          className="h-full w-full dark:brightness-90"
          style={{ background: bgColor.background }}
        />
      )}
      {!!url && !bgColor && (
        <Image
          src={`${url}${cacheBuster}`}
          fill
          alt="Cover"
          className="object-cover"
          priority
        />
      )}
      {url && !preview && (
        <div className="opacity-0 group-hover:opacity-100 absolute bottom-5 right-5 flex items-center gap-x-2">
          <Button
            onClick={onReplace}
            className="text-xs text-muted-foreground hover:text-foreground"
            variant="outline"
            size="sm"
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            Change cover
          </Button>
          <Button
            onClick={onRemove}
            className="text-xs text-muted-foreground hover:text-destructive"
            variant="outline"
            size="sm"
          >
            <X className="mr-2 h-4 w-4" />
            Remove
          </Button>
        </div>
      )}
    </div>
  );
};

Cover.Skeleton = function CoverSkeleton() {
  return <Skeleton className="h-[12vh] w-full" />;
};
