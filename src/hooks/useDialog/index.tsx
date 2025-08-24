import { useState, useCallback } from 'react'

type UseDialogProps = {
  onOpen?: () => void
  onClose?: () => void
}

type UseDialogReturn = {
  open: boolean
  handleOpen: () => void
  handleClose: () => void
}

const useDialog = ({
  onOpen,
  onClose,
}: UseDialogProps = {}): UseDialogReturn => {
  const [open, setOpen] = useState(false)

  const handleOpen = useCallback(() => {
    if (onOpen) {
      onOpen()
    }
    setOpen(true)
  }, [onOpen])

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose()
    }
    setOpen(false)
  }, [onClose])

  return {
    open,
    handleOpen,
    handleClose,
  }
}

export { useDialog }
