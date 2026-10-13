// Cohorts. Cohort 1 = the founding 50, closed in October 2026 at the founding price.
// Cohort 2 is open. Its first EARLY_SPOTS members also join the Cohort 1 group, so a
// brand-new group never has two people in it; once Cohort 2 reaches EARLY_SPOTS
// members it gets its own group. Live sessions and the main community are shared.
export const COHORT_1_SIZE = 50
export const EARLY_SPOTS = 10

export const cohortOf = (memberNo: number) => (memberNo <= COHORT_1_SIZE ? 1 : 2)
export const cohort2Count = (totalMembers: number) => Math.max(0, totalMembers - COHORT_1_SIZE)
export const earlySpotsLeft = (totalMembers: number) => Math.max(0, EARLY_SPOTS - cohort2Count(totalMembers))
