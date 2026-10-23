'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface TruncatedTextProps extends Omit<React.ComponentProps<'span'>, 'children'> {
  text: string
}

/**
 * Muestra el texto en un máximo de 2 líneas. Solo cuando el texto realmente
 * queda cortado, un tooltip muestra el contenido completo.
 */
function TruncatedText({ text, className, ...props }: TruncatedTextProps) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const [isTruncated, setIsTruncated] = React.useState(false)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const element = ref.current
    if (!element) return

    const measure = () => {
      setIsTruncated(
        element.scrollHeight > element.clientHeight ||
          element.scrollWidth > element.clientWidth,
      )
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [text])

  return (
    <Tooltip open={open && isTruncated} onOpenChange={setOpen}>
      <TooltipTrigger asChild>
        <span
          ref={ref}
          data-slot="truncated-text"
          className={cn(className, 'line-clamp-2 break-words')}
          {...props}
        >
          {text}
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs break-words">{text}</TooltipContent>
    </Tooltip>
  )
}

export { TruncatedText }
