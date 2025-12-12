import { FC, ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/atoms/button'
import { cn } from '@/lib/utils'

type TAiChatButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'ghost' | 'outline' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  isLoading?: boolean
  children?: React.ReactNode
  className?: string
}

const AiChatButton: FC<TAiChatButtonProps> = ({
  variant = 'default',
  size = 'default',
  isLoading = false,
  children,
  className,
  disabled,
  ...props
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled || isLoading}
      className={cn('relative', className)}
      {...props}
    >
      {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
      {children}
    </Button>
  )
}

export default AiChatButton
