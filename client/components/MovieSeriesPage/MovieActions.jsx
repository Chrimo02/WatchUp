// MovieActions.jsx
import AddToList from "../../assets/AddToList.svg";
import AddedFavorite from "../../assets/AddedFavorite.svg";
import AddToFavorite from "../../assets/AddToFavorite.svg";
import AddBookmarkMoviePage from "../../assets/AddBookmarkMoviePage.svg";
import AddedBookmark from "../../assets/AddedBookmark.svg";

const MovieActions = ({ 
  isAuthenticated,
  isFavorite,
  isInWatchlist,
  onFavoriteToggle,
  onWatchlistToggle,
  onPlayTrailer,
  onAddToList
}) => {

  return (
    <div className="flex flex-wrap gap-3">
      {/* Add to List Button */}
      <button
        onClick={() => {
          onAddToList()
        }}
        className="w-12 h-12 bg-[#222629] rounded-full hover:bg-[#222629]/80 flex items-center justify-center"
      >
        <img src={AddToList} className="w-5 h-5" alt="Add to list" />
      </button>

      {/* Favorite Button */}
      <button
        onClick={onFavoriteToggle}
        className="w-12 h-12 bg-[#222629] rounded-full hover:bg-[#222629]/80 flex items-center justify-center"
      >
        <img
          src={isFavorite ? AddedFavorite : AddToFavorite}
          alt={isFavorite ? "Remove from favorites" : "Add to favorite"}
          className="w-5 h-5"
        />
      </button>

      {/* Watchlist Button */}
      <button
        onClick={onWatchlistToggle}
        className="w-12 h-12 bg-[#222629] rounded-full hover:bg-[#222629]/80 flex items-center justify-center"
      >
        <img
          src={isInWatchlist ? AddedBookmark : AddBookmarkMoviePage}
          alt={isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
          className="w-5 h-5"
        />
      </button>

      {/* Play Trailer Button */}
      <button
        onClick={onPlayTrailer}
        className="flex items-center gap-2 bg-transparent hover:bg-white/10 text-white border-none px-4 py-2 rounded-full"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M6 4L16 10L6 16V4Z" fill="white" />
        </svg>
        <span className="font-bold">Play Trailer</span>
      </button>
    </div>
  );
};

export default MovieActions;