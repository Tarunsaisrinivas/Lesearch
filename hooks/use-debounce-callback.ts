import { useRef } from "react"

// Define a more specific type for the callback function
type CallbackFunction = () => void

export default function useDebounceCallback(delay = 300) {
  // Use NodeJS.Timeout instead of number
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const delayedCallback = (cb: CallbackFunction) => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(cb, delay)
  }

  return { delayedCallback }
}

