import React from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/atoms/alert'
import { BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardNoDataStateProps {
  title: string
  description: string
  className?: string
}

const DashboardNoDataState: React.FC<DashboardNoDataStateProps> = ({
  title,
  description,
  className,
}) => {
  return (
    <Alert className={cn('border-dashed bg-muted/30', className)}>
      <BarChart3 className='h-4 w-4 text-muted-foreground' />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  )
}

export default DashboardNoDataState
