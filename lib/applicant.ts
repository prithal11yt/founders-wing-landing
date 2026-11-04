// Name, email and WhatsApp carried from the apply form to checkout. They stay out of
// page URLs, because analytics and ad tags record the full address of every page.
const KEY = 'fw_applicant'

export type Applicant = { name: string; email: string; whatsapp: string }

export function saveApplicant(applicant: Applicant) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(applicant))
  } catch {
    // Checkout asks for the details again if they can't be kept.
  }
}

export function readApplicant(): Applicant {
  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY) || '{}')
    return { name: saved.name || '', email: saved.email || '', whatsapp: saved.whatsapp || '' }
  } catch {
    return { name: '', email: '', whatsapp: '' }
  }
}
