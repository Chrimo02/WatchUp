// MovieOverview.jsx
const MovieOverview = ({ tagline, overview }) => (
  <>
    {/* Tagline */}
    <div className="italic text-white/70 text-base md:text-lg">
      {tagline}
    </div>

    {/* Overview */}
    <div className="space-y-3">
      <h2 className="text-white font-semibold text-lg md:text-xl">
        Overview
      </h2>
      <p className="text-white text-sm md:text-base leading-relaxed max-w-4xl">
        {overview}
      </p>
    </div>
  </>
);

export default MovieOverview;