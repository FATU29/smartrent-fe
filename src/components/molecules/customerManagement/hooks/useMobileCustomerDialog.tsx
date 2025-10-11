import { useIsMobile } from '@/hooks/useMediaQuery'
import { useDialog } from '@/hooks/useDialog'

export const useMobileCustomerDialog = () => {
  const isMobile = useIsMobile()
  const { open: dialogOpen, handleOpen, handleClose } = useDialog()

  const openDialog = () => {
    if (isMobile) {
      handleOpen()
    }
  }

  const setDialogOpen = (open: boolean) => {
    if (open) {
      handleOpen()
    } else {
      handleClose()
    }
  }

  return {
    isMobile,
    dialogOpen,
    openDialog,
    closeDialog: handleClose,
    setDialogOpen,
  }
}
