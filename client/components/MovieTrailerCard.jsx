import { useState } from "react";

export function MovieTrailerCard({ title, releaseDate, posterUrl, youtubeId }) {
  const [showVideo, setShowVideo] = useState(false);

  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Unknown release date";

  return (
    <div className="w-[359px] h-[247px] flex-shrink-0 text-white relative">
      {/* ▶ Trailer / Poster (359 × 201) */}
      <div
        onClick={() => setShowVideo((s) => !s)}
        className="w-[359px] h-[201px] relative overflow-hidden rounded-lg cursor-pointer"
      >
        {!showVideo && (
          <>
            <img
              src={posterUrl}
              alt={`${title} poster`}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <svg viewBox="0 0 74 74" className="w-[74px] h-[74px] text-white">
                <path
                  d="M53.6 40.2 24.2 57.3C21.7 58.7 18.5 57 18.5 54V20c0-3 3.2-4.8 5.7-3.3l29.4 16.9a4 4 0 0 1 0 7Z"
                  fill="currentColor"
                />
              </svg>
            </div>
          </>
        )}

        {showVideo && (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
        )}
      </div>

      {/* Title & full date (46 px area) */}
      <div className="w-full h-[46px] mt-[0.25rem] text-center flex flex-col justify-center">
        <h3 className="text-[15px] font-semibold leading-tight truncate">{title}</h3>
        <span className="text-xs text-gray-300">{formatDate(releaseDate)}</span>
      </div>

      {/* Close button */}
      {showVideo && (
        <button
          onClick={(e) => {
            setShowVideo(false);
            e.stopPropagation();
          }}
          className="absolute top-2 right-2 z-10 w-8 h-8 bg-black/70 rounded-full flex items-center justify-center hover:bg-black/90 transition"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
