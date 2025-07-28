// MovieCrew.jsx
const MovieCrew = ({ crew }) => {
  if (!crew || crew.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {crew.map((person, index) => (
          <div key={index} className="space-y-2">
            <h3 className="text-white font-bold text-sm md:text-base">
              {person.name}
            </h3>
            <p className="text-white/80 text-xs md:text-sm">
              {person.role}
            </p>
          </div>    
        ))}
      </div>
    </div>
  );
};

export default MovieCrew;