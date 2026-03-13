"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2, CheckCircle2 } from "lucide-react"

export function WaitlistForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
        headers: {
          "Content-Type": "application/json",
        },
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

      {/* Personal Information */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-foreground">Personal Information</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-muted-foreground">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="Jane Doe"
              className=""
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-muted-foreground">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="jane@company.com"
              className=""
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="social" className="text-muted-foreground">
            LinkedIn / Twitter / Personal Website <span className="text-red-500">*</span>
          </Label>
          <Input
            id="social"
            name="social"
            value={formData.social}
            onChange={handleChange}
            required
            placeholder="https://linkedin.com/in/jane-doe"
            className=""
          />
        </div>
      </div>

      {/* Startup Details */}
      <div className="space-y-6 pt-6 border-t border-foreground/10">
        <h3 className="text-xl font-semibold text-foreground">Your Startup</h3>
        <div className="space-y-2">
          <Label htmlFor="building" className="text-muted-foreground">
            What are you building right now? <span className="text-red-500">*</span>
          </Label>
          <p className="text-xs text-muted-foreground mb-2">
            💡 What problem are you solving? Who is it for? What stage are you at?
          </p>
          <Textarea
            id="building"
            name="building"
            value={formData.building}
            onChange={handleChange}
            required
            placeholder="Tell us about your startup, the problem you're solving, and your current stage..."
            className="min-h-[100px]"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="monthsWorking" className="text-muted-foreground">
              How long have you been working on this startup? <span className="text-red-500">*</span>
            </Label>
            <select
              id="monthsWorking"
              name="monthsWorking"
              value={formData.monthsWorking}
              onChange={handleChange}
              required
              className="w-full neu-pressed rounded-2xl text-foreground placeholder:text-muted-foreground/60 focus:ring-1 focus:ring-accent-cyan outline-none px-4 py-3"
            >
              <option value="">Select duration</option>
              <option value="less-3">Less than 3 months</option>
              <option value="3-6">3–6 months</option>
              <option value="6-12">6–12 months</option>
              <option value="1-3-years">1–3 years</option>
              <option value="3-plus">3+ years</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentStage" className="text-muted-foreground">
              Current stage of your startup <span className="text-red-500">*</span>
            </Label>
            <select
              id="currentStage"
              name="currentStage"
              value={formData.currentStage}
              onChange={handleChange}
              required
              className="w-full neu-pressed rounded-2xl text-foreground placeholder:text-muted-foreground/60 focus:ring-1 focus:ring-accent-cyan outline-none px-4 py-3"
            >
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
          <Label htmlFor="workingFullTime" className="text-muted-foreground">
            Are you working on this full-time? <span className="text-red-500">*</span>
          </Label>
          <div className="space-y-3">
            {[
              { value: "full-time", label: "Yes, full-time founder" },
              { value: "part-time", label: "No, part-time (but serious)" },
              { value: "exploring", label: "No, just exploring" },
            ].map((option) => (
              <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="workingFullTime"
                  value={option.value}
                  checked={formData.workingFullTime === option.value}
                  onChange={handleChange}
                  className="w-4 h-4"
                  required
                />
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Community Fit */}
      <div className="space-y-6 pt-6 border-t border-foreground/10">
        <h3 className="text-xl font-semibold text-foreground">Community Fit</h3>
        <div className="space-y-2">
          <Label htmlFor="joinReason" className="text-muted-foreground">
            Why do you want to join this community? <span className="text-red-500">*</span>
          </Label>
          <p className="text-xs text-muted-foreground mb-2">
            💭 What are you missing right now that you think a founder community could help with?
          </p>
          <Textarea
            id="joinReason"
            name="joinReason"
            value={formData.joinReason}
            onChange={handleChange}
            required
            placeholder="Share your thoughts about what you're looking for in a community..."
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="challenge" className="text-muted-foreground">
            What's the biggest challenge you're facing as a founder right now? <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="challenge"
            name="challenge"
            value={formData.challenge}
            onChange={handleChange}
            required
            placeholder="Be specific and honest..."
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contribute" className="text-muted-foreground">
            What do you think you can contribute to other founders in the community?{" "}
            <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="contribute"
            name="contribute"
            value={formData.contribute}
            onChange={handleChange}
            required
            placeholder="Skills, experiences, connections, or wisdom you can share..."
            className="min-h-[100px]"
          />
        </div>
      </div>

      {/* Paid Community Information */}
      <div className="space-y-6 pt-6 border-t border-foreground/10 neu-flat rounded-3xl p-8">
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-foreground">💳 Paid Community</h3>
          <p className="text-muted-foreground text-base leading-relaxed">
            This is a <span className="font-semibold text-foreground">paid, invite-only community</span>. We charge to keep the
            community high-quality and to fund community tools, facilitation, and member-only events. By applying, you
            acknowledge that membership requires a monthly fee.
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="monthlyBudget" className="text-muted-foreground">
              How much would you be willing to pay per month to be part of this community?{" "}
              <span className="text-red-500">*</span>
            </Label>
            <select
              id="monthlyBudget"
              name="monthlyBudget"
              value={formData.monthlyBudget}
              onChange={handleChange}
              required
              className="w-full neu-pressed rounded-2xl text-foreground placeholder:text-muted-foreground/60 focus:ring-1 focus:ring-accent-cyan outline-none px-4 py-3"
            >
              <option value="">Select your budget</option>
              <option value="499">₹499</option>
              <option value="999">₹999</option>
              <option value="1999">₹1,999</option>
              <option value="2999">₹2,999</option>
              <option value="4999">₹4,999+</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paidCommunity" className="text-muted-foreground">
              If accepted, are you comfortable paying for this community to stay exclusive and high-signal?{" "}
              <span className="text-red-500">*</span>
            </Label>
            <div className="space-y-3">
              {[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="paidCommunity"
                    value={option.value}
                    checked={formData.paidCommunity === option.value}
                    onChange={handleChange}
                    className="w-4 h-4"
                    required
                  />
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="space-y-6 pt-6 border-t border-foreground/10">
        <h3 className="text-xl font-semibold text-foreground">Additional Information</h3>
        <div className="space-y-2">
          <Label htmlFor="heardFrom" className="text-muted-foreground">
            How did you hear about this community? <span className="text-red-500">*</span>
          </Label>
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
            <option value="friend-referral">Friend / Referral</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="otherInfo" className="text-muted-foreground">
            Anything else you think we should know about you?
          </Label>
          <Textarea
            id="otherInfo"
            name="otherInfo"
            value={formData.otherInfo}
            onChange={handleChange}
            placeholder="Optional: Share anything else that would help us understand you better..."
            className="min-h-[80px]"
          />
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full neu-flat neu-interactive rounded-2xl h-14 text-lg font-semibold mt-8 text-foreground"
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
