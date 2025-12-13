import { useEffect, useRef, useCallback } from 'react'
import { useUpdatePost } from '@/contexts/updatePost'
import { useCreatePost } from '@/contexts/createPost'

/**
 * Bridge component that syncs UpdatePostContext data to CreatePostContext
 * This allows reusing CreatePost form sections in the Update flow
 */
export const UpdateToCreateBridge: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const updateContext = useUpdatePost()
  const createContext = useCreatePost()

  // Use refs to track last synced values to prevent infinite loops
  const lastPropertyInfoRef = useRef<string>('')
  const lastAddressRef = useRef<string>('')
  const lastMediaRef = useRef<string>('')
  const isSyncingRef = useRef(false)

  // Stable update functions
  const updatePropertyInfo = useCallback(
    (data: typeof updateContext.propertyInfo) => {
      if (!isSyncingRef.current) {
        isSyncingRef.current = true
        createContext.updatePropertyInfo(data)
        setTimeout(() => {
          isSyncingRef.current = false
        }, 0)
      }
    },
    [createContext],
  )

  const updateFulltextAddress = useCallback(
    (data: typeof updateContext.fulltextAddress) => {
      if (!isSyncingRef.current) {
        isSyncingRef.current = true
        createContext.updateFulltextAddress(data)
        setTimeout(() => {
          isSyncingRef.current = false
        }, 0)
      }
    },
    [createContext],
  )

  // Sync property info - only when it actually changes
  useEffect(() => {
    const propertyInfoStr = JSON.stringify(updateContext.propertyInfo)

    if (
      updateContext.propertyInfo &&
      Object.keys(updateContext.propertyInfo).length > 0 &&
      propertyInfoStr !== lastPropertyInfoRef.current
    ) {
      lastPropertyInfoRef.current = propertyInfoStr
      updatePropertyInfo(updateContext.propertyInfo)
    }
  }, [updateContext.propertyInfo, updatePropertyInfo])

  // Sync fulltext address - only when it changes
  useEffect(() => {
    const addressStr = JSON.stringify(updateContext.fulltextAddress)

    if (
      updateContext.fulltextAddress &&
      Object.keys(updateContext.fulltextAddress).length > 0 &&
      addressStr !== lastAddressRef.current
    ) {
      lastAddressRef.current = addressStr
      updateFulltextAddress(updateContext.fulltextAddress)

      // Also sync the address structure in propertyInfo if it exists
      if (updateContext.propertyInfo?.address) {
        if (!isSyncingRef.current) {
          isSyncingRef.current = true
          createContext.updatePropertyInfo({
            address: updateContext.propertyInfo.address,
          })
          setTimeout(() => {
            isSyncingRef.current = false
          }, 0)
        }
      }
    }
  }, [
    updateContext.fulltextAddress,
    updateContext.propertyInfo?.address,
    updateFulltextAddress,
    createContext,
  ])

  // Sync media - only when it changes
  useEffect(() => {
    const mediaStr = JSON.stringify(updateContext.media)

    if (
      updateContext.media &&
      updateContext.media.length > 0 &&
      mediaStr !== lastMediaRef.current
    ) {
      lastMediaRef.current = mediaStr

      if (!isSyncingRef.current) {
        isSyncingRef.current = true
        // Clear and set media
        createContext.resetMedia()
        updateContext.media.forEach((mediaItem) => {
          if (mediaItem.mediaId) {
            createContext.updateMedia(mediaItem)
          }
        })
        setTimeout(() => {
          isSyncingRef.current = false
        }, 0)
      }
    }
  }, [updateContext.media, createContext])

  return <>{children}</>
}
