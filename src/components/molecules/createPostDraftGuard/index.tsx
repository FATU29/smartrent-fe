import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import { SaveDraftDialog } from '@/components/molecules/saveDraftDialog'
import { useCreatePost } from '@/contexts/createPost'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

interface CreatePostDraftGuardProps {
  children: React.ReactNode
}

const NAVIGATION_CANCELLED_ERROR = 'Navigation cancelled by draft guard'

export const CreatePostDraftGuard: React.FC<CreatePostDraftGuardProps> = ({
  children,
}) => {
  const router = useRouter()
  const t = useTranslations('createPost.draftDialog')
  const { propertyInfo } = useCreatePost()
  const { user } = useAuth()

  // State
  const [showDialog, setShowDialog] = useState(false)

  // Refs for navigation control
  const pendingNavigationRef = useRef<string | null>(null)
  const shouldBlockRef = useRef(false)
  const isNavigatingRef = useRef(false)
  const blockedUrlRef = useRef<string | null>(null)

  // Check if there are unsaved changes
  const hasUnsavedChanges = useCallback((): boolean => {
    if (!propertyInfo) return false

    // Check if any meaningful field has been filled
    return (
      propertyInfo.productType !== undefined ||
      propertyInfo.address !== undefined ||
      propertyInfo.area !== undefined ||
      propertyInfo.price !== undefined ||
      propertyInfo.bedrooms !== undefined ||
      propertyInfo.bathrooms !== undefined ||
      propertyInfo.amenityIds !== undefined ||
      propertyInfo.mediaIds !== undefined ||
      propertyInfo.postDate !== undefined ||
      propertyInfo.durationDays !== undefined ||
      propertyInfo.benefitsMembership !== undefined ||
      propertyInfo.isDraft !== undefined
    )
  }, [propertyInfo])

  // Update blocking state when changes occur
  useEffect(() => {
    shouldBlockRef.current = hasUnsavedChanges()
  }, [hasUnsavedChanges])

  // Helper: Cancel navigation by emitting routeChangeError
  const cancelNavigation = useCallback(
    (url: string) => {
      const error = new Error(NAVIGATION_CANCELLED_ERROR)
      router.events.emit('routeChangeError', error, url)
    },
    [router.events],
  )

  // Helper: Show dialog and store pending navigation URL
  const showDialogAndBlockNavigation = useCallback(
    (url: string) => {
      pendingNavigationRef.current = url
      blockedUrlRef.current = url
      setShowDialog(true)
      cancelNavigation(url)
    },
    [cancelNavigation],
  )

  // Navigate after draft is saved or user confirms discard/cancel
  const proceedWithNavigation = useCallback(() => {
    shouldBlockRef.current = false
    isNavigatingRef.current = true
    setShowDialog(false)

    if (pendingNavigationRef.current) {
      router
        .push(pendingNavigationRef.current)
        .then(() => {
          pendingNavigationRef.current = null
          isNavigatingRef.current = false
        })
        .catch(() => {
          isNavigatingRef.current = false
        })
    } else {
      window.location.reload()
    }
  }, [router])

  // Save draft and navigate on success
  const saveDraft = useCallback((): void => {
    if (!user?.userId) {
      toast.error(t('loginRequired'))
      return
    }
  }, [propertyInfo, user?.userId, proceedWithNavigation, t])

  const handleDiscard = useCallback(() => {
    setShowDialog(false)
    pendingNavigationRef.current = null
    blockedUrlRef.current = null
    shouldBlockRef.current = false
  }, [])

  // Cancel and navigate immediately without saving
  const handleCancel = useCallback(() => {
    proceedWithNavigation()
  }, [proceedWithNavigation])

  // Handle browser reload/close tab (shows browser's default dialog)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent): string | undefined => {
      if (shouldBlockRef.current && !isNavigatingRef.current) {
        e.preventDefault()
        e.returnValue = ''
        return ''
      }
      return undefined
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  // Handle browser back/forward buttons
  useEffect(() => {
    const beforePopState = (): boolean => {
      if (shouldBlockRef.current && !isNavigatingRef.current) {
        setShowDialog(true)
        return false
      }
      return true
    }

    router.beforePopState(beforePopState)
    return () => router.beforePopState(() => true)
  }, [router])

  // Intercept link clicks (Next.js Link and anchor tags)
  useEffect(() => {
    const handleClick = (e: MouseEvent): void => {
      if (isNavigatingRef.current) return

      const target = e.target as HTMLElement
      const anchor = target.closest('a')
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href) return

      // Skip external links, mailto, tel, and anchor links
      if (
        href.startsWith('http') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('#')
      ) {
        return
      }

      // Skip if navigating to the same page
      const normalizedHref = href.split('?')[0]
      const currentPath = router.asPath.split('?')[0]
      if (
        normalizedHref === currentPath ||
        normalizedHref === router.pathname
      ) {
        return
      }

      // Block navigation if there are unsaved changes
      if (shouldBlockRef.current && !showDialog) {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
        showDialogAndBlockNavigation(href)
      }
    }

    // Use capture phase to intercept before Next.js Link handler
    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [router, showDialog, showDialogAndBlockNavigation])

  // Intercept programmatic router navigation
  useEffect(() => {
    const handleRouteChangeStart = (url: string): void => {
      if (url === router.asPath || isNavigatingRef.current) return

      if (shouldBlockRef.current) {
        // If dialog is already shown, block navigation immediately
        if (showDialog) {
          cancelNavigation(url)
          return
        }

        // Show dialog and block navigation
        showDialogAndBlockNavigation(url)
      }
    }

    const handleRouteChangeError = (err: Error, url: string): void => {
      if (
        blockedUrlRef.current === url &&
        err.message === NAVIGATION_CANCELLED_ERROR
      ) {
        blockedUrlRef.current = null
      }
    }

    router.events.on('routeChangeStart', handleRouteChangeStart)
    router.events.on('routeChangeError', handleRouteChangeError)

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart)
      router.events.off('routeChangeError', handleRouteChangeError)
    }
  }, [router, showDialog, cancelNavigation, showDialogAndBlockNavigation])

  return (
    <>
      {children}
      <SaveDraftDialog
        open={showDialog}
        onSave={saveDraft}
        onDiscard={handleDiscard}
        onCancel={handleCancel}
        isSaving={false}
      />
    </>
  )
}
