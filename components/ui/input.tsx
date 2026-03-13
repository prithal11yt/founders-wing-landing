import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'neu-pressed h-12 w-full min-w-0 rounded-2xl px-4 py-2 text-base text-foreground placeholder:text-muted-foreground outline-none transition-all disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:ring-1 focus-visible:ring-accent-cyan/50',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
