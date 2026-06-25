import { useEffect, useRef } from 'react'

export default function ScanBeam({ active }) {
  const beamRef = useRef(null)

  useEffect(() => {
    if (!active || !beamRef.current) return
    const el = beamRef.current
    el.style.animation = 'none'
    void el.offsetHeight
    el.style.animation = 'scanBeam 1.5s ease-in-out infinite'
  }, [active])

  if (!active) return null

  return (
    <>
      <style>{`
        @keyframes scanBeam {
          0%   { transform: translateY(0); }
          100% { transform: translateY(100%); }
        }
      `}</style>
      <div
        ref={beamRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '60px',
          background: 'linear-gradient(to bottom, transparent, rgba(37,99,235,0.35), transparent)',
          pointerEvents: 'none',
          animation: 'scanBeam 1.5s ease-in-out infinite',
          zIndex: 1,
        }}
      />
    </>
  )
}
