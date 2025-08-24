import React from 'react'
import { Button } from '@/components/atoms/button'
import { AlertTriangle } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; retry?: () => void }>
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Component Error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return (
        <FallbackComponent error={this.state.error} retry={this.handleRetry} />
      )
    }

    return this.props.children
  }
}

function DefaultErrorFallback({
  error,
  retry,
}: {
  error?: Error
  retry?: () => void
}) {
  return (
    <div className='flex flex-col items-center justify-center min-h-[200px] p-6 text-center'>
      <AlertTriangle className='h-12 w-12 text-red-500 mb-4' />
      <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2'>
        Something went wrong
      </h3>
      <p className='text-gray-600 dark:text-gray-400 mb-4'>
        {error?.message || 'Unable to load component. Please try again.'}
      </p>
      <Button onClick={retry} variant='outline'>
        Try again
      </Button>
    </div>
  )
}

export function LazyErrorFallback({ retry }: { retry?: () => void }) {
  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
      <div className='bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4'>
        <DefaultErrorFallback retry={retry} />
      </div>
    </div>
  )
}

export default ErrorBoundary
