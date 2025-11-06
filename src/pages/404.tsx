import React from 'react'
import { NextPage } from 'next'
import { NotFoundTemplate } from '@/components/templates/not-found-template'

const NotFoundPage: NextPage = () => {
  return <NotFoundTemplate />
}

export async function getStaticProps({ locale }: { locale?: string }) {
  const currentLocale = locale || 'vi' // Default to Vietnamese

  return {
    props: {
      messages: (await import(`@/messages/${currentLocale}.json`)).default,
    },
  }
}

export default NotFoundPage
