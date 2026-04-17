import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Privacy Policy — Founders Wing',
  description: 'How Founders Wing collects, uses, and protects your personal data.',
}

export default function PrivacyPolicy() {
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
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground text-sm mb-8">Last updated: April 17, 2026</p>

        <section className="space-y-6 text-muted-foreground leading-relaxed">

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">1. Who We Are</h2>
            <p>
              Founders Wing (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is an AI-first founder community operated by Prithal Bhardwaj.
              You can reach us at <a href="mailto:prithalbhardwaj@gmail.com" className="text-accent-cyan hover:underline">prithalbhardwaj@gmail.com</a>.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">2. Information We Collect</h2>
            <p>When you apply for or purchase a Founders Wing membership, we collect:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Name and email address</strong> — to create your account and communicate with you.</li>
              <li><strong>Your business idea and goals</strong> — submitted via the application form, used to personalise your experience.</li>
              <li><strong>How you heard about us</strong> — to understand where our audience comes from.</li>
              <li><strong>Payment information</strong> — processed by our third-party payment provider. We do not store card details.</li>
            </ul>
            <p className="mt-2">
              We also collect standard usage data (browser type, pages visited, time on site) through server logs and analytics tools.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To process your membership application and grant access.</li>
              <li>To send you community updates, session links, and resources you signed up for.</li>
              <li>To improve our website and offerings based on aggregate usage patterns.</li>
              <li>To comply with legal obligations.</li>
            </ul>
            <p className="mt-2">We do not sell your personal data to any third party, ever.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">4. Data Storage and Security</h2>
            <p>
              Your application data is stored in Supabase, a cloud database provider with enterprise-grade security.
              We use HTTPS across all pages. Access to member data is restricted to authorised personnel only.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">5. Cookies</h2>
            <p>
              We use only essential cookies required for the site to function (session management, security tokens).
              We do not use tracking cookies or third-party advertising cookies.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">6. Third-Party Services</h2>
            <p>We use the following services that may process your data:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Supabase</strong> — database and authentication.</li>
              <li><strong>Payment gateway</strong> — for processing membership payments (Razorpay or equivalent).</li>
              <li><strong>YouTube</strong> — embedded videos on this site are subject to Google&apos;s privacy policy.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Request a copy of the personal data we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your data (subject to legal retention requirements).</li>
              <li>Withdraw consent for email communications at any time by emailing us or clicking unsubscribe.</li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, email us at <a href="mailto:prithalbhardwaj@gmail.com" className="text-accent-cyan hover:underline">prithalbhardwaj@gmail.com</a>.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">8. Children&apos;s Privacy</h2>
            <p>
              Founders Wing is intended for individuals aged 18 and above. We do not knowingly collect data from anyone under 18.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">9. Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. If we make significant changes, we will notify active members via email.
              The &quot;Last updated&quot; date at the top of this page will always reflect the most recent version.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">10. Contact</h2>
            <p>
              For any privacy-related questions, contact us at{' '}
              <a href="mailto:prithalbhardwaj@gmail.com" className="text-accent-cyan hover:underline">prithalbhardwaj@gmail.com</a>.
            </p>
          </div>

        </section>
      </main>

      <footer className="border-t border-foreground/5 py-6 px-6 text-center text-xs text-muted-foreground">
        <p>© 2026 Founders Wing · <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></p>
      </footer>
    </div>
  )
}
