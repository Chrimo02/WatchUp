import PropTypes from "prop-types";
import Star          from "../assets/Star.svg";
import NoImageFound  from "../assets/no-image-found.png";

/**
 * Displays one season (poster • title • year • ep‑count • TMDB score).
 * ‑ No “Rate” button – seasons themselves can’t be rated via the API.
 */
export default function SeasonCard({ season }) {
  const {
    name,
    poster_path:   posterPath,
    air_date:      airDate,
    episode_count: episodes = 0,
    vote_average:  voteAvg  = 0,
    overview      = "",
  } = season;

  /* helper fields */
  const IMG   = posterPath ? `https://image.tmdb.org/t/p/w342${posterPath}` : NoImageFound;
  const year  = airDate ? new Date(airDate).getFullYear() : "–";
  const score = voteAvg.toFixed(1);

  return (
    <div className="flex bg-[#181818] border border-white/10 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
      {/* Poster */}
      <img
        src={IMG}
        alt={name}
        className="w-[120px] sm:w-[140px] md:w-[160px] object-cover flex-shrink-0"
      />

      {/* Info */}
      <div className="flex flex-col gap-1 py-4 pl-5 pr-4 text-white flex-1">
        {/* Title */}
        <h3 className="text-2xl font-[550] font-poppins leading-tight">
          {name}
        </h3>

        {/* Year • episodes */}
        <p className="text-sm text-gray-300 font-sans">
          {year} <span className="mx-1">•</span> {episodes}{" "}
          {episodes === 1 ? "Episode" : "Episodes"}
        </p>

        {/* TMDB score */}
       <div className="inline-flex items-center mt-1 h-[22px]">
            <img
                src={Star}
                alt="Star"
                className="w-[18px] h-[18px] object-center"
                style={{ display: "block" }}
            />
            <span className="text-yellow-400 font-bold text-[18px] ml-[6px] relative top-[1px]">
                {score}
            </span>
        </div>  

        {/* Overview */}
        {overview && (
          <p className="text-[15px] text-gray-300 leading-relaxed line-clamp-3 font-sans mt-2">
            {overview}
          </p>
        )}
      </div>
    </div>
  );
}

SeasonCard.propTypes = {
  season: PropTypes.shape({
    id:            PropTypes.number.isRequired,
    name:          PropTypes.string.isRequired,
    poster_path:   PropTypes.string,
    air_date:      PropTypes.string,
    episode_count: PropTypes.number,
    vote_average:  PropTypes.number,
    overview:      PropTypes.string,
    season_number: PropTypes.number,
  }).isRequired,
};
