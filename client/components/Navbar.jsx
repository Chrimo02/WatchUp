// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getMovies } from '../utils/api'
import SignIn from '../assets/SignIn.svg'
import Shuffle from '../assets/Shuffle.svg'
import WatchlistIcon from '../assets/Watchlist.svg'
import LanguageSelector from './LanguageSelector'

export default function Navbar() {
  const { isAuthenticated, user, login, logout } = useAuth()

  const [searchValue, setSearchValue] = useState('')
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success',
  })

  const prevAuth = useRef(isAuthenticated)
  const menuRef  = useRef(null)       // ★ keeps track of the profile dropdown
  const navigate = useNavigate()

  /* ─────────────────────────── toast helper ─────────────────────────── */
  const showNotification = (msg, type = 'success') => {
    setNotification({ show: true, message: msg, type })
    setTimeout(
      () => setNotification({ show: false, message: '', type }),
      1500
    )
  }

  /* ───────────────────────── welcome toast ──────────────────────────── */
  useEffect(() => {
    if (!prevAuth.current && isAuthenticated) {
      showNotification(`Welcome, ${user.username}!`, 'success')
    }
    prevAuth.current = isAuthenticated
  }, [isAuthenticated, user])

  /* ─────────────── close profile dropdown on outside click ───────────── */
  useEffect(() => {
    const onClickOutside = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  /* ───────────────────────────── search ─────────────────────────────── */
  const executeSearch = () => {
    const q = searchValue.trim()
    if (q) {
      navigate(`/search?q=${encodeURIComponent(q)}`)
      setSearchValue('')
    }
  }
  const onKeyDown = e => e.key === 'Enter' && executeSearch()

  /* ──────────────── watchlist button behaviour ──────────────────────── */
  const handleWatchlistClick = () => {
    if (isAuthenticated) {
      navigate('/lists/watchlist')
    } else {
      showNotification(
        'Please sign in with your TMDB account to view your watchlist.',
        'error'
      )
    }
  }

  /* ───────────────────────────── logout ─────────────────────────────── */
  const handleLogout = () => {
    logout()
    showNotification('You have successfully signed out.', 'success')
  }

  /* ───────────────────────────── shuffle ────────────────────────────── */
  const handleShuffle = async () => {
    try {
      const { data: first } = await getMovies.popular(1)
      const totalPages      = Math.min(first.total_pages || 1, 500) // TMDB caps at 500 pages
      const randomPage      = Math.floor(Math.random() * totalPages) + 1
      const { data }        = await getMovies.popular(randomPage)
      const list            = data.results || []
      if (!list.length) {
        showNotification('No popular movies available to shuffle.', 'error')
        return
      }
      const pick = list[Math.floor(Math.random() * list.length)]
      navigate(`/movie/${pick.id}`)
    } catch (err) {
      console.error('Shuffle failed:', err)
      showNotification('Failed to pick a random movie. Please try again.', 'error')
    }
  }

  /* ───────────────────────────── render ─────────────────────────────── */
  return (
    <>
      {/* added z‑50 so navbar stays above page content */}
      <nav className="relative z-50 grid h-24 grid-cols-3 items-center bg-red-700 px-4">
        {/* ───── Logo & Navigation ───── */}
        <div className="flex items-center gap-1 lg:gap-2">
          <Link to="/">
            <h1
              className="font-limelight text-[20px] leading-6 tracking-[0.02em] text-white sm:text-[24px] lg:text-[32px] cursor-pointer"
              style={{
                textShadow:
                  '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
              }}
            >
              WatchUp
            </h1>
          </Link>
          <ul className="hidden lg:flex gap-4 ml-6">
            <li>
              <Link to="/discover" className="text-[16px] font-bold text-white hover:opacity-80">
                Movies
              </Link>
            </li>
            <li>
              <Link to="/discover?media=tv" className="text-[16px] font-bold text-white hover:opacity-80">
                TV Shows
              </Link>
            </li>
            <li>
              <Link to="/people" className="text-[16px] font-bold text-white hover:opacity-80">
                People
              </Link>
            </li>
          </ul>
        </div>

        {/* ───── Search ───── */}
        <div className="flex justify-center">
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
              className="w-full bg-transparent text-[12px] leading-4 text-white/75 placeholder:text-white/75 focus:outline-none lg:text-[14px]"
            />
          </label>
        </div>

        {/* ───── Icons / Profile ───── */}
        <div className="flex items-center justify-end gap-2 lg:gap-4">
          <LanguageSelector />

          {/* Shuffle */}
          <button
            onClick={handleShuffle}
            title="Surprise me"
            className="transition-opacity hover:opacity-80 lg:mr-2"
          >
            <img src={Shuffle} alt="Shuffle" className="h-5 w-5" />
          </button>

          {/* Watchlist */}
          <button
            onClick={handleWatchlistClick}
            className="flex items-center gap-1 lg:gap-1"
          >
            <img src={WatchlistIcon} alt="Watchlist" className="h-4 w-3 lg:h-5 lg:w-4" />
            <span className="hidden whitespace-nowrap text-[16px] font-bold text-white lg:inline">
              Watchlist
            </span>
          </button>

          {/* Profile button & dropdown */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => (isAuthenticated ? setMenuOpen(o => !o) : login())}
              className="flex items-center gap-1 transition-opacity hover:opacity-80 lg:gap-1"
            >
              {isAuthenticated ? (
                <User className="h-4 w-4 text-white lg:h-5 lg:w-5" />
              ) : (
                <img src={SignIn} alt="Sign in" className="h-4 w-4 lg:h-5 lg:w-5" />
              )}
              <span className="hidden whitespace-nowrap text-[16px] font-bold text-white lg:inline">
                {isAuthenticated ? user.username : 'Sign in with TMDB'}
              </span>
            </button>

            {isAuthenticated && menuOpen && (
              /* z‑[60] keeps dropdown over page content */
              <div
                className="absolute right-0 mt-2 w-40 bg-black rounded-2xl p-2 shadow-lg z-[60]"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <ul className="mt-1">
                  <li>
                    <Link
                      to="/lists"
                      onClick={() => setMenuOpen(false)}
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

      {/* ───── toast ───── */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-[70] px-4 py-2 rounded-lg shadow-lg transition-opacity ${
            notification.type === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-green-600 text-white'
          }`}
        >
          {notification.message}
        </div>
      )}
    </>
  )
}
