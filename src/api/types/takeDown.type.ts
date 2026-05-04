export interface TakeDownListingRequest {
  listingId: number
}

export interface TakeDownResponse {
  listingId: number
  userId: string
  takenDownAt: string
  message: string
}
