"use client"

import { useLocation } from "react-router-dom"
import { useEffect } from "react"
import JokerImage from "../assets/joker-404.png"
import Text404Image from "../assets/text-404.png"

const NotFound = () => {
  const location = useLocation()

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname)
  }, [location.pathname])

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: "#141414" }}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70"></div>

      {/* Main content container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 h-screen flex items-center justify-center">
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="absolute inset-0 hidden lg:flex items-center justify-center -ml-44">
            <img
              src={JokerImage || "/placeholder.svg"}
              alt="Joker 404"
              className="w-[800px] h-[600px] object-cover object-center opacity-90"
              style={{
                filter: "contrast(1.1) brightness(0.8)",
                objectPosition: "center center",
              }}
            />
          </div>

          {/* 404 text image overlay */}
          <div className="relative z-20 flex items-center justify-center lg:ml-48">
            <img
              src={Text404Image || "/placeholder.svg"}
              alt="404 Text"
              className="w-[350px] h-[260px] sm:w-[450px] sm:h-[340px] lg:w-[700px] lg:h-[500px] object-contain"
              style={{
                filter: "drop-shadow(2px 2px 8px rgba(0,0,0,0.8))",
              }}
            />
          </div>

          {/* Back to home button */}
          <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 text-center z-30">
            <button
              onClick={() => (window.location.href = "/")}
              className="px-8 py-3 bg-red-700 hover:bg-red-800 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Additional atmospheric effects */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-red-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-red-700/10 rounded-full blur-2xl"></div>
      </div>
    </div>
  )
}

export default NotFound
