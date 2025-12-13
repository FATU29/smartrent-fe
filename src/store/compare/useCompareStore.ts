import { ListingApi } from '@/api/types/property.type'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface CompareState {
  // State
  compareList: ListingApi[]

  // Actions
  addToCompare: (item: ListingApi) => boolean
  removeFromCompare: (listingId: number) => void
  clearCompare: () => void
  isInCompare: (listingId: number) => boolean
}

const MAX_COMPARE_ITEMS = 3

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      // Initial state
      compareList: [],

      // Add item to compare list (max 3 items)
      // Returns true if added successfully, false if limit reached
      addToCompare: (item) => {
        const { compareList } = get()

        // Check if already in list
        if (
          compareList.some((listing) => listing.listingId === item.listingId)
        ) {
          return true // Already added, consider it success
        }

        // Check if limit reached
        if (compareList.length >= MAX_COMPARE_ITEMS) {
          return false // Limit reached
        }

        // Add to list
        set({
          compareList: [...compareList, item],
        })

        return true
      },

      // Remove item from compare list
      removeFromCompare: (listingId) => {
        set({
          compareList: get().compareList.filter(
            (listing) => listing.listingId !== listingId,
          ),
        })
      },

      // Clear all items
      clearCompare: () => {
        set({ compareList: [] })
      },

      // Check if item is in compare list
      isInCompare: (listingId) => {
        return get().compareList.some(
          (listing) => listing.listingId === listingId,
        )
      },
    }),
    {
      name: 'compare-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist the compare list
      partialize: (state) => ({
        compareList: state.compareList,
      }),
    },
  ),
)

// Export constant for use in components
export { MAX_COMPARE_ITEMS }
