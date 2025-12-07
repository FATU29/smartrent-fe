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

  return (
    <>
      <div className='space-y-4'>
        {drafts.map((draft) => (
          <DraftCard
            key={draft.id}
            draft={{
              id: draft.id,
              title: draft.title,
              description: draft.description,
              address:
                `${draft.address.street || ''} ${draft.address.wardCode || ''} ${draft.address.provinceCode || ''}`.trim(),
              propertyType: draft.productType,
              price: draft.price,
              area: draft.area,
              bedrooms: draft.bedrooms,
              bathrooms: draft.bathrooms,
              images: [], // Media IDs only, need to fetch separately or include URLs in backend
              createdAt: draft.createdAt,
              updatedAt: draft.updatedAt,
            }}
            onEdit={() => handleEditClick(draft.id)}
            onDelete={() => handleDeleteClick(draft.id)}
          />
        ))}
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
