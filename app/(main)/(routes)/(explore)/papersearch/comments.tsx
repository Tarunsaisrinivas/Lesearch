"use client"

import { useState, useEffect, useCallback } from "react"
import { CommentThread } from "@/app/(main)/_components/CommentThread"
import { CommentForm } from "@/app/(main)/_components/CommentForm"
import { createClient } from "@/lib/supabase/client"
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js"
import type { Comment, Paper } from "@/types/comment"

type SortOption = "newest" | "oldest" | "most_votes"

interface CommentsProps {
  paper: Paper | null
}

export default function Comments_Component({ paper }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [sortOption] = useState<SortOption>("newest")
  const supabase = createClient()

  const fetchComments = useCallback(async () => {
    if (!paper?.url) {
      console.warn("No paper URL provided, skipping fetch.")
      setComments([])
      return
    }

    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("paper_url", paper.url)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching comments:", error)
      return
    }

    setComments(data || [])
  }, [paper?.url, supabase])

  useEffect(() => {
    if (!paper?.url) return

    fetchComments()

    const channel = supabase
      .channel(`comments-${paper.url}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `paper_url=eq.${paper.url}`,
        },
        (payload: RealtimePostgresChangesPayload<Comment>) => {
          console.log(payload)
          fetchComments()
        },
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [paper?.url, supabase, fetchComments])

  const handleNewComment = async (newComment: Omit<Comment, "id" | "votes" | "user_vote">) => {
    const { data, error } = await supabase.from("comments").insert([newComment]).select()

    if (error) {
      console.error("Error adding comment:", error)
      return
    }

    if (data) {
      setComments((prevComments) => [data[0], ...prevComments])
    }
  }

  const handleVote = async (commentId: number, voteType: 1 | -1 | 0) => {
    const { data, error } = await supabase.rpc("increment_votes", {
      row_id: commentId,
      inc_amount: voteType,
    })

    if (error) {
      console.error("Error updating vote:", error)
      return
    }

    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment.id === commentId ? { ...comment, votes: data, user_vote: voteType } : comment,
      ),
    )
  }

  const sortComments = (comments: Comment[]): Comment[] => {
    return [...comments].sort((a, b) => {
      switch (sortOption) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "most_votes":
          return b.votes - a.votes
        default:
          return 0
      }
    })
  }

  const topLevelComments = sortComments(comments.filter((comment) => !comment.parent_id))

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-card dark:bg-gray-800 p-4 rounded-lg shadow dark:text-white">
          <h2 className="text-lg font-semibold mb-4">Add a Comment</h2>
          {paper?.url && <CommentForm parentId={null} paperUrl={paper.url} onSubmit={handleNewComment} />}
        </div>

        <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow dark:text-white">
          <h2 className="text-lg font-semibold text-black dark:text-white">Comments</h2>
        </div>

        <div className="space-y-6">
          {paper &&
            topLevelComments.map((comment) => (
              <CommentThread
                key={comment.id}
                comment={comment}
                allComments={comments}
                onReply={handleNewComment}
                onVote={handleVote}
                paperUrl={paper.url}
              />
            ))}
        </div>
      </div>
    </div>
  )
}

