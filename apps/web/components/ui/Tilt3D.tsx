'use client'
import { useRef, MouseEvent, ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
  intensity?: number   // 1-20, default 10
  glare?: boolean
}

export default function Tilt3D({ children, className = '', style = {}, intensity = 10, glare = true }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const glareRef = useRef<HTMLDivElement>(null)

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width  - 0.5   // -0.5 to 0.5
    const y = (e.clientY - rect.top)  / rect.height - 0.5
    const rotX = -y * intensity
    const rotY =  x * intensity
    el.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.03,1.03,1.03)`
    el.style.transition = 'transform 0.1s ease'
    if (glare && glareRef.current) {
      const angle = Math.atan2(y, x) * (180 / Math.PI)
      glareRef.current.style.opacity = '0.12'
      glareRef.current.style.transform = `rotate(${angle}deg)`
    }
  }

  const onLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)'
    el.style.transition = 'transform 0.5s cubic-bezier(.23,1,.32,1)'
    if (glare && glareRef.current) glareRef.current.style.opacity = '0'
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={{ transformStyle: 'preserve-3d', willChange: 'transform', ...style }}
    >
      {glare && (
        <div ref={glareRef} className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] overflow-hidden" style={{ opacity: 0 }}>
          <div style={{
            position: 'absolute', inset: '-50%',
            background: 'linear-gradient(0deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)',
            transformOrigin: 'center', width: '200%', height: '200%'
          }} />
        </div>
      )}
      {children}
    </div>
  )
}
