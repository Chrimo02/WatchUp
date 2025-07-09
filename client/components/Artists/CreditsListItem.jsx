import SimpleMovieCard from "../SimpleMovieCard";

const CreditsListItem = ({
  title = "Spider-Man: Homecoming",
  rating = "7.2",
  yearsValue = "2025",
  characterValue = "Peter Parker",
  creditsValue = "Actor",
  poster = "/placeholder-poster.jpg",
  score = "7.2",
  bookmarked = false,
  isLoading = false,
  onBookmarkToggle = () => {},
  id,
  type
}) => {
  return (
    <div className="flex min-h-[178px] px-1 md:px-[5px] py-4 items-center gap-4 md:gap-[25px] rounded-[10px] border border-gray-500/50 bg-transparent">
      {/* Movie Card */}
      <div className="flex-shrink-0 pl-3">
        <SimpleMovieCard
          poster={poster}
          //title={title}
          score={score}
          bookmarked={bookmarked}
          isLoading={isLoading}
          onBookmarkToggle={onBookmarkToggle}
          id={id}
          type={type}
        />
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col justify-center gap-2 md:gap-[7px] min-h-[156px] py-2 ">
        {/* Title */}
        <div className="w-full">
          <h2 className="text-white font-poppins text-xl md:text-[30px] font-semibold leading-tight md:leading-normal">
            {title}
          </h2>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 md:gap-[19px]">
          <div className="flex items-center gap-1 md:gap-[2px]">
            <img
              className="w-4 h-4 md:w-[21px] md:h-[21px] flex-shrink-0"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/8acc1cd4c12fdf35a38e1e6bda1b66ee524acc2b?width=42"
              alt="Star rating"
            />
            <span className="text-white font-poppins text-lg md:text-[25px] font-normal leading-normal">
              {rating}
            </span>
          </div>
        </div>

        {/* Info Columns */}
        <div className="flex items-start gap-4 md:gap-[81px] w-full">
          {/* Years Featured */}
          <div className="flex-1">
            <div className="text-gray-400 font-poppins text-sm md:text-[26px] font-normal leading-normal">
              Years Featured
            </div>
            <div className="text-white font-poppins text-base md:text-[26px] font-normal leading-normal">
              {yearsValue}
            </div>
          </div>

          {/* Characters */}
          <div className="flex-1">
            <div className="text-gray-400 font-poppins text-sm md:text-[26px] font-normal leading-normal">
              Characters
            </div>
            <div className="text-white font-poppins text-base md:text-[26px] font-normal leading-normal">
              {characterValue}
            </div>
          </div>

          {/* Credits */}
          <div className="flex-1">
            <div className="text-gray-400 font-poppins text-sm md:text-[26px] font-normal leading-normal">
              Credits
            </div>
            <div className="text-white font-poppins text-base md:text-[26px] font-normal leading-normal">
              {creditsValue}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditsListItem;