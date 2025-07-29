"use client"

import { useState, useEffect } from "react"
import { X, Plus, Check, Loader2 } from "lucide-react"
import { getUserLists, getListDetails, addMovieToList, removeMovieFromList } from "../../utils/api"
import { useAuth } from "../../contexts/AuthContext"
import CreateListModal from "./CreateListModal"

const AddToListModal = ({ isOpen, onClose, movieId, movieTitle, mediaType = "movie" }) => {
  const { user, sessionId } = useAuth()
  const [lists, setLists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [updatingLists, setUpdatingLists] = useState(new Set())
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    if (isOpen && user && sessionId) {
      fetchUserLists()
    }
  }, [isOpen, user, sessionId])

  const fetchUserLists = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await getUserLists(user.id, sessionId)
      const userLists = response.data.results || []

      // Fetch details for each list to check if movie is already in it
      const listsWithDetails = await Promise.allSettled(
        userLists.map(async (list) => {
          try {
            const detailsResponse = await getListDetails(list.id, sessionId)
            const listDetails = detailsResponse.data

            // Check if the current movie is in this list
            const isMovieInList =
              listDetails.items?.some((item) => item.id === movieId && item.media_type === mediaType) || false

            return {
              id: list.id,
              name: list.name,
              description: list.description,
              itemCount: listDetails.item_count || 0,
              isMovieInList,
            }
          } catch (error) {
            console.error(`Failed to fetch details for list ${list.id}:`, error)
            return {
              id: list.id,
              name: list.name,
              description: list.description,
              itemCount: 0,
              isMovieInList: false,
            }
          }
        }),
      )

      const validLists = listsWithDetails
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value)

      setLists(validLists)
    } catch (err) {
      console.error("Failed to fetch user lists:", err)
      setError("Failed to load your lists. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleList = async (listId, isCurrentlyInList) => {
    setUpdatingLists((prev) => new Set([...prev, listId]))

    try {
      if (isCurrentlyInList) {
        await removeMovieFromList(listId, sessionId, movieId)
      } else {
        await addMovieToList(listId, sessionId, movieId)
      }

      // Update the local state
      setLists((prev) =>
        prev.map((list) =>
          list.id === listId
            ? {
                ...list,
                isMovieInList: !isCurrentlyInList,
                itemCount: isCurrentlyInList ? list.itemCount - 1 : list.itemCount + 1,
              }
            : list,
        ),
      )
    } catch (err) {
      console.error("Failed to toggle movie in list:", err)
      setError("Failed to update list. Please try again.")
    } finally {
      setUpdatingLists((prev) => {
        const newSet = new Set(prev)
        newSet.delete(listId)
        return newSet
      })
    }
  }

  const handleListCreated = (newList) => {
    setLists((prev) => [...prev, { ...newList, isMovieInList: false }])
    setShowCreateModal(false)
  }

  const handleClose = () => {
    if (updatingLists.size === 0) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-[#1a1a1a] rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
            <div>
              <h2 className="text-xl font-bold text-white">Add to List</h2>
              <p className="text-sm text-gray-400 mt-1 truncate">{movieTitle}</p>
            </div>
            <button
              onClick={handleClose}
              disabled={updatingLists.size > 0}
              className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
              </div>
            ) : error ? (
              <div className="p-6">
                <div className="text-center text-red-400">
                  <p>{error}</p>
                  <button
                    onClick={fetchUserLists}
                    className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Create New List Button */}
                <div className="p-4 border-b border-gray-700 flex-shrink-0">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-full flex items-center gap-3 p-3 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                      <Plus className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white font-medium">Create New List</span>
                  </button>
                </div>

                {/* Lists */}
                <div className="flex-1 overflow-y-auto">
                  {lists.length === 0 ? (
                    <div className="p-6 text-center text-gray-400">
                      <p>You don't have any lists yet.</p>
                      <p className="text-sm mt-2">Create your first list to get started!</p>
                    </div>
                  ) : (
                    <div className="p-4 space-y-2">
                      {lists.map((list) => (
                        <button
                          key={list.id}
                          onClick={() => handleToggleList(list.id, list.isMovieInList)}
                          disabled={updatingLists.has(list.id)}
                          className="w-full flex items-center gap-3 p-3 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg transition-colors disabled:opacity-50"
                        >
                          <div className="w-8 h-8 flex items-center justify-center">
                            {updatingLists.has(list.id) ? (
                              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                            ) : list.isMovieInList ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <div className="w-4 h-4 border-2 border-gray-400 rounded" />
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <div className="text-white font-medium">{list.name}</div>
                            <div className="text-sm text-gray-400">
                              {list.itemCount} {list.itemCount === 1 ? "item" : "items"}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Create List Modal */}
      <CreateListModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onListCreated={handleListCreated}
      />
    </>
  )
}

export default AddToListModal
