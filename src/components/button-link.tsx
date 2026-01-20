import { VariantProps } from 'class-variance-authority'
import Link from 'next/link'
import { Button, buttonVariants } from './ui/button'

interface ButtonLinkProps extends VariantProps<typeof buttonVariants> {
  href: string
  children: React.ReactNode
}

export default function ButtonLink({ href, children, ...props }: ButtonLinkProps) {
  return (
    <Button {...props} render={<Link href={href} />} nativeButton={false} variant="link">
      {children}
    </Button>
  )
}
