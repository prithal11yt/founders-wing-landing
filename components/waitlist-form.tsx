"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2, CheckCircle2 } from "lucide-react"

const sections = [
  { id: 'personal', label: 'Personal' },
  { id: 'startup', label: 'Startup' },
  { id: 'community', label: 'Community' },
  { id: 'payment', label: 'Payment' },
  { id: 'additional', label: 'Additional' },
]

export function WaitlistForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState('personal')
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    social: "",
    building: "",
    monthsWorking: "",
    currentStage: "",
    workingFullTime: "",
    joinReason: "",
    challenge: "",
    contribute: "",
    monthlyBudget: "",
    paidCommunity: "",
    heardFrom: "",
    otherInfo: "",
  })

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to submit application")
      }

      setIsSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit application")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  if (isSubmitted) {
    return (
      <div className="text-center py-12 space-y-4 animate-in fade-in duration-500">
        <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-foreground">Application Received!</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Thank you for applying to Founders Wing. We review every application personally and will reach out within 3-5
          business days.
        </p>
        <Button
          onClick={() => {
            setIsSubmitted(false)
            setFormData({
              fullName: "", email: "", social: "", building: "", monthsWorking: "",
              currentStage: "", workingFullTime: "", joinReason: "", challenge: "",
              contribute: "", monthlyBudget: "", paidCommunity: "", heardFrom: "", otherInfo: "",
            })
          }}
          variant="outline"
          className="mt-6 border-foreground/10 hover:bg-foreground hover:text-background"
        >
          Submit another application
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-left">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {/* Section progress indicator */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {sections.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              const el = document.getElementById(`form-section-${s.id}`)
              el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              setActiveSection(s.id)
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              activeSection === s.id
                ? 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30'
                : 'text-muted-foreground hover:text-foreground border border-transparent'
            }`}
          >
            <span className="text-muted-foreground/50 mr-1.5">{i + 1}</span>
            {s.label}
          </button>
        ))}
      </div>

      {/* Personal Information */}
      <div id="form-section-personal" className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-accent-cyan/10 text-accent-cyan text-xs font-bold flex items-center justify-center border border-accent-cyan/20">1</span>
          Personal Information
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-muted-foreground">Full Name <span className="text-red-500">*</span></Label>
            <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} onFocus={() => setActiveSection('personal')} required placeholder="Jane Doe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-muted-foreground">Email Address <span className="text-red-500">*</span></Label>
            <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} onFocus={() => setActiveSection('personal')} required placeholder="jane@company.com" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="social" className="text-muted-foreground">LinkedIn / Twitter / Personal Website <span className="text-red-500">*</span></Label>
          <Input id="social" name="social" value={formData.social} onChange={handleChange} onFocus={() => setActiveSection('personal')} required placeholder="https://linkedin.com/in/jane-doe" />
        </div>
      </div>

      {/* Startup Details */}
      <div id="form-section-startup" className="space-y-6 pt-6 border-t border-foreground/10">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold flex items-center justify-center border border-blue-500/20">2</span>
          Your Startup
        </h3>
        <div className="space-y-2">
          <Label htmlFor="building" className="text-muted-foreground">What are you building right now? <span className="text-red-500">*</span></Label>
          <p className="text-xs text-muted-foreground mb-2">What problem are you solving? Who is it for? What stage are you at?</p>
          <Textarea id="building" name="building" value={formData.building} onChange={handleChange} onFocus={() => setActiveSection('startup')} required placeholder="Tell us about your startup, the problem you're solving, and your current stage..." className="min-h-[100px]" />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="monthsWorking" className="text-muted-foreground">How long have you been working on this? <span className="text-red-500">*</span></Label>
            <select id="monthsWorking" name="monthsWorking" value={formData.monthsWorking} onChange={handleChange} onFocus={() => setActiveSection('startup')} required className="w-full neu-pressed rounded-2xl text-foreground placeholder:text-muted-foreground/60 focus:ring-1 focus:ring-accent-cyan outline-none px-4 py-3">
              <option value="">Select duration</option>
              <option value="less-3">Less than 3 months</option>
              <option value="3-6">3-6 months</option>
              <option value="6-12">6-12 months</option>
              <option value="1-3-years">1-3 years</option>
              <option value="3-plus">3+ years</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentStage" className="text-muted-foreground">Current stage of your startup <span className="text-red-500">*</span></Label>
            <select id="currentStage" name="currentStage" value={formData.currentStage} onChange={handleChange} onFocus={() => setActiveSection('startup')} required className="w-full neu-pressed rounded-2xl text-foreground placeholder:text-muted-foreground/60 focus:ring-1 focus:ring-accent-cyan outline-none px-4 py-3">
              <option value="">Select stage</option>
              <option value="idea">Idea stage (no product yet)</option>
              <option value="mvp">MVP built</option>
              <option value="early-users">Early users / pilots</option>
              <option value="revenue">Revenue-generating</option>
              <option value="scaling">Scaling</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="workingFullTime" className="text-muted-foreground">Are you working on this full-time? <span className="text-red-500">*</span></Label>
          <div className="space-y-3">
            {[
              { value: "full-time", label: "Yes, full-time founder" },
              { value: "part-time", label: "No, part-time (but serious)" },
              { value: "exploring", label: "No, just exploring" },
            ].map((option) => (
              <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" name="workingFullTime" value={option.value} checked={formData.workingFullTime === option.value} onChange={handleChange} onFocus={() => setActiveSection('startup')} className="w-4 h-4" required />
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Community Fit */}
      <div id="form-section-community" className="space-y-6 pt-6 border-t border-foreground/10">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-violet-500/10 text-violet-400 text-xs font-bold flex items-center justify-center border border-violet-500/20">3</span>
          Community Fit
        </h3>
        <div className="space-y-2">
          <Label htmlFor="joinReason" className="text-muted-foreground">Why do you want to join this community? <span className="text-red-500">*</span></Label>
          <p className="text-xs text-muted-foreground mb-2">What are you missing right now that you think a founder community could help with?</p>
          <Textarea id="joinReason" name="joinReason" value={formData.joinReason} onChange={handleChange} onFocus={() => setActiveSection('community')} required placeholder="Share your thoughts about what you're looking for in a community..." className="min-h-[100px]" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="challenge" className="text-muted-foreground">What&apos;s the biggest challenge you&apos;re facing as a founder right now? <span className="text-red-500">*</span></Label>
          <Textarea id="challenge" name="challenge" value={formData.challenge} onChange={handleChange} onFocus={() => setActiveSection('community')} required placeholder="Be specific and honest..." className="min-h-[100px]" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contribute" className="text-muted-foreground">What can you contribute to other founders? <span className="text-red-500">*</span></Label>
          <Textarea id="contribute" name="contribute" value={formData.contribute} onChange={handleChange} onFocus={() => setActiveSection('community')} required placeholder="Skills, experiences, connections, or wisdom you can share..." className="min-h-[100px]" />
        </div>
      </div>

      {/* Paid Community Information */}
      <div id="form-section-payment" className="space-y-6 pt-6 border-t border-foreground/10 neu-flat rounded-3xl p-8">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold flex items-center justify-center border border-amber-500/20">4</span>
            Paid Community
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            This is a <span className="font-semibold text-foreground">paid, invite-only community</span>. We charge to keep the community high-quality and to fund tools, facilitation, and member-only events.
          </p>
        </div>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="monthlyBudget" className="text-muted-foreground">How much would you be willing to pay per month? <span className="text-red-500">*</span></Label>
            <select id="monthlyBudget" name="monthlyBudget" value={formData.monthlyBudget} onChange={handleChange} onFocus={() => setActiveSection('payment')} required className="w-full neu-pressed rounded-2xl text-foreground placeholder:text-muted-foreground/60 focus:ring-1 focus:ring-accent-cyan outline-none px-4 py-3">
              <option value="">Select your budget</option>
              <option value="499">&#8377;499</option>
              <option value="999">&#8377;999</option>
              <option value="1999">&#8377;1,999</option>
              <option value="2999">&#8377;2,999</option>
              <option value="4999">&#8377;4,999+</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="paidCommunity" className="text-muted-foreground">Are you comfortable paying for exclusivity and high signal? <span className="text-red-500">*</span></Label>
            <div className="space-y-3">
              {[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }].map((option) => (
                <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" name="paidCommunity" value={option.value} checked={formData.paidCommunity === option.value} onChange={handleChange} onFocus={() => setActiveSection('payment')} className="w-4 h-4" required />
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div id="form-section-additional" className="space-y-6 pt-6 border-t border-foreground/10">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold flex items-center justify-center border border-emerald-500/20">5</span>
          Additional Information
        </h3>
        <div className="space-y-2">
          <Label htmlFor="heardFrom" className="text-muted-foreground">How did you hear about this community? <span className="text-red-500">*</span></Label>
          <select id="heardFrom" name="heardFrom" value={formData.heardFrom} onChange={handleChange} onFocus={() => setActiveSection('additional')} required className="w-full neu-pressed rounded-2xl text-foreground placeholder:text-muted-foreground/60 focus:ring-1 focus:ring-accent-cyan outline-none px-4 py-3">
            <option value="">Select source</option>
            <option value="youtube">YouTube</option>
            <option value="twitter-linkedin">Twitter / LinkedIn</option>
            <option value="friend-referral">Friend / Referral</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="otherInfo" className="text-muted-foreground">Anything else you think we should know about you?</Label>
          <Textarea id="otherInfo" name="otherInfo" value={formData.otherInfo} onChange={handleChange} onFocus={() => setActiveSection('additional')} placeholder="Optional: Share anything else that would help us understand you better..." className="min-h-[80px]" />
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full neu-button-primary rounded-2xl h-14 text-lg font-semibold mt-8 shadow-[0_0_30px_rgba(2,132,199,0.3),0_0_60px_rgba(2,132,199,0.1)]"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            Submit Application
            <Send className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
    </form>
  )
}
