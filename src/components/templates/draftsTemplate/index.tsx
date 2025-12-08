import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { DraftCard } from '@/components/molecules/draftCard'
import { DraftCardSkeleton } from '@/components/molecules/draftCard/DraftCardSkeleton'
import { DraftEmptyState } from '@/components/organisms/drafts/DraftEmptyState'
import { DeleteDraftDialog } from '@/components/molecules/deleteDraftDialog'
import { useDeleteDraft } from '@/hooks/useListings/useDeleteDraft'
import { Typography } from '@/components/atoms/typography'
import { cn } from '@/lib/utils'
import type { DraftDetail } from '@/utils/property/mapDraftResponse'

interface DraftsTemplateProps {
  drafts: DraftDetail[]
  isLoading: boolean
  className?: string
}

const DraftsList: React.FC<{
  drafts: DraftDetail[]
  isLoading: boolean
}> = ({ drafts, isLoading }) => {
  const router = useRouter()
  const tDelete = useTranslations('seller.drafts.delete')
  const [draftToDelete, setDraftToDelete] = useState<number | null>(null)
  const deleteMutation = useDeleteDraft()

  const handleDeleteClick = useCallback((listingId: number) => {
    setDraftToDelete(listingId)
  }, [])

  const handleEditClick = useCallback(
    (draftId: number) => {
      router.push(`/seller/create-post?draftId=${draftId}`)
    },
    [router],
  )

  const handleConfirmDelete = useCallback(async () => {
    if (draftToDelete === null) return

    try {
      await deleteMutation.mutateAsync(String(draftToDelete))
      toast.success(tDelete('success'))
      setDraftToDelete(null)
    } catch {
      toast.error(tDelete('error'))
    }
  }, [draftToDelete, deleteMutation, tDelete])

  const handleCancelDelete = useCallback(() => {
    setDraftToDelete(null)
  }, [])

  if (isLoading) {
    return <DraftCardSkeleton count={3} />
  }

  if (drafts.length === 0) {
    return <DraftEmptyState />
  }

  // Helper function to build full address string - prioritize backend full addresses
  const getFullAddressString = (draft: DraftDetail): string => {
    const addr = draft.address

    // Priority 1: Use complete full address from backend
    if (addr.fullNewAddress?.trim()) {
      return addr.fullNewAddress.trim()
    }

    if (addr.fullAddress?.trim()) {
      return addr.fullAddress.trim()
    }

    // Priority 2: Build detailed address from available components
    const parts: string[] = []

    // Add project name (highest priority for display)
    if (addr.projectName?.trim()) {
      parts.push(addr.projectName.trim())
    }

    // Add street information
    if (addr.streetName?.trim()) {
      parts.push(addr.streetName.trim())
    } else if (addr.street?.trim()) {
      parts.push(addr.street.trim())
    }

    // Add administrative divisions based on address type
    if (addr.type === 'NEW') {
      // New address system (2-tier: Ward, Province)
      if (addr.wardCode?.trim()) {
        parts.push(addr.wardCode.trim())
      }
      if (addr.provinceCode?.trim()) {
        parts.push(addr.provinceCode.trim())
      }
    } else {
      // Old address system (3-tier: Ward, District, Province)
      if (addr.wardName?.trim()) {
        parts.push(addr.wardName.trim())
      }

      if (addr.districtName?.trim()) {
        parts.push(addr.districtName.trim())
      }

      if (addr.provinceName?.trim()) {
        parts.push(addr.provinceName.trim())
      }
    }

    const addressString = parts.filter(Boolean).join(', ')

    // Fallback
    return addressString || 'Địa chỉ đang được cập nhật'
  }

  // Helper to get primary image or first image
  const getPrimaryImage = (draft: DraftDetail): string | undefined => {
    if (!draft.media || draft.media.length === 0) return undefined

    const primaryMedia = draft.media.find(
      (m) => m.isPrimary && m.mediaType === 'IMAGE',
    )
    if (primaryMedia) return primaryMedia.url

    const firstImage = draft.media.find((m) => m.mediaType === 'IMAGE')
    return firstImage?.url
  }

  return (
    <>
      <div className='space-y-4'>
        {drafts.map((draft) => {
          const primaryImageUrl = getPrimaryImage(draft)
          const images = primaryImageUrl ? [primaryImageUrl] : []

          return (
            <DraftCard
              key={draft.id}
              draft={{
                id: draft.id,
                title: draft.title,
                description: draft.description,
                address: getFullAddressString(draft),
                propertyType: draft.productType,
                price: draft.price,
                area: draft.area,
                bedrooms: draft.bedrooms,
                bathrooms: draft.bathrooms,
                images: images,
                createdAt: draft.createdAt,
                updatedAt: draft.updatedAt,
              }}
              onEdit={() => handleEditClick(draft.id)}
              onDelete={() => handleDeleteClick(draft.id)}
            />
          )
        })}
      </div>

      <DeleteDraftDialog
        open={draftToDelete !== null}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={deleteMutation.isPending}
      />
    </>
  )
}

export const DraftsTemplate: React.FC<DraftsTemplateProps> = ({
  drafts,
  isLoading,
  className,
}) => {
  const t = useTranslations('seller.drafts')

  return (
    <div className={cn('p-3 sm:p-4', className)}>
      <div className='mx-auto flex max-w-7xl flex-col gap-4 sm:gap-6'>
        {/* Header */}
        <div className='space-y-2'>
          <Typography variant='h1'>{t('title')}</Typography>
          <Typography variant='muted'>{t('description')}</Typography>
        </div>

        {/* Drafts List */}
        <DraftsList drafts={drafts} isLoading={isLoading} />
      </div>
    </div>
  )
}
