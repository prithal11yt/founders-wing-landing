// The DIWALI code: 20% off, which brings the Cohort 2 list price back to the
// founding price (₹7,499 → ₹5,999 and ₹12,499 → ₹9,999). Razorpay applies the
// discount at payment; the code itself is only a lookup key on the checkout server.
// Every mention on the site checks couponActive(), so the code never shows after
// the end date.
export const COUPON = { code: 'DIWALI', percent: 20, until: '2026-11-15' } // last day it works (IST)

export function couponActive(now = new Date()): boolean {
  const ist = new Date(now.getTime() + 5.5 * 3600 * 1000).toISOString().slice(0, 10)
  return ist <= COUPON.until
}

export const discounted = (price: number) => Math.round((price * (100 - COUPON.percent)) / 100)
export const COUPON_ENDS_LABEL = new Date(COUPON.until + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })
