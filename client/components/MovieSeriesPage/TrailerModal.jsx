import { useEffect, useRef } from 'react';

const TrailerModal = ({ isOpen, onClose, movieTitle, trailer }) => {
  const modalRef = useRef(null);

  // Close modal on Escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // TrailerModal.jsx  ── only the return() block shown
if (!isOpen) return null;

return (
  /* ── dark overlay ─────────────────────────────────────── */
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
    onClick={onClose}
  >
    {/* ── responsive modal box ────────────────────────────── */}
    <div
      ref={modalRef}
      onClick={(e) => e.stopPropagation()}
      className="flex flex-col bg-[#1a1a1a] rounded-lg shadow-xl overflow-hidden"
      /* pick the smaller of 90 vw or 90 vh×16/9  ➜  fits both directions */
      style={{
        width:  'min(90vw, calc(90vh * 16 / 9))',
        height: 'min(calc(90vw * 9 / 16), 90vh)'
      }}
    >
      {/* ── header (shrinks) ─────────────────────────────── */}
      <div className="flex justify-between items-center p-4 md:p-4 shrink-0">
        <h3 className="text-white text-lg md:text-2xl font-bold">
          {trailer ? `${movieTitle} – ${trailer.name}` 
                   : `${movieTitle} – Official Trailer`}
        </h3>
        <button
          onClick={onClose}
          className="text-white text-3xl hover:bg-white/10 w-10 h-10 rounded-full flex items-center justify-center"
        >
          ×
        </button>
      </div>

      {/* ── video takes ALL remaining space ──────────────── */}
      <div className="relative flex-1 bg-[#2a2a2a]">
        {trailer?.youtubeId ? (
          <iframe
            src={`https://www.youtube.com/embed/${trailer.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
            title={`${movieTitle} Trailer`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M8 5v14l11-7z" fill="white" />
              </svg>
            </div>
            <p className="text-white text-lg">Official trailer not available</p>
            <p className="text-gray-400 text-sm">
              We couldn't find an official trailer for this movie.
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
);

};

export default TrailerModal;