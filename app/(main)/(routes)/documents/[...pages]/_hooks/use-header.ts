"use client"

import type { Emoji } from "@/components/popover/emoji-picker-popover"
import { useDocStore } from "@/store/use-doc-store"
import { useSidebarStore } from "@/store/use-sidebar-store"
import { useParams, useSelectedLayoutSegment } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { useUpdateEffect } from "./useUseEffectUpdate"

export const useHeader = () => {
  const savingRef = useRef<NodeJS.Timeout | null>(null)
  const { saveStatus, setSaveStatus, loadingDoc, doc } = useDocStore()
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const params = useParams()
  const { publicSidebarTree, privateSidebarTree } = useSidebarStore()
  const segment = useSelectedLayoutSegment()

  const selectedPage =
    params.uuid && typeof params.uuid === "string"
      ? publicSidebarTree?.get(params.uuid) || privateSidebarTree?.get(params.uuid)
      : null

  const emoji = selectedPage?.emoji ? (selectedPage.emoji as Emoji) : null

  useEffect(() => {
    if (doc || selectedPage) {
      setIsInitialLoad(false)
    }
  }, [doc, selectedPage])

  const showLoadingIndicator = isInitialLoad || (loadingDoc && !selectedPage?.title)

  const handleSaveStatus = useCallback(() => {
    if (saveStatus === "success") {
      if (savingRef.current) {
        clearTimeout(savingRef.current)
      }
      savingRef.current = setTimeout(() => setSaveStatus(null), 1000)
    }

    return () => {
      if (savingRef.current) {
        clearTimeout(savingRef.current)
        savingRef.current = null
      }
    }
  }, [saveStatus, setSaveStatus])

  useUpdateEffect(handleSaveStatus, [handleSaveStatus])

  return {
    showLoadingIndicator,
    doc,
    emoji,
    title: selectedPage?.title ?? (segment === "(routes)" ? "Getting started" : segment),
    saveStatus,
  }
}

