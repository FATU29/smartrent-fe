import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  VisuallyHidden,
} from '@/components/atoms/dialog'
import CustomerDetailPanel from '@/components/organisms/customerManagement/customerDetailPanel'
import ListingDetailPanel from '@/components/organisms/customerManagement/listingDetailPanel'
import { Customer, ListingWithCustomers } from '@/api/types/customer.type'

interface MobileDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activeTab: 'customers' | 'listings'
  selectedCustomer: Customer | null
  selectedListing: ListingWithCustomers | null
  language: string
}

const MobileDetailDialog: React.FC<MobileDetailDialogProps> = ({
  open,
  onOpenChange,
  activeTab,
  selectedCustomer,
  selectedListing,
  language,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className='h-screen max-w-full w-full p-0 rounded-none lg:hidden border-none'
        showCloseButton={true}
      >
        <VisuallyHidden>
          <DialogTitle>
            {activeTab === 'customers' ? 'Customer Details' : 'Listing Details'}
          </DialogTitle>
          <DialogDescription>
            {activeTab === 'customers'
              ? 'View customer information and interactions'
              : 'View listing information and customer interactions'}
          </DialogDescription>
        </VisuallyHidden>
        <div className='h-full overflow-hidden'>
          {activeTab === 'customers' && selectedCustomer ? (
            <CustomerDetailPanel customer={selectedCustomer} />
          ) : activeTab === 'listings' && selectedListing ? (
            <ListingDetailPanel listing={selectedListing} language={language} />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default MobileDetailDialog
