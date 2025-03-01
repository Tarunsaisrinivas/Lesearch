"use client";

import { SetStateAction, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Comment } from "@/types/comment";
import { motion } from "framer-motion";
import { useUserStore } from "@/store/use-user-store";

interface CommentFormProps {
  parentId: number | null;
  paperUrl: string | null;
  onSubmit: (newComment: Omit<Comment, "id" | "votes" | "user_vote">) => void;
  onCancel?: () => void;
}

export function CommentForm({
  parentId,
  paperUrl,
  onSubmit,
  onCancel,
}: CommentFormProps) {
  const { fullname } = useUserStore();

  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const newComment: Omit<Comment, "id" | "votes" | "user_vote"> = {
        content: content.trim(),
        author_name: fullname ? fullname : "?",
        parent_id: parentId,
        paper_url: paperUrl, // Ensure paper_url is included here
        created_at: new Date().toISOString(),
      };
      onSubmit(newComment);
      setContent("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      className="space-y-4 dark:bg-gray-800 dark:text-white bg-white text-black p-4 rounded-md shadow-md"
    >
      <Textarea
        value={content}
        onChange={(e: { target: { value: SetStateAction<string> } }) =>
          setContent(e.target.value)
        }
        placeholder="Write a comment..."
        className="min-h-[100px] dark:bg-gray-700 dark:text-white bg-gray-100 text-black border dark:border-gray-600 rounded-md"
      />
      <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="dark:text-white text-black"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="dark:bg-blue-500 dark:text-white bg-blue-500 text-white"
        >
          {isSubmitting ? "Posting..." : "Post Comment"}
        </Button>
      </div>
    </motion.form>
  );
}
