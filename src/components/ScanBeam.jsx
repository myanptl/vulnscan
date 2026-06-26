import { useEffect, useRef } from 'react'

export default function ScanBeam({ active }) {
  const beamRef = useRef(null)

  useEffect(() => {
    if (!active || !beamRef.current) return
    const el = beamRef.current
    el.style.animation = 'none'
    void el.offsetHeight
    el.style.animation = 'scanBeam 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite'
  }, [active])

  if (!active) return null

  return (
    <div
      ref={beamRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '80px',
        background: 'linear-gradient(to bottom, transparent, rgba(34,211,238,0.12) 40%, rgba(34,211,238,0.25) 50%, rgba(34,211,238,0.12) 60%, transparent)',
        borderBottom: '1px solid rgba(34,211,238,0.3)',
        pointerEvents: 'none',
        animation: 'scanBeam 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        zIndex: 1,
      }}
    />
  )
}
