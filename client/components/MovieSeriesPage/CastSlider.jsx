// CastSlider.jsx
import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom' 

export default function CastSlider({ cast = [] }) {
  const [captionHeight, setCaptionHeight] = useState(0)
  const [fadeLeft, setFadeLeft] = useState(0)
  const [fadeRight, setFadeRight] = useState(1)
  const sliderRef = useRef(null)

  // Measure caption heights to align cards
  useEffect(() => {
    const measure = () => {
      if (!sliderRef.current) return
      const captions = sliderRef.current.querySelectorAll('.caption')
      let maxH = 0
      captions.forEach(el => {
        maxH = Math.max(maxH, el.scrollHeight)
      })
      setCaptionHeight(maxH)
    }

    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [cast])

  // Update fade overlay opacities on scroll
  const updateFade = () => {
    const c = sliderRef.current
    if (!c) return
    const { scrollLeft, scrollWidth, clientWidth } = c
    const maxScroll = scrollWidth - clientWidth

    // Decide a fade threshold (half a card width)
    const firstCard = c.children[0]
    const cardWidth = firstCard?.offsetWidth ?? clientWidth
    const threshold = cardWidth / 2

    // Compute opacities
    const right = Math.max(0, Math.min(1, (threshold - scrollLeft) / threshold))
    const left  = Math.max(0, Math.min(1, (scrollLeft - threshold) / threshold))

    setFadeRight(right)
    setFadeLeft(left)
  }

  // Attach scroll listener
  useEffect(() => {
    const c = sliderRef.current
    if (!c) return
    c.addEventListener('scroll', updateFade)
    updateFade()
    return () => c.removeEventListener('scroll', updateFade)
  }, [cast])

  return (
    <div className="relative">
      {/* Slider */}
      <div
        ref={sliderRef}
        className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
      >
        {cast.map((c, i) => (
           <Link                      
            key={c.id}
            to={`/person/${c.id}`}
            className="flex-none"
            style={{ width: '9rem' }}
          >
            <div
              key={i}
              className="flex-none bg-[#181818] rounded-lg overflow-hidden shadow-md border border-[#3d3d3d]"
              style={{ width: '9rem' }}
            >
              <img
                src={c.img}
                alt={c.name}
                className="w-full h-[14rem] object-cover"
              />
              <div
                className="caption bg-[#2A2A2A] text-white px-3 py-2 text-left"
                style={{
                  height: captionHeight ? `${captionHeight}px` : 'auto',
                }}
              >
                <div className="font-bold text-[14px] leading-[20px]">
                  {c.name}
                </div>
                <div className="text-sm text-gray-300 mt-1">
                  {c.role}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Left Fade Overlay */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-full w-16 transition-opacity duration-300"
        style={{
          background: 'linear-gradient(to right, #181818, transparent)',
          opacity: fadeLeft
        }}
      />

      {/* Right Fade Overlay */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-full w-16 transition-opacity duration-300"
        style={{
          background: 'linear-gradient(to left, #181818, transparent)',
          opacity: fadeRight
        }}
      />
    </div>
  )
}
