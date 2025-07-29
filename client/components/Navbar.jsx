// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, User, Menu, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getMovies } from '../utils/api'
import SignIn from '../assets/SignIn.svg'
import Shuffle from '../assets/Shuffle.svg'
import WatchlistIcon from '../assets/Watchlist.svg'
import LanguageSelector from './LanguageSelector'

export default function Navbar() {
  const { isAuthenticated, user, login, logout } = useAuth()
  const [searchValue, setSearchValue] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success',
  })
  const prevAuth = useRef(isAuthenticated)
  const menuRef = useRef(null)
  const mobileNavRef = useRef(null)
  const navigate = useNavigate()

  const showNotification = (msg, type = 'success') => {
    setNotification({ show: true, message: msg, type })
    setTimeout(() => setNotification({ show: false, message: '', type }), 1500)
  }

  useEffect(() => {
    if (!prevAuth.current && isAuthenticated) {
      showNotification(`Welcome, ${user.username}!`, 'success')
    }
    prevAuth.current = isAuthenticated
  }, [isAuthenticated, user])

  useEffect(() => {
    const onClickOutside = e => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        mobileNavRef.current && !mobileNavRef.current.contains(e.target)
      ) {
        setMenuOpen(false)
        setMobileNavOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const executeSearch = () => {
    const q = searchValue.trim()
    if (q) {
      navigate(`/search?q=${encodeURIComponent(q)}`)
      setSearchValue('')
      setMobileNavOpen(false)
    }
  }
  const onKeyDown = e => e.key === 'Enter' && executeSearch()

  const handleWatchlistClick = () => {
    if (isAuthenticated) {
      navigate('/my-lists', {
        state: { initialView: 'watchlist' }
      })

      setMobileNavOpen(false)
    } else {
      showNotification(
        'Please sign in with your TMDB account to view your watchlist.',
        'error'
      )
    }
  }

  const handleLogout = () => {
    logout()
    showNotification('You have successfully signed out.', 'success')
    setMobileNavOpen(false)
  }

  const handleShuffle = async () => {
    try {
      const { data: first } = await getMovies.popular(1)
      const totalPages = Math.min(first.total_pages || 1, 500)
      const randomPage = Math.floor(Math.random() * totalPages) + 1
      const { data } = await getMovies.popular(randomPage)
      const list = data.results || []
      if (!list.length) {
        showNotification('No popular movies available to shuffle.', 'error')
        return
      }
      const pick = list[Math.floor(Math.random() * list.length)]
      navigate(`/movie/${pick.id}`)
      setMobileNavOpen(false)
    } catch (err) {
      console.error('Shuffle failed:', err)
      showNotification('Failed to pick a random movie. Please try again.', 'error')
    }
  }

  return (
    <>
      <nav className="relative z-50 flex h-24 items-center justify-between bg-red-700 px-4 lg:px-8">
        {/* Logo + Hamburger */}
        <div className="flex items-center gap-2">
          <Link to="/" onClick={() => setMobileNavOpen(false)}>
            <h1
              className="font-limelight text-[24px] text-white cursor-pointer lg:text-[32px]"
              style={{
                textShadow:
                  '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
              }}
            >
              WatchUp
            </h1>
          </Link>
          {/* Desktop links */}
          <ul className="hidden lg:flex gap-6 ml-6">
            <li>
              <Link
                to="/discover/movies"
                className="text-white font-bold hover:opacity-80"
              >
                Movies
              </Link>
            </li>
            <li>
              <Link
                to="/discover/series"
                className="text-white font-bold hover:opacity-80"
              >
                TV Shows
              </Link>
            </li>
            <li>
              <Link
                to="/people"
                className="text-white font-bold hover:opacity-80"
              >
                People
              </Link>
            </li>
          </ul>
          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 text-white"
            onClick={() => setMobileNavOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Search */}
        <div className="flex-1 flex justify-center px-4">
          <label className="flex w-full max-w-[460px] items-center gap-2 rounded border border-white/75 bg-black/10 px-3 py-2 lg:px-4 lg:py-3">
            <Search
              onClick={executeSearch}
              className="h-4 w-4 text-white lg:h-5 lg:w-5 cursor-pointer"
            />
            <input
              type="text"
              placeholder="Search Movies or TV Shows"
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              onKeyDown={onKeyDown}
              className="w-full bg-transparent text-white/75 placeholder:text-white/75 focus:outline-none lg:text-[14px] text-[12px]"
            />
          </label>
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-3">
          <LanguageSelector />

          <button
            title="Surprise me"
            onClick={handleShuffle}
            className="text-white hover:opacity-80"
          >
            <img src={Shuffle} alt="Shuffle" className="h-5 w-5" />
          </button>

          <button
            onClick={handleWatchlistClick}
            className="flex items-center gap-1 text-white hover:opacity-80"
          >
            <img
              src={WatchlistIcon}
              alt="Watchlist"
              className="h-5 w-5"
            />
            <span className="hidden lg:inline font-bold">Watchlist</span>
          </button>

          {/* Profile */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() =>
                isAuthenticated ? setMenuOpen(o => !o) : login()
              }
              className="flex items-center gap-1 text-white hover:opacity-80"
            >
              {isAuthenticated ? (
                <User className="w-5 h-5 lg:w-6 lg:h-6" />
              ) : (
                <img
                  src={SignIn}
                  alt="Sign in"
                  className="w-5 h-5 lg:w-6 lg:h-6"
                />
              )}
              <span className="hidden lg:inline font-bold">
                {isAuthenticated ? user.username : 'Sign in'}
              </span>
            </button>

            {isAuthenticated && menuOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded-2xl bg-black p-2 shadow-lg">
                <ul>
                  <li>
                    <Link
                      to="/my-lists"
                      onClick={() => {
                        setMenuOpen(false)
                        setMobileNavOpen(false)
                      }}
                      className="block px-3 py-2 text-white hover:bg-white/10 rounded-lg"
                    >
                      My Lists
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setMenuOpen(false)
                        handleLogout()
                      }}
                      className="w-full text-left px-3 py-2 text-white hover:bg-white/10 rounded-lg"
                    >
                      Log Out
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile nav dropdown */}
      {mobileNavOpen && (
        <div
          ref={mobileNavRef}
          className="lg:hidden bg-red-700 px-4 py-2 space-y-1"
        >
          <Link
            to="/discover/movies"
            onClick={() => setMobileNavOpen(false)}
            className="block text-white font-bold py-1 hover:opacity-80"
          >
            Movies
          </Link>
          <Link
            to="/discover/series"
            onClick={() => setMobileNavOpen(false)}
            className="block text-white font-bold py-1 hover:opacity-80"
          >
            TV Shows
          </Link>
          <Link
            to="/people"
            onClick={() => setMobileNavOpen(false)}
            className="block text-white font-bold py-1 hover:opacity-80"
          >
            People
          </Link>
        </div>
      )}

      {/* toast */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg ${
            notification.type === 'error' ? 'bg-red-600' : 'bg-green-600'
          } text-white transition-opacity`}
        >
          {notification.message}
        </div>
      )}
    </>
  )
}