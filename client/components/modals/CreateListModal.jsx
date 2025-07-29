"use client"

import { useState } from "react"
import { X, Loader2 } from "lucide-react"
import { createList } from "../../utils/api"
import { useAuth } from "../../contexts/AuthContext"

const CreateListModal = ({ isOpen, onClose, onListCreated }) => {
  const { sessionId } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      setError("List name is required")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await createList(sessionId, formData.name.trim(), formData.description.trim())

      if (response.data.success) {
        // Reset form
        setFormData({ name: "", description: "" })

        // Call the callback with the new list info
        onListCreated({
          id: response.data.list_id,
          name: formData.name.trim(),
          description: formData.description.trim(),
          itemCount: 0,
          posterUrl: null,
        })

        onClose()
      } else {
        setError("Failed to create list. Please try again.")
      }
    } catch (err) {
      console.error("Error creating list:", err)
      setError("Failed to create list. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setFormData({ name: "", description: "" })
      setError("")
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Create New List</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-600/20 border border-red-600/50 rounded text-red-400 text-sm">{error}</div>
          )}

          <div className="space-y-4">
            {/* List Name */}
            <div>
              <label htmlFor="listName" className="block text-sm font-medium text-white mb-2">
                List Name *
              </label>
              <input
                id="listName"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter list name"
                className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                disabled={isLoading}
                maxLength={50}
              />
              <div className="text-xs text-gray-400 mt-1">{formData.name.length}/50 characters</div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="listDescription" className="block text-sm font-medium text-white mb-2">
                Description (Optional)
              </label>
              <textarea
                id="listDescription"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Enter list description"
                rows={3}
                className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-none"
                disabled={isLoading}
                maxLength={200}
              />
              <div className="text-xs text-gray-400 mt-1">{formData.description.length}/200 characters</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create List"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateListModal
