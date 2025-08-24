export function handleDeepLink(link?: string) {
  if (!link) return
  try {
    const isUrl = new URL(link)
    if (isUrl) {
      window.open(link, '_blank')
    }
  } catch (error) {
    console.log('🚀 ~ handleDeepLink ~ error:', error)
  }
}
