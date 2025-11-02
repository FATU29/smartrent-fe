export const isYouTube = (url?: string): boolean =>
  Boolean(url && (url.includes('youtube.com') || url.includes('youtu.be')))

export const toYouTubeEmbed = (url: string): string | null => {
  try {
    const u = new URL(url)
    // youtu.be/<id>
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.replace('/', '')
      return id ? `https://www.youtube.com/embed/${id}` : null
    }
    // youtube.com/watch?v=<id>
    if (u.hostname.includes('youtube.com')) {
      const id = u.searchParams.get('v')
      if (id) return `https://www.youtube.com/embed/${id}`
      // already an /embed/<id>
      const parts = u.pathname.split('/')
      const embedIndex = parts.findIndex((p) => p === 'embed')
      if (embedIndex !== -1 && parts[embedIndex + 1]) {
        return `https://www.youtube.com/embed/${parts[embedIndex + 1]}`
      }
    }
    return null
  } catch {
    return null
  }
}
