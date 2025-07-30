// src/components/AddToListModal.jsx
import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { X, Check } from 'lucide-react'
import PropTypes from 'prop-types'
import { useAuth } from '../contexts/AuthContext'
import {
  getUserLists,
  addMovieToList,
  removeMovieFromList,
  getListDetails,
} from '../utils/api'

/**
 * Shows all *custom* lists that belong to the signed‑in user.
 * ‑ If the current movie is already inside a list it is highlighted (✔ icon, green row)
 * ‑ Clicking the row **adds or removes** the item accordingly.
 */
export default function AddToListModal({
  isOpen,
  onClose,
  mediaId,
  mediaType = 'movie',          // only “movie” supported by TMDB for lists
  onAdded = () => {},           // (listId, nowInList:boolean) → void
}) {
  const { isAuthenticated, user, sessionId, login } = useAuth()

  const [lists,       setLists]       = useState([])          // all user lists
  const [membership,  setMembership]  = useState({})         // { listId: true | false }
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState(null)
  const [processing,  setProcessing]  = useState(null)       // list currently updating

  /* ───────────────────────────────── FETCH LISTS + MEMBERSHIP ───────────────────────────────── */
  useEffect(() => {
    if (!isOpen || !isAuthenticated) return

    (async () => {
      try {
        setLoading(true); setError(null)

        // fetch all lists that belong to the user
        const res   = await getUserLists(user.id, sessionId)
        const lists = res.data.results || []
        setLists(lists)

        //for every list ask once whether the movie is already inside
        const pairs = await Promise.all(
          lists.map(async l => {
            try {
              const detail = await getListDetails(l.id, sessionId)
              const present = (detail.data.items || []).some(item => item.id === mediaId)
              return [l.id, present]
            } catch {
              return [l.id, false]     // fallback: assume not present
            }
          })
        )
        setMembership(Object.fromEntries(pairs))
      } catch {
        setError('Could not load your lists')
      } finally {
        setLoading(false)
      }
    })()
  }, [isOpen, isAuthenticated, user, sessionId, mediaId])

  /* ───────────────────────────────── ADD / REMOVE HANDLER ───────────────────────────────── */
  const toggleItem = async listId => {
    if (!isAuthenticated) return login()

    const isInList = membership[listId]
    setProcessing(listId)
    setError(null)

    try {
      if (isInList) {
        await removeMovieFromList(listId, sessionId, mediaId)
      } else {
        await addMovieToList(listId, sessionId, mediaId)
      }

      // optimistic UI update
      setMembership(prev => ({ ...prev, [listId]: !isInList }))
      onAdded(listId, !isInList)
    } catch {
      setError('Failed to update the list')
    } finally {
      setProcessing(null)
    }
  }

  /* ─────────────────────────────────── RENDER ─────────────────────────────────── */
  if (!isOpen) return null

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* modal */}
      <div className="relative bg-[#0d1117] text-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden font-poppins">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold">Add&nbsp;/&nbsp;remove from your lists</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* body */}
        <div className="px-6 py-4 space-y-4">
          {error && <p className="text-sm text-red-500">{error}</p>}

          {loading ? (
            <p className="text-center text-gray-400">Loading lists…</p>
          ) : lists.length ? (
            <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {lists.map(l => {
                const inList   = membership[l.id]
                const disabled = processing === l.id

                return (
                  <li key={l.id}>
                    <button
                      onClick={() => toggleItem(l.id)}
                      disabled={disabled}
                      className={`
                        w-full flex justify-between items-center px-4 py-2 rounded-lg transition
                        ${disabled
                          ? 'bg-gray-800 cursor-wait'
                          : inList
                              ? 'bg-green-900 hover:bg-green-800'
                              : 'bg-gray-900 hover:bg-gray-800'}
                      `}
                    >
                      <span className="truncate flex items-center gap-2">
                        {inList && (
                          <Check className="w-4 h-4 flex-shrink-0 text-green-400" />
                        )}
                        {l.name}
                      </span>
                      <span className="text-gray-500 text-sm">
                        ({l.item_count ?? 0})
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="text-center text-gray-500">
              {isAuthenticated
                ? 'You have no custom lists yet.'
                : 'Sign in to manage your lists.'}
            </p>
          )}
        </div>

        {/* footer */}
        {!isAuthenticated && (
          <div className="px-6 pb-6">
            <button
              onClick={login}
              className="w-full py-2 bg-red-600 rounded-lg text-center font-medium hover:bg-red-700 transition"
            >
              Sign in with TMDB
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

AddToListModal.propTypes = {
  isOpen:    PropTypes.bool.isRequired,
  onClose:   PropTypes.func.isRequired,
  mediaId:   PropTypes.number.isRequired,
  mediaType: PropTypes.oneOf(['movie','tv']),
  onAdded:   PropTypes.func,
}
