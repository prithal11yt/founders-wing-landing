"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2, CheckCircle2 } from "lucide-react"

export function ApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className="text-center py-12 space-y-4 animate-in fade-in duration-500">
        <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-white">Application Received</h3>
        <p className="text-zinc-400 max-w-md mx-auto">
          Thank you for applying to Founders Wing. We'll review your application and get back to you shortly.
        </p>
        <Button
          onClick={() => setIsSubmitted(false)}
          variant="outline"
          className="mt-6 border-white/10 hover:bg-white hover:text-black"
        >
          Submit another application
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-zinc-400">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            required
            placeholder="Jane Doe"
            className="bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-600 focus:border-white/20 focus:ring-0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-zinc-400">
            Work Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            required
            placeholder="jane@company.com"
            className="bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-600 focus:border-white/20 focus:ring-0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="social" className="text-zinc-400">
          LinkedIn / Twitter / Website <span className="text-red-500">*</span>
        </Label>
        <Input
          id="social"
          required
          placeholder="https://linkedin.com/in/jane-doe"
          className="bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-600 focus:border-white/20 focus:ring-0"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="building" className="text-zinc-400">
          What are you building right now? <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="building"
          required
          placeholder="Tell us about your startup, your progress, and your current challenges..."
          className="bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-600 focus:border-white/20 focus:ring-0 min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="value" className="text-zinc-400">
          How can you add value to other founders? <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="value"
          required
          placeholder="Skills, experiences, or connections you can share with the community..."
          className="bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-600 focus:border-white/20 focus:ring-0 min-h-[100px]"
        />
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full bg-white text-black hover:bg-zinc-200 h-12 text-base font-medium rounded-full mt-2"
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
