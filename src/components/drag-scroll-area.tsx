'use client'
import { ReactNode, useRef, useState } from 'react'

export default function DragScrollArea({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDown, setIsDown] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    setIsDown(true)
    setStartX(e.pageX - containerRef.current.offsetLeft)
    setScrollLeft(containerRef.current.scrollLeft)
  }

  const handleMouseLeave = () => setIsDown(false)
  const handleMouseUp = () => setIsDown(false)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !containerRef.current) return
    e.preventDefault()
    const x = e.pageX - containerRef.current.offsetLeft
    const walk = (x - startX) * 1 // множитель скорости (1 = 1:1)
    containerRef.current.scrollLeft = scrollLeft - walk
  }

  return (
    <div
      ref={containerRef}
      className="scrollbar-hide flex cursor-grab space-x-4 overflow-x-scroll p-2 select-none"
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
    >
      {children}
    </div>
  )
}
