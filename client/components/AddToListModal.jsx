import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { X } from 'lucide-react'
import PropTypes from 'prop-types'
import { useAuth } from '../contexts/AuthContext'
import { getUserLists, addMovieToList } from '../utils/api'

export default function AddToListModal({
  isOpen,
  onClose,
  mediaId,
  mediaType = 'movie',
  onAdded = () => {},
}) {
  const { isAuthenticated, user, sessionId, login } = useAuth()
  const [lists,   setLists]   = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [adding,  setAdding]  = useState(null)

  useEffect(() => {
    if (!isOpen) return
    if (!isAuthenticated) return

    setLoading(true)
    getUserLists(user.id, sessionId)
      .then(res => setLists(res.data.results || []))
      .catch(() => setError('Could not load your lists'))
      .finally(() => setLoading(false))
  }, [isOpen, isAuthenticated, user, sessionId])

  const handleAdd = async listId => {
    if (!isAuthenticated) return login()

    setAdding(listId)
    try {
      await addMovieToList(listId, sessionId, mediaId)
      onAdded(listId)
      onClose()
    } catch {
      setError('Failed to add to list')
    } finally {
      setAdding(null)
    }
  }

  if (!isOpen) return null

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="relative bg-[#0d1117] text-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden font-poppins">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold">Add to your list</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="px-6 py-4 space-y-4">
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {loading ? (
            <p className="text-center text-gray-400">Loading lists…</p>
          ) : lists.length ? (
            <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {lists.map(l => (
                <li key={l.id}>
                  <button
                    onClick={() => handleAdd(l.id)}
                    disabled={adding === l.id}
                    className={`w-full flex justify-between items-center px-4 py-2 rounded-lg 
                      transition ${
                        adding === l.id
                          ? 'bg-gray-800 cursor-wait'
                          : 'bg-gray-900 hover:bg-gray-800'
                      }`}
                  >
                    <span className="truncate">{l.name}</span>
                    <span className="text-gray-500 text-sm">({l.item_count||0})</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500">
              {isAuthenticated
                ? 'You have no custom lists yet.'
                : 'Sign in to manage your lists.'}
            </p>
          )}
        </div>

        {/* FOOTER */}
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
