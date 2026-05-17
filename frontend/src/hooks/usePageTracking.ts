import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { analytics } from './useAnalytics'

function pageNameFromPath(pathname: string): string {
  if (pathname === '/app') return 'app'
  if (pathname === '/') return 'login'
  return pathname.replace(/^\//, '') || 'unknown'
}

export function usePageTracking(): void {
  const location = useLocation()

  useEffect(() => {
    const pageName = pageNameFromPath(location.pathname)
    analytics.pageView(pageName, {
      page_path: location.pathname + location.search,
      page_title: document.title,
    })
  }, [location.pathname, location.search])
}
