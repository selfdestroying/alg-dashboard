'use client'

import { Button } from '@/components/ui/button'
import gsap from 'gsap'
import { Power, PowerOff } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useCallback, useEffect, useRef, useState } from 'react'

export default function LightSwitch() {
  const [on, setOn] = useState(true)
  const onRef = useRef(true)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const { theme } = useTheme()

  const lightColorsLight = [
    '#FF2B2B',
    '#4DFF3C',
    '#FFA928',
    '#3D3DFF',
    '#FF2B2B',
    '#4DFF3C',
    '#FFA928',
    '#FF2B2B',
    '#4DFF3C',
    '#FFA928',
    '#3D3DFF',
  ]

  const lightColorsDark = [
    '#FF4D4D',
    '#66FF57',
    '#FFBE4D',
    '#6D6DFF',
    '#FF4D4D',
    '#66FF57',
    '#FFBE4D',
    '#FF4D4D',
    '#66FF57',
    '#FFBE4D',
    '#6D6DFF',
  ]

  const baseColors = theme === 'dark' ? lightColorsDark : lightColorsLight

  /** Первичная установка цвета */
  const applyLightColors = useCallback(() => {
    if (!svgRef.current) return
    const lights = svgRef.current.querySelectorAll('.christmas-light')
    lights.forEach((light, i) => {
      gsap.set(light, { fill: baseColors[i % baseColors.length] })
    })
  }, [baseColors])

  /** Очистка GSAP при размонтировании */
  useEffect(() => {
    return () => {
      gsap.killTweensOf('.christmas-light')
    }
  }, [])

  /** Мерцание */
  const flicker = useCallback((el: Element, index: number) => {
    if (!onRef.current) return

    gsap.to(el, {
      opacity: R(0.7, 1),
      duration: R(0.2, 0.5),
      delay: index * 0.05,
      ease: 'sine.inOut',
      onComplete: () => flicker(el, index),
    })
  }, [])

  /** Смена цвета (основная магия ✨) */
  const cycleColor = useCallback(
    (el: Element) => {
      if (!onRef.current) return

      const newColor = baseColors[Math.floor(Math.random() * baseColors.length)]

      gsap.to(el, {
        fill: newColor,
        duration: R(30, 60),
        ease: 'sine.inOut',
        onComplete: () => cycleColor(el),
      })
    },
    [baseColors]
  )

  /** Включение/выключение */
  const toggleLights = useCallback(() => {
    if (!svgRef.current) return
    const lights = svgRef.current.querySelectorAll('.christmas-light')

    if (onRef.current) {
      gsap.to(lights, {
        opacity: 1,
        filter: "url('#glow')",
        duration: 0.5,
        stagger: 0.04,
      })

      lights.forEach((light, i) => {
        flicker(light, i)
        cycleColor(light)
      })
    } else {
      gsap.killTweensOf(lights)
      gsap.to(lights, {
        opacity: 0.5,
        filter: '',
        duration: 0.2,
      })
    }
  }, [cycleColor, flicker])

  useEffect(() => {
    applyLightColors()
    toggleLights()
  }, [applyLightColors, toggleLights])

  const handleSwitchClick = () => {
    onRef.current = !onRef.current
    setOn(onRef.current)
    toggleLights()
  }

  /** Позиции огоньков (как и раньше) */
  const LIGHTS = [
    { transform: 'translate(129,117) rotate(9) translate(-129,-117) translate(119,89)' },
    { transform: 'translate(229,117) rotate(-9) translate(-229,-117) translate(219,89)' },
    { transform: 'translate(329,117) rotate(5) translate(-329,-117) translate(319,89)' },
    { transform: 'translate(429,117) rotate(-2) translate(-429,-117) translate(419,89)' },
    { transform: 'translate(529,117) rotate(-9) translate(-529,-117) translate(519,89)' },
    { transform: 'translate(629,117) rotate(18) translate(-629,-117) translate(619,89)' },
    { transform: 'translate(729,117) rotate(3) translate(-729,-117) translate(719,89)' },
    { transform: 'translate(829,117) rotate(-13) translate(-829,-117) translate(819,89)' },
    { transform: 'translate(929,117) rotate(7) translate(-929,-117) translate(919,89)' },
    { transform: 'translate(1029,117) rotate(-5) translate(-1029,-117) translate(1019,89)' },
    { transform: 'translate(1129,117) rotate(11) translate(-1129,-117) translate(1119,89)' },
    { transform: 'translate(1229,117) rotate(-8) translate(-1229,-117) translate(1219,89)' },
    { transform: 'translate(1329,117) rotate(4) translate(-1329,-117) translate(1319,89)' },
  ]

  return (
    <div className="flex items-center justify-center overflow-hidden">
      <Button variant="outline" size="icon-sm" className="size-7" onClick={handleSwitchClick}>
        {on ? <PowerOff /> : <Power />}
      </Button>

      <div>
        <svg ref={svgRef} height="75px" viewBox="90 88 1300 82" xmlns="http://www.w3.org/2000/svg">
          <filter id="glow" height="200%" filterUnits="userSpaceOnUse">
            <feGaussianBlur stdDeviation="12.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {LIGHTS.map((t, i) => (
            <g key={i} transform={t.transform}>
              <ellipse
                className="christmas-light"
                fill="gray"
                cx="10"
                cy="37.5"
                rx="10"
                ry="18.5"
              />
              <rect fill="#496E4C" x="2" y="0" width="16" height="22" rx="4" />
            </g>
          ))}

          <path
            d="M137,94 C137,94 213.5,102 227,95.5 C240.5,89 319,89.0008917 330.5,91.5 
            C342,93.9991083 423.5,99.5 431,92.5 C438.5,85.5 511,99.5 529,91 C547,82.5 
            635.5,96.5 635.5,96.5 C635.5,96.5 720,104 735,97.5 C750,91 826,96.5 
            826,96.5 C826,96.5 900,102 925,95.5 C950,89 1000,89 1020,91.5 
            C1040,94 1120,99.5 1130,92.5 C1140,85.5 1215,99.5 1235,91 
            C1255,82.5 1330,96.5 1330,96.5"
            stroke="#496E4C"
            strokeWidth="1"
            fill="none"
          />
        </svg>
      </div>
    </div>
  )
}

function R(min: number, max: number): number {
  return min + Math.random() * (max - min)
}
