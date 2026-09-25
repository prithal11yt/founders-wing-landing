// The FESTIVAL offer: 20% off for the next OFFER_SPOTS members after OFFER_BASELINE.
// Everything that mentions the code checks offerSpotsLeft() against the real member
// count, so the site never advertises an offer that has run out.
export const OFFER_BASELINE = 39 // members on the day the offer opened
export const OFFER_SPOTS = 10
export const COUPON_CODE = 'FESTIVAL'

export function offerSpotsLeft(memberCount: number): number {
  return Math.max(0, Math.min(OFFER_SPOTS, OFFER_SPOTS - (memberCount - OFFER_BASELINE)))
}
