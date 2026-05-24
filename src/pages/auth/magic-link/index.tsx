'use client'
import SeoHead from '@/components/atoms/seo/SeoHead'
import MagicLinkCallback from '@/components/templates/magicLinkCallback'

export default function MagicLinkCallbackPage() {
  return (
    <>
      <SeoHead
        title='Magic Link Sign-in'
        description='Sign in to SmartRent with a one-time email link.'
      />
      <MagicLinkCallback />
    </>
  )
}
