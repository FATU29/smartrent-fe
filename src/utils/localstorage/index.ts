class LocalStorage {
  static get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null

    const item = localStorage.getItem(key)
    try {
      return item ? JSON.parse(item) : null
    } catch (err) {
      console.log('error in get LocalStorage: ', err)
      return null
    }
  }

  static set<T>(key: string, value: T) {
    if (typeof window === 'undefined') return

    localStorage.setItem(key, JSON.stringify(value))
  }

  static remove(key: string) {
    if (typeof window === 'undefined') return

    localStorage.removeItem(key)
  }

  static clear() {
    if (typeof window === 'undefined') return

    localStorage.clear()
  }
}

export { LocalStorage }
