import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'neu-pressed flex field-sizing-content min-h-[80px] w-full rounded-2xl bg-transparent px-4 py-3 text-base outline-none transition-all placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-accent-cyan disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
