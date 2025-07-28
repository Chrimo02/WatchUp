import { useState, useEffect } from "react";

const RatingModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  tempRating, 
  setTempRating, 
  title = "",
  currentRating = 0,
  onClearRating
}) => {
  const [hoveredRating, setHoveredRating] = useState(0);

  useEffect(() => {
    if (isOpen) {
      // Calculate scrollbar width before hiding it
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Set initial rating to current rating when modal opens
      setTempRating(currentRating);
      
      // Prevent body scroll and compensate for scrollbar width
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      // Re-enable body scroll and remove padding
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, [isOpen, currentRating, setTempRating]);

  if (!isOpen) return null;

  const handleStarClick = (rating) => {
    setTempRating(rating);
  };

  const handleStarHover = (rating) => {
    setHoveredRating(rating);
  };

  const handleMouseLeave = () => {
    setHoveredRating(0);
  };

  const handleSubmit = () => {
    if (tempRating > 0 && onSubmit) {
      onSubmit(tempRating);
    }
  };

  const handleClear = () => {
    if (onClearRating) {
      onClearRating();
    }
    onClose();
  };

  const displayRating = hoveredRating || tempRating;

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      style={{ margin: 0, top: 0, left: 0, right: 0, bottom: 0, height: '100vh', width: '100vw' }}
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-[#1a1a1a] to-[#0d1117] rounded-2xl p-8 max-w-md w-full border border-gray-700/50 shadow-2xl backdrop-blur-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-white font-bold text-xl mb-2">Rate this movie</h3>
            <h4 className="text-[#f5c518] font-semibold text-lg truncate pr-2">
              {title}
            </h4>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl hover:bg-white/10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0"
          > 
            ×
          </button>
        </div>

        {/* Star Rating */}
        <div className="space-y-8">
          <div className="text-center">
            <div 
              className="flex justify-center gap-1 mb-6"
              onMouseLeave={handleMouseLeave}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleStarClick(rating)}
                  onMouseEnter={() => handleStarHover(rating)}
                  className="group relative transition-all duration-200 hover:scale-110 active:scale-95"
                >
                  <svg
                    className={`w-8 h-8 transition-all duration-200 ${
                      rating <= displayRating
                        ? 'text-[#f5c518] drop-shadow-lg'
                        : 'text-gray-600 group-hover:text-[#f5c518]/50'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  {/* Tooltip */}
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap backdrop-blur-sm">
                    {rating}/10
                  </div>
                </button>
              ))}
            </div>
            
            {/* Rating Display - Fixed height container */}
            <div className="text-center mb-8 h-10 flex items-center justify-center">
              {displayRating > 0 ? (
                <div className="text-white">
                  <span className="text-4xl font-bold">{displayRating}</span>
                  <span className="text-xl text-gray-400">/10</span>
                </div>
              ) : (
                <div className="text-gray-400 text-lg">
                  Click on a star to rate
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 py-3 px-4 rounded-xl font-medium transition-all duration-200 border border-gray-600/30 hover:border-gray-500/50 backdrop-blur-sm"
            >
              Cancel
            </button>
            
            {currentRating > 0 && (
              <button
                onClick={handleClear}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-red-500/25 active:scale-95"
              >
                Clear Rating
              </button>
            )}
            
            <button
              onClick={handleSubmit}
              disabled={tempRating === 0}
              className="flex-1 bg-gradient-to-r from-[#f5c518] to-[#e6b800] hover:from-[#e6b800] hover:to-[#d4a000] text-black font-bold py-3 px-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-yellow-500/25 active:scale-95"
            >
              {currentRating > 0 ? 'Update' : 'Rate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;