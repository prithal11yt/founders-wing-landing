"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2, CheckCircle2 } from "lucide-react"

export function WaitlistForm({
  spotsCount = 25,
  comingSoon = false,
}: {
  spotsCount?: number
  comingSoon?: boolean
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    whatsapp: "",
    idea: "",
    goal: "",
    heardFrom: "",
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

      if (comingSoon) {
        setSubmitted(true)
      } else {
        const query = new URLSearchParams({
          name: formData.fullName,
          email: formData.email,
          whatsapp: formData.whatsapp,
        })
        router.push(`/secure-spot?${query.toString()}`)
      }
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

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <CheckCircle2 className="h-12 w-12 text-sky-400" />
        <h3 className="text-xl font-bold text-foreground">You're on the list!</h3>
        <p className="text-muted-foreground max-w-sm">
          We'll personally reach out to you the moment Founders Wing opens its doors. Keep building 🚀
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {/* Name + Email */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-muted-foreground">Full Name <span className="text-red-500">*</span></Label>
          <Input
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            placeholder="Arjun Sharma"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-muted-foreground">Email Address <span className="text-red-500">*</span></Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="arjun@gmail.com"
          />
        </div>
      </div>

      {/* WhatsApp */}
      <div className="space-y-2">
        <Label htmlFor="whatsapp" className="text-muted-foreground">
          WhatsApp Number <span className="text-red-500">*</span>
        </Label>
        <p className="text-xs text-muted-foreground">We'll notify you on WhatsApp when we launch. Include country code (e.g. +91 98765 43210).</p>
        <Input
          id="whatsapp"
          name="whatsapp"
          type="tel"
          value={formData.whatsapp}
          onChange={handleChange}
          required
          placeholder="+91 98765 43210"
        />
      </div>

      {/* Idea */}
      <div className="space-y-2">
        <Label htmlFor="idea" className="text-muted-foreground">
          What idea or niche are you thinking about? <span className="text-red-500">*</span>
        </Label>
        <p className="text-xs text-muted-foreground">Even a rough idea is fine — "not sure yet" works too.</p>
        <Textarea
          id="idea"
          name="idea"
          value={formData.idea}
          onChange={handleChange}
          required
          placeholder="e.g. AI content tools for small businesses, freelance design, selling digital templates, not sure yet..."
          className="min-h-[90px]"
        />
      </div>

      {/* Goal */}
      <div className="space-y-2">
        <Label htmlFor="goal" className="text-muted-foreground">
          What does success look like for you in the next 3 months? <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="goal"
          name="goal"
          value={formData.goal}
          onChange={handleChange}
          required
          placeholder="e.g. Quit my job, make ₹10K online, launch my first product, find a co-founder..."
          className="min-h-[90px]"
        />
      </div>

      {/* Heard from */}
      <div className="space-y-2">
        <Label htmlFor="heardFrom" className="text-muted-foreground">How did you hear about Founders Wing? <span className="text-red-500">*</span></Label>
        <select
          id="heardFrom"
          name="heardFrom"
          value={formData.heardFrom}
          onChange={handleChange}
          required
          className="w-full neu-pressed rounded-2xl text-foreground placeholder:text-muted-foreground/60 focus:ring-1 focus:ring-accent-cyan outline-none px-4 py-3"
        >
          <option value="">Select source</option>
          <option value="youtube">YouTube</option>
          <option value="twitter-linkedin">Twitter / LinkedIn</option>
          <option value="whatsapp">WhatsApp community</option>
          <option value="friend-referral">Friend / Referral</option>
          <option value="other">Other</option>
        </select>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full neu-button-primary rounded-2xl h-14 text-lg font-semibold mt-4 shadow-[0_0_30px_rgba(2,132,199,0.3),0_0_60px_rgba(2,132,199,0.1)]"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : comingSoon ? (
          <>
            Notify Me at Launch
            <Send className="w-4 h-4 ml-2" />
          </>
        ) : (
          <>
            Get Membership
            <Send className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        {comingSoon
          ? "Free to join the waitlist · No credit card required"
          : `${spotsCount} of 50 founding spots filled · Instant access after payment`}
      </p>
    </form>
  )
}
