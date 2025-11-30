import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/atoms/dialog'
import { Button } from '@/components/atoms/button'

export interface NotificationDialogProps {
  open: boolean
  title: string
  description?: string
  okText: string
  onOpenChange: (open: boolean) => void
  onOk?: () => void
}

export const NotificationDialog: React.FC<NotificationDialogProps> = ({
  open,
  title,
  description,
  okText,
  onOpenChange,
  onOk,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[480px]'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={() => {
              onOpenChange(false)
              onOk?.()
            }}
          >
            {okText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default NotificationDialog
