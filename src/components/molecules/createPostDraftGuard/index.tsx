import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import { SaveDraftDialog } from '@/components/molecules/saveDraftDialog'
import { useCreatePost } from '@/contexts/createPost'
import { useAuth } from '@/hooks/useAuth'
import { useCreateDraft } from '@/hooks/useListings/useCreateDraft'
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
  const { propertyInfo, isSubmitSuccess } = useCreatePost()
  const { user } = useAuth()
  const { mutate: createDraft, isPending: isDraftSaving } = useCreateDraft()

  const [showDialog, setShowDialog] = useState(false)

  const pendingNavigationRef = useRef<string | null>(null)
  const shouldBlockRef = useRef(false)
  const isNavigatingRef = useRef(false)
  const blockedUrlRef = useRef<string | null>(null)

  const hasUnsavedChanges = useCallback((): boolean => {
    // Don't block if submit was successful
    if (isSubmitSuccess) return false

    if (!propertyInfo) return false

    // Check if propertyInfo has any meaningful data
    const hasAnyData = Object.entries(propertyInfo).some(([key, value]) => {
      // Skip checking these meta fields
      if (key === 'isDraft' || key === 'listingType') return false

      // Check if value exists and is not empty
      if (value === undefined || value === null) return false
      if (typeof value === 'string' && value.trim() === '') return false
      if (Array.isArray(value) && value.length === 0) return false
      if (typeof value === 'object' && Object.keys(value).length === 0)
        return false

      return true
    })

    // Don't block if no meaningful data has been entered
    if (!hasAnyData) return false

    return true
  }, [propertyInfo, isSubmitSuccess])

  useEffect(() => {
    shouldBlockRef.current = hasUnsavedChanges()
  }, [hasUnsavedChanges])

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

  // Save draft and navigate on success
  const saveDraft = useCallback((): void => {
    if (!user?.userId) {
      toast.error(t('loginRequired'))
      return
    }

    // Validate minimum required fields (new address type)
    const hasNewAddress =
      propertyInfo.address?.new?.provinceCode &&
      propertyInfo.address?.new?.wardCode

    if (!hasNewAddress && !propertyInfo.address?.legacy) {
      toast.error(t('addressRequired'))
      return
    }

    // Check basic required fields
    if (!propertyInfo.categoryId || !propertyInfo.title) {
      toast.error(t('requiredFieldsMissing'))
      return
    }

    // Prepare draft payload
    const draftPayload = {
      ...propertyInfo,
      isDraft: true,
    }

    // Call API to create draft
    createDraft(draftPayload, {
      onSuccess: (response) => {
        if (response.success && response.data) {
          toast.success(t('draftSaved'))
          // Navigate to the page user originally tried to go to
          shouldBlockRef.current = false
          isNavigatingRef.current = true
          const targetUrl = pendingNavigationRef.current || '/seller/drafts'
          router.push(targetUrl).then(() => {
            isNavigatingRef.current = false
            pendingNavigationRef.current = null
          })
        } else {
          toast.error(response.message || t('saveFailed'))
        }
      },
      onError: (error) => {
        toast.error(t('saveFailed'))
        console.error('Draft creation error:', error)
      },
    })
  }, [propertyInfo, user?.userId, createDraft, t, router])

  // Cancel dialog and navigate to the pending URL (user wants to leave)
  const handleCancel = useCallback(() => {
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
      // If no pending URL, just close dialog and stay
      isNavigatingRef.current = false
    }
  }, [router])

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
        onCancel={handleCancel}
        isSaving={isDraftSaving}
      />
    </>
  )
}
