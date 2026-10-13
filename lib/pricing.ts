// The one place membership prices live. Change the numbers here and every page,
// the FAQ, the terms and the checkout copy follow.
const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`

export const PRICING = {
  starter: { label: '6 months', months: 6, price: 7499 },
  annual: { label: '12 months', months: 12, price: 12499 },
} as const
export type PlanKey = keyof typeof PRICING

export const PLANS = Object.fromEntries(
  (Object.keys(PRICING) as PlanKey[]).map(k => {
    const p = PRICING[k]
    return [k, { label: p.label, price: inr(p.price), monthly: inr(Math.round(p.price / p.months)), billed: `Billed ${inr(p.price)} for ${p.label}` }]
  }),
) as Record<PlanKey, { label: string; price: string; monthly: string; billed: string }>

export const STARTER_PRICE = inr(PRICING.starter.price)
export const ANNUAL_PRICE = inr(PRICING.annual.price)
export const STARTER_MONTHLY = PLANS.starter.monthly
export const ANNUAL_MONTHLY = PLANS.annual.monthly
export const PRICE_SENTENCE = `${STARTER_PRICE} for 6 months (${STARTER_MONTHLY}/month) or ${ANNUAL_PRICE} for a full year (${ANNUAL_MONTHLY}/month)`
export const inrFmt = inr
