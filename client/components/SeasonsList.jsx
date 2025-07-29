import PropTypes from "prop-types";
import SeasonCard from "./SeasonCard";
import { Link } from "react-router-dom";   

export default function SeasonsList({ tvId, seasons = [] }) {
  const normalSeasons = seasons
    .filter(s => s.season_number !== 0)
    .sort((a, b) => a.season_number - b.season_number);

  if (normalSeasons.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-3xl font-extrabold font-poppins mb-2">Seasons</h2>

      <div className="flex flex-col gap-4">
        {normalSeasons.map(season => (
           <Link
            key={season.id}
            to={`/series/${tvId}/season/${season.season_number}`}  /* ← NEW */
            className="hover:opacity-90 transition-opacity"
          >
          <SeasonCard key={season.id} season={season} />
          </Link>
        ))}
      </div>
    </section>
  );
}

SeasonsList.propTypes = {
  seasons: PropTypes.arrayOf(PropTypes.object).isRequired,
};
