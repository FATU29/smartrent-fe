'use client'
import SeoHead from '@/components/atoms/seo/SeoHead'
import GoogleCallback from '@/components/templates/googleCallback'

export default function GoogleCallbackPage() {
  return (
    <>
      <SeoHead
        title='Google Authentication'
        description='Authenticate with your Google account'
      />
      <GoogleCallback />
    </>
  )
}
