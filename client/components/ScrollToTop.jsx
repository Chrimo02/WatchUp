import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Scrollt jedes Mal nach ganz oben, sobald sich der Pfad ändert. */
export default function ScrollToTop () {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null            
}
