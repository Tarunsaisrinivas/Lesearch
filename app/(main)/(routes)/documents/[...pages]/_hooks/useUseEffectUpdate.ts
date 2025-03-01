"use client"

import { type DependencyList, useEffect, useRef } from "react"

export function useUpdateEffect(effect: () => void | (() => void), dependencies: DependencyList) {
  const isFirstRender = useRef(true)
  const effectRef = useRef(effect)

  // Always update the effectRef to the latest effect function
  useEffect(() => {
    effectRef.current = effect
  })

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
    } else {
      return effectRef.current()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)
}

