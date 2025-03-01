"use client";

import { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CommentForm } from "./CommentForm";
import { Comment } from "@/types/comment";
import { motion, AnimatePresence } from "framer-motion";

interface CommentThreadProps {
  paperUrl: string | null;
  comment: Comment;
  allComments: Comment[];
  depth?: number;
  onReply: (newComment: Omit<Comment, "id" | "votes" | "user_vote">) => void;
  onVote: (commentId: number, voteType: 1 | -1 | 0) => void;
}

export function CommentThread({
  comment,
  allComments,
  depth = 0,
  onReply,
  onVote,
  paperUrl,
}: CommentThreadProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAllReplies, setShowAllReplies] = useState(false);
  const contentRef = useRef<HTMLParagraphElement>(null);
  const [isContentCollapsed, setIsContentCollapsed] = useState(false);

  // const handleVote = (isUpvote: boolean) => {
  //   const newVoteValue = isUpvote
  //     ? comment.user_vote === 1
  //       ? 0
  //       : 1
  //     : comment.user_vote === -1
  //       ? 0
  //       : -1;
  //   onVote(comment.id, newVoteValue as 1 | -1 | 0);
  // };

  const timeAgo = new Date(comment.created_at).toLocaleDateString();

  const childComments = allComments.filter((c) => c.parent_id === comment.id);
  const visibleChildComments = showAllReplies
    ? childComments
    : childComments.slice(0, 3);

  useEffect(() => {
    if (contentRef.current) {
      setIsContentCollapsed(contentRef.current.scrollHeight > 100);
    }
  }, [comment.content]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex space-x-3 group dark:bg-gray-800 dark:text-white bg-white text-black p-4 rounded-md"
    >
      <div className="flex flex-col items-center">
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${comment.author_name}`}
          />
          <AvatarFallback>{comment.author_name[0]}</AvatarFallback>
        </Avatar>
        {depth > 0 && (
          <div className="w-0.5 flex-1 bg-border my-2 opacity-50 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-sm">{comment.author_name}</span>
          <span className="text-muted-foreground text-xs">• {timeAgo}</span>
          {childComments.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto dark:text-white text-black"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p
                ref={contentRef}
                className={`text-sm text-foreground/90 ${isContentCollapsed && !showAllReplies ? "line-clamp-3" : ""} dark:text-foreground/90 text-foreground/90`}
              >
                {comment.content}
              </p>
              {isContentCollapsed && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setShowAllReplies(!showAllReplies)}
                  className="mt-1 p-0 dark:text-white text-black"
                >
                  {showAllReplies ? "Show less" : "Show more"}
                </Button>
              )}
              <div className="flex items-center space-x-2 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground dark:text-white hover:dark:text-foreground"
                  onClick={() => setIsReplying(!isReplying)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Reply
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 dark:text-white text-black"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Save</DropdownMenuItem>
                    <DropdownMenuItem>Report</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {isReplying && (
                <div className="mt-4">
                  <CommentForm
                    parentId={comment.id}
                    paperUrl={paperUrl}
                    onSubmit={(newComment) => {
                      onReply(newComment);
                      setIsReplying(false);
                    }}
                    onCancel={() => setIsReplying(false)}
                  />
                </div>
              )}

              {visibleChildComments.length > 0 && (
                <div className="space-y-3 mt-3">
                  {visibleChildComments.map((childComment) => (
                    <CommentThread
                      key={childComment.id}
                      paperUrl={paperUrl}
                      comment={childComment}
                      allComments={allComments}
                      depth={depth + 1}
                      onReply={onReply}
                      onVote={onVote}
                    />
                  ))}
                </div>
              )}

              {childComments.length > 3 && !showAllReplies && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setShowAllReplies(true)}
                  className="mt-2 dark:text-white text-black"
                >
                  Show {childComments.length - 3} more replies
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
