import Link from 'next/link'
import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  href?: string
  className?: string
}

// Logo is 3755x933 (ratio 4.02:1) — sized by height, width auto
const heights: Record<string, number> = {
  sm: 36,   // sidebars, mobile headers
  md: 44,   // navbar, standard
  lg: 56,   // auth pages, footer
}

export default function Logo({ size = 'md', href = '/', className = '' }: LogoProps) {
  const h = heights[size]
  const w = Math.round(h * (3755 / 933))

  const inner = (
    <span className={`inline-flex items-center ${className}`} style={{ textDecoration: 'none' }}>
      <Image
        src="/logo.png"
        alt="TruLearnix"
        width={w}
        height={h}
        style={{ height: h, width: 'auto', display: 'block' }}
        className="object-contain"
        priority
      />
    </span>
  )

  if (!href) return inner
  return <Link href={href} style={{ textDecoration: 'none' }}>{inner}</Link>
}
