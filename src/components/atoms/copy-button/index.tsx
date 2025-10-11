import React, { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/atoms/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/atoms/tooltip'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface CopyButtonProps {
  text: string
  successMessage?: string
  className?: string
  iconSize?: number
  variant?: 'ghost' | 'outline' | 'default'
}

const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  successMessage,
  className,
  iconSize = 14,
  variant = 'ghost',
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      if (successMessage) {
        toast.success(successMessage)
      }
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      toast.error('Failed to copy')
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size='icon'
            className={cn('h-7 w-7 shrink-0', className)}
            onClick={handleCopy}
          >
            {copied ? (
              <Check size={iconSize} className='text-green-600' />
            ) : (
              <Copy size={iconSize} />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{copied ? 'Copied!' : 'Copy'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default CopyButton
