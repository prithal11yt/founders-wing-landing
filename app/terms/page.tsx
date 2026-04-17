import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Terms of Service — Founders Wing',
  description: 'Terms and conditions for using the Founders Wing community.',
}

export default function TermsOfService() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Minimal nav */}
      <header className="border-b border-foreground/5 py-4 px-6">
        <Link href="/" className="inline-flex items-center gap-2">
          <Image src="/logo-icon.png" alt="Founders Wing" width={24} height={24} className="object-contain" />
          <span className="font-semibold tracking-tight">Founders Wing</span>
        </Link>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl prose prose-invert prose-sm md:prose-base">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground text-sm mb-8">Last updated: April 17, 2026</p>

        <section className="space-y-6 text-muted-foreground leading-relaxed">

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">1. Acceptance of Terms</h2>
            <p>
              By joining or accessing Founders Wing, you agree to be bound by these Terms of Service. If you do not agree,
              please do not use our services. These terms apply to all members, visitors, and anyone who interacts with
              Founders Wing content or platforms.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">2. About Founders Wing</h2>
            <p>
              Founders Wing is a paid membership community for aspiring founders, operated by Prithal Bhardwaj.
              It includes access to live sessions, resources, sprint challenges, and a private WhatsApp community.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">3. Membership and Payment</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Membership is available on a 6-month (₹2,999) or 12-month (₹4,999) basis.</li>
              <li>Payment is due in full at the time of joining. All prices are in Indian Rupees (INR) and inclusive of applicable taxes.</li>
              <li>Access is granted after successful payment confirmation.</li>
              <li>Membership is personal and non-transferable.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">4. Refund Policy</h2>
            <p>
              Due to the digital and community-based nature of the membership, we generally do not offer refunds after access
              has been granted. If you experience a technical issue preventing access, contact us within 7 days of purchase
              at <a href="mailto:prithalbhardwaj@gmail.com" className="text-accent-cyan hover:underline">prithalbhardwaj@gmail.com</a> and
              we will resolve it promptly or issue a refund at our discretion.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">5. Member Conduct</h2>
            <p>As a member of Founders Wing, you agree to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Treat all community members with respect.</li>
              <li>Not share, resell, or distribute any paid resources, playbooks, or session recordings outside the community.</li>
              <li>Not engage in spam, self-promotion without context, or any harmful behaviour within community channels.</li>
              <li>Not impersonate other members or the Founders Wing team.</li>
            </ul>
            <p className="mt-2">
              Violation of these conduct standards may result in immediate removal from the community without refund.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">6. Intellectual Property</h2>
            <p>
              All content created by Founders Wing — including ebooks, templates, playbooks, session recordings, and
              website content — is the intellectual property of Prithal Bhardwaj. You may use these materials for your
              own personal business purposes but may not reproduce, distribute, or sell them without explicit written permission.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">7. Disclaimer</h2>
            <p>
              Founders Wing provides education, community, and accountability — not financial, legal, or investment advice.
              Any results mentioned (e.g. earnings from sprint challenges) are examples and not guarantees. Your results will
              depend on your effort, skills, and market conditions.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Founders Wing and Prithal Bhardwaj shall not be liable for any indirect,
              incidental, or consequential damages arising from your use of the community or its resources. Our total liability
              shall not exceed the amount you paid for your current membership period.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">9. Modifications to the Service</h2>
            <p>
              We reserve the right to modify, pause, or discontinue any part of the Founders Wing service with reasonable notice
              to members. We will always aim to provide at least 30 days&apos; notice for any material changes.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">10. Governing Law</h2>
            <p>
              These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction
              of the courts in India.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">11. Contact</h2>
            <p>
              For any questions about these terms, contact us at{' '}
              <a href="mailto:prithalbhardwaj@gmail.com" className="text-accent-cyan hover:underline">prithalbhardwaj@gmail.com</a>.
            </p>
          </div>

        </section>
      </main>

      <footer className="border-t border-foreground/5 py-6 px-6 text-center text-xs text-muted-foreground">
        <p>© 2026 Founders Wing · <Link href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link></p>
      </footer>
    </div>
  )
}
