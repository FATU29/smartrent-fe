import type { NextPage } from 'next'
import type { AppProps } from 'next/app'
import React from 'react'
import type { SeoProps } from './seo.types'

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: React.ReactNode) => React.ReactNode
  seo?: SeoProps
}

export type AppPropsWithLayout<P = {}> = AppProps<P> & {
  Component: NextPageWithLayout<P>
}
