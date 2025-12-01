'use client'

import { getRandomFloat } from '@/utils/random'
import gsap from 'gsap'
import { useEffect, useRef, useState } from 'react'

const COLORS = [
  '#FF0000',
  '#00FF00',
  '#0000FF',
  '#FFFF00',
  '#FF00FF',
  '#00FFFF',
  '#FFA500',
  '#800080',
  '#00FF7F',
  '#FF1493',
  '#1E90FF',
  '#8A2BE2',
  '#FFD700',
  '#7FFF00',
  '#DC143C',
  '#40E0D0',
  '#ADFF2F',
  '#FF6347',
  '#BA55D3',
  '#87CEFA',
]

function generateRandomWirePath(width: number, segments = 20, minY = 0, maxY = 20) {
  const step = width / segments
  let d = `M0 0`

  for (let i = 1; i <= segments; i++) {
    const x = i * step
    const prevY = Number(d.split(' ')[d.split(' ').length - 1]) // предыдущая Y
    const y = getRandomFloat(minY, maxY)

    // Создаем плавный кривой сегмент
    const cx1 = x - step / 2
    const cy1 = prevY
    const cx2 = x - step / 2
    const cy2 = y

    d += ` C${cx1} ${cy1}, ${cx2} ${cy2}, ${x} ${y}`
  }

  return d
}
export default function ChristmasLights() {
  const [lightsData, setLightsData] = useState<{ x: number; angle: number; color: string }[]>([])
  const [windowWidth, setWindowWidth] = useState<number>(1200)
  const [wirePath, setWirePath] = useState<string>()
  const svgRef = useRef<SVGSVGElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const w = window.innerWidth
    const count = Math.round(w / 50)

    const newLights = Array.from({ length: count }, (_, i) => ({
      x: 20 + i * (w / (count - 1)),
      angle: getRandomFloat(-12, 12),
      color: COLORS[i % COLORS.length],
    }))

    const newWirePath = generateRandomWirePath(w, 30, 0, 10)

    setWirePath(newWirePath)
    setLightsData(newLights)
    setWindowWidth(w)
  }, [])

  useEffect(() => {
    const svgEl = svgRef.current

    if (!svgEl || !lightsData.length) return

    const lights = svgEl.querySelectorAll<SVGElement>('.christmas-light')

    lights.forEach((light) => {
      const flicker = () => {
        const newOpacity = Math.random() < 0.8 ? getRandomFloat(0.5, 1) : getRandomFloat(0.1, 0.4)
        const duration = getRandomFloat(0, 5)
        const delay = getRandomFloat(0, 1)

        gsap.to(light, {
          opacity: newOpacity,
          duration,
          delay,
          onComplete: flicker,
        })
      }
      const colorSwap = () => {
        gsap.to(light, {
          fill: () => COLORS[Math.floor(Math.random() * COLORS.length)],
          duration: () => getRandomFloat(5, 10),
          onComplete: colorSwap,
        })
      }
      colorSwap()
      flicker()
    })

    // gsap.to(lights, {
    //   opacity: () => getRandomFloat(0.55, 1),
    //   duration: () => getRandomFloat(0.5, 1),
    //   repeat: -1,
    //   yoyo: true,
    //   stagger: 0.1,
    // })

    // gsap.to(lights, {
    //   fill: () => COLORS[Math.floor(Math.random() * COLORS.length)],
    //   duration: () => getRandomFloat(1, 2),
    //   repeat: -1,
    //   yoyo: true,
    //   stagger: 0.1,
    // })

    gsap.set(svgEl, { filter: "url('#softGlow')" })

    return () => {
      gsap.killTweensOf(lights)
      gsap.set(svgEl, { filter: 'none' })
    }
  }, [lightsData])

  return (
    <div
      className="pointer-events-none fixed -top-1 z-50 w-full overflow-visible"
      ref={containerRef}
      suppressHydrationWarning
    >
      <svg
        ref={svgRef}
        height={50}
        width={windowWidth}
        xmlns="http://www.w3.org/2000/svg"
        suppressHydrationWarning
      >
        <defs>
          <filter id="softGlow" height="550%" width="550%" x="-100%" y="-100%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {lightsData.map((p, i) => (
          <g key={i} transform={`translate(${p.x},0) rotate(${p.angle})`} suppressHydrationWarning>
            <ellipse className="christmas-light" cx="2" cy="20" rx="5" ry="9" fill={p.color} />
            <rect fill="#496E4C" x="-3" width="10" height="14" rx="3" />
          </g>
        ))}

        <path d={wirePath} stroke="#496E4C" strokeWidth="2" fill="none" suppressHydrationWarning />
      </svg>
    </div>
  )
}
