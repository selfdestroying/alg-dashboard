import { cva } from 'class-variance-authority'
import { CircleAlert, CircleCheck, CircleHelp, CircleX } from 'lucide-react'
import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

interface HintProps {
  text: string
  variant?: 'default' | 'destructive' | 'warning' | 'success'
}

const hintVariants = cva('text-sm px-3 py-1.5 rounded-md', {
  variants: {
    variant: {
      default: '',
      destructive:
        'text-destructive hover:text-destructive hover:bg-destructive/20 dark:hover:bg-destructive/20',
      warning: 'text-warning hover:text-warning hover:bg-warning/20 dark:hover:bg-warning/20',
      success: 'text-success hover:text-success hover:bg-success/20 dark:hover:bg-success/20',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})
const iconMap = {
  default: CircleHelp,
  destructive: CircleX,
  warning: CircleAlert,
  success: CircleCheck,
} as const

export default function Hint({ text, variant = 'default' }: HintProps) {
  const Icon = iconMap[variant]

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button size="icon-sm" variant="ghost" className={hintVariants({ variant })}>
            <Icon />
          </Button>
        }
      />
      <TooltipContent>
        <p>{text}</p>
      </TooltipContent>
    </Tooltip>
  )
}
