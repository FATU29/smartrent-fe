import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

/**
 * Renders the React Query Devtools in development only.
 *
 * The `process.env.NODE_ENV` check lives here (not in `_app.tsx`) on purpose:
 * this component is loaded via `next/dynamic` with `ssr: false`, so it sits in
 * its own client chunk. Keeping the env reference out of the `_app` entry
 * module avoids the Turbopack dev bug where requiring the `process` polyfill at
 * module evaluation crashes with "module factory is not available".
 */
const DevtoolsGate = () => {
  if (process.env.NODE_ENV !== 'development') {
    return null
  }
  return <ReactQueryDevtools initialIsOpen={false} />
}

export default DevtoolsGate
