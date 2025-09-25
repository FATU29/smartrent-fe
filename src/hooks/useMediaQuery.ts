import { useEffect, useState } from 'react'

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState<boolean | null>(() => {
    if (typeof window === 'undefined') return null
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia(query)
    const onChange = (e: MediaQueryListEvent | MediaQueryList) =>
      setMatches('matches' in e ? e.matches : (e as MediaQueryList).matches)

    // Ensure state reflects current value in case query changes
    setMatches(mq.matches)
    mq.addEventListener?.(
      'change',
      onChange as (ev: MediaQueryListEvent) => void,
    )
    return () =>
      mq.removeEventListener?.(
        'change',
        onChange as (ev: MediaQueryListEvent) => void,
      )
  }, [query])

  return matches
}

export function useIsMobile() {
  const matches = useMediaQuery('(max-width: 767px)')
  return matches
}

export function useIsDesktop() {
  const matches = useMediaQuery('(min-width: 768px)')
  return matches
}
