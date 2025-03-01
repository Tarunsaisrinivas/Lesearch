"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCoverImage } from "@/hooks/use-cover-image";
import { useParams } from "next/navigation";
import { useDocStore } from "@/store/use-doc-store";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ImageIcon, Upload, Loader2 } from "lucide-react";
import { COLOR_AND_GRADIENT } from "@/constants/color-gradient";
import { Input } from "./ui/input";
import Image from "next/image";
// import { v4 as uuidv4 } from 'uuid';

export const CoverImageDialog = () => {
  const coverImage = useCoverImage();
  const params = useParams();
  const { updateDocAsync } = useDocStore();
  const [uploading, setUploading] = useState(false);
  const [imagefile, setImagefile] = useState<string>("");
  const supabase = createClient();
  const uuid = params.pages && params.pages[0];

  const onClose = () => {
    setImagefile("");
    coverImage.onClose();
  };

  const onChange = async (color: string) => {
    try {
      if (typeof uuid === "string") {
        await updateDocAsync(uuid, {
          image_url: color,
        });
        onClose();
        toast.success("Cover updated");
      }
    } catch {
      toast.error("Failed to update cover");
    }
  };

  const uploadToSupabase = async (file: File) => {
    if (typeof uuid !== "string") {
      throw new Error("Invalid page ID");
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${uuid}.${fileExt}`;

    const { error } = await supabase.storage
      .from("covers")
      .upload(fileName, file, {
        upsert: true, // This will replace the existing file if it exists
      });

    if (error) {
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from("covers")
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };
  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      // Show preview
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setImagefile(reader.result);
        }
      };
      reader.readAsDataURL(file);

      // Upload to Supabase
      const imageUrl = await uploadToSupabase(file);

      // Update document with new image URL
      if (typeof uuid === "string") {
        await updateDocAsync(uuid, {
          image_url: imageUrl,
        });
        toast.success("Cover image uploaded successfully");
        onClose();
      }
    } catch (error) {
      toast.error("Failed to upload image");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={coverImage.isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            Cover Image
            <label className="ml-4 cursor-pointer text-sm font-medium text-blue-500 hover:underline flex items-center">
              {uploading ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-1" />
              )}
              Upload from Media
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </DialogTitle>
        </DialogHeader>
        {imagefile ? (
          <div className="relative w-full h-48 rounded-md overflow-hidden">
            <Image
              src={imagefile}
              alt="Cover preview"
              className="object-cover"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {COLOR_AND_GRADIENT.map((item) => (
              <Button
                key={item.name}
                onClick={() => onChange(item.name)}
                className="group relative aspect-video h-24 w-full overflow-hidden rounded-sm"
                variant="outline"
                disabled={uploading}
              >
                <div
                  className="absolute inset-0 w-full h-full transition"
                  style={{ background: item.background }}
                />
                <div className="opacity-0 group-hover:opacity-100 absolute bottom-2 right-2 h-4 w-4 bg-white rounded-sm flex items-center justify-center">
                  <ImageIcon className="h-3 w-3" />
                </div>
              </Button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
