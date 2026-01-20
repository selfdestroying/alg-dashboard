import { useCallback, useEffect, useRef } from 'react'

export default function useSkipper() {
  const shouldSkipRef = useRef(true)
  // eslint-disable-next-line react-hooks/refs
  const shouldSkip = shouldSkipRef.current

  const skip = useCallback(() => {
    shouldSkipRef.current = false
  }, [])

  useEffect(() => {
    shouldSkipRef.current = true
  })

  // eslint-disable-next-line react-hooks/refs
  return [shouldSkip, skip] as const
}
