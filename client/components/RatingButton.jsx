import Star from "../assets/Star.svg";

const RatingButton = ({
  yourRating,
  isAuthenticated,
  onRatingClick
}) => {
  const handleClick = () => {
    if (isAuthenticated) {
      onRatingClick();
    } else {
      alert('Please sign in to rate movies');
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 bg-[#222629] hover:bg-[#222629]/80 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer"
    >
      <img src={Star} className="w-5 h-5" alt="Rating star icon" />
      
      {yourRating ? (
        <div className="flex items-center">
          <span className="text-white text-lg font-normal">
            {yourRating}
          </span>
          <span className="text-[#c3c3c4] text-sm font-normal ml-1">
            /10
          </span>
        </div>
      ) : (
        <span className="text-white text-sm font-normal">
          Rate
        </span>
      )}
    </button>
  );
};

export default RatingButton;