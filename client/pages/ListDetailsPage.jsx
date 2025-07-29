"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Loader2, ArrowLeft, MoreHorizontal, Trash2, X } from "lucide-react"
import { getListDetails, deleteList, removeMovieFromList, getPosterUrl } from "../utils/api"
import MovieCard from "../components/MovieCard"
import { useMovies } from "../contexts/MovieContext"
import { toast } from "sonner"

const ListDetailsPage = () => {
  const { listId } = useParams()
  const navigate = useNavigate()
  const { user, sessionId, isAuthenticated } = useAuth()
  const { getAccountStates } = useMovies()

  const [listDetails, setListDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showMenu, setShowMenu] = useState(false)
  const [deletingList, setDeletingList] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState({})
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Bookmark states for watchlist functionality
  const [bookmarkStates, setBookmarkStates] = useState({})
  const [bookmarkLoading, setBookmarkLoading] = useState({})

  useEffect(() => {
    if (isAuthenticated && sessionId && listId) {
      fetchListDetails()
    } else if (!isAuthenticated) {
      navigate("/login")
    }
  }, [isAuthenticated, sessionId, listId])

  const fetchListDetails = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await getListDetails(listId, sessionId)
      setListDetails(response.data)

      // Initialize bookmark states for all items
      if (response.data.items) {
        await initializeBookmarkStates(response.data.items)
      }
    } catch (err) {
      console.error("Failed to fetch list details:", err)
      setError("Failed to load list details. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const initializeBookmarkStates = async (items) => {
    if (!sessionId || !items.length) return

    const states = {}
    const loadingStates = {}

    for (const item of items) {
      const key = `${item.media_type || "movie"}_${item.id}`
      loadingStates[key] = false

      try {
        const accountStates = await getAccountStates(item.id, item.media_type || "movie", sessionId)
        states[key] = accountStates.watchlist
      } catch (error) {
        console.error(`Failed to get account states for ${item.media_type || "movie"} ${item.id}:`, error)
        states[key] = false
      }
    }

    setBookmarkStates(states)
    setBookmarkLoading(loadingStates)
  }

  const handleRemoveFromList = async (movieId, mediaType = "movie") => {
    const key = `${mediaType}_${movieId}`
    setDeleteLoading((prev) => ({ ...prev, [key]: true }))

    try {
      await removeMovieFromList(listId, sessionId, movieId)

      // Update local state
      setListDetails((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.id !== movieId),
        item_count: prev.item_count - 1,
      }))

      // Remove from bookmark states
      setBookmarkStates((prev) => {
        const newStates = { ...prev }
        delete newStates[key]
        return newStates
      })

      setBookmarkLoading((prev) => {
        const newStates = { ...prev }
        delete newStates[key]
        return newStates
      })

      toast.success("Removed from list")
    } catch (err) {
      console.error("Failed to remove movie from list:", err)
      toast.error("Failed to remove from list")
    } finally {
      setDeleteLoading((prev) => ({ ...prev, [key]: false }))
    }
  }

  const handleBookmarkToggle = async (mediaId, mediaType) => {
    if (!user || !sessionId) return

    const key = `${mediaType}_${mediaId}`
    const currentState = bookmarkStates[key] || false

    setBookmarkLoading((prev) => ({ ...prev, [key]: true }))

    try {
      const { addToWatchlist } = await import("../utils/api")
      await addToWatchlist(user.id, sessionId, mediaId, mediaType, !currentState)
      setBookmarkStates((prev) => ({ ...prev, [key]: !currentState }))

      toast.success(currentState ? "Removed from watchlist" : "Added to watchlist")
    } catch (error) {
      console.error("Failed to toggle bookmark:", error)
      toast.error("Failed to update watchlist")
    } finally {
      setBookmarkLoading((prev) => ({ ...prev, [key]: false }))
    }
  }

  const handleDeleteList = async () => {
    setDeletingList(true)
    try {
      console.log("Attempting to delete list:", listId)
      await deleteList(listId, sessionId)
      toast.success("List deleted successfully")
      navigate("/my-lists")
    } catch (err) {
      console.error("Failed to delete list:", err)
      toast.error("Failed to delete list. Please try again.")
    } finally {
      setDeletingList(false)
      setShowDeleteConfirm(false)
    }
  }

  const confirmDeleteList = (e) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("Opening delete confirmation modal")
    setShowDeleteConfirm(true)
    setShowMenu(false)
  }

  const cancelDelete = () => {
    console.log("Canceling delete operation")
    setShowDeleteConfirm(false)
  }

  const toggleMenu = (e) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("Menu button clicked, current showMenu:", showMenu)
    setShowMenu(!showMenu)
  }

  const closeMenu = () => {
    console.log("Closing menu")
    setShowMenu(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading list...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
          <p className="text-white mb-4">{error}</p>
          <button
            onClick={fetchListDetails}
            className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!listDetails) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">List Not Found</h2>
          <p className="text-gray-400 mb-4">
            The list you're looking for doesn't exist or you don't have access to it.
          </p>
          <button
            onClick={() => navigate("/my-lists")}
            className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Back to My Lists
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url('${listDetails.items?.[0] ? getPosterUrl(listDetails.items[0].poster_path, "w1280") : "/placeholder.svg?height=720&width=1280"}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(3px)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/my-lists")}
              className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">{listDetails.name}</h1>
              {listDetails.description && <p className="text-gray-400 mt-1">{listDetails.description}</p>}
              <p className="text-sm text-gray-500 mt-2">
                {listDetails.item_count} {listDetails.item_count === 1 ? "item" : "items"}
              </p>
            </div>
          </div>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors z-40 relative"
            >
              <MoreHorizontal className="w-6 h-6" />
            </button>

            {showMenu && (
              <>
                {/* Menu Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-xl z-50">
                  <div className="py-1">
                    <button
                      onClick={confirmDeleteList}
                      disabled={deletingList}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-gray-700 transition-colors disabled:opacity-50 text-left"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete List
                    </button>
                  </div>
                </div>

                {/* Backdrop to close menu */}
                <div className="fixed inset-0 z-30" onClick={closeMenu} />
              </>
            )}
          </div>
        </div>

        {/* List Items */}
        {listDetails.items && listDetails.items.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
            {listDetails.items.map((item) => {
              const key = `${item.media_type || "movie"}_${item.id}`
              return (
                <div key={item.id} className="relative">
                  <MovieCard
                    mediaType={item.media_type || "movie"}
                    mediaId={item.id}
                    bookmarked={bookmarkStates[key] || false}
                    isLoading={bookmarkLoading[key] || false}
                    onBookmarkToggle={handleBookmarkToggle}
                    onDelete={handleRemoveFromList}
                    className="h-full"
                    showBookmark={true}
                    showDeleteButton={true}
                    deleteLoading={deleteLoading[key] || false}
                  />
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="mb-4 p-4 rounded-full bg-black/30 w-20 h-20 flex items-center justify-center mx-auto">
              <Trash2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">This list is empty</h3>
            <p className="text-gray-400 mb-6">Start adding movies and TV shows to build your collection</p>
            <button
              onClick={() => navigate("/discover")}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Discover Content
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100] p-4">
          <div className="bg-[#1a1a1a] rounded-lg w-full max-w-md border border-gray-700 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Delete List</h2>
              <button
                onClick={cancelDelete}
                disabled={deletingList}
                className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-white mb-2">
                Are you sure you want to delete <span className="font-semibold">"{listDetails.name}"</span>?
              </p>
              <p className="text-gray-400 text-sm mb-6">
                This action cannot be undone. All {listDetails.item_count} items will be removed from this list.
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  disabled={deletingList}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteList}
                  disabled={deletingList}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deletingList ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete List
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ListDetailsPage
