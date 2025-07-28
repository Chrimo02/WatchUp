import React from 'react';
import SimpleMovieCard from '../SimpleMovieCard';

export default function CreditsListItem({
  id,
  type,
  poster,
  title,
  rating,
  date,             // wird hier nicht mehr gebraucht
  yearsValue,      // übergebe in Grid date als yearsValue
  characterValue,
  creditsValue,
  bookmarked,
  isLoading,
  onBookmarkToggle,
}) {
  return (
    <div className="flex min-h-[178px] px-1 md:px-[5px] py-4 items-center gap-4 md:gap-[25px] rounded-[10px] border border-gray-500/50 bg-transparent">
      <div className="flex-shrink-0 pl-3">
        <SimpleMovieCard
          poster={poster}
          score={rating}
          bookmarked={bookmarked}
          isLoading={isLoading}
          onBookmarkToggle={() => onBookmarkToggle(id, type)}
          id={id}
          type={type}
        />
      </div>
      <div className="flex-1 flex flex-col justify-center gap-2 md:gap-[7px] min-h-[156px] py-2">
        <h2 className="text-white font-poppins text-xl md:text-[30px] font-semibold">
          {title}
        </h2>
        <div className="flex items-center gap-2 md:gap-[19px]">
          <span className="text-white font-poppins text-lg md:text-[25px]">{rating}</span>
        </div>
        <div className="flex items-start gap-4 md:gap-[81px] w-full">
          <div className="flex-1">
            <div className="text-gray-400 font-poppins text-sm md:text-[26px]">Years Featured</div>
            <div className="text-white mt-5 font-poppins text-base md:text-[26px]">
              {yearsValue}
            </div>
          </div>
          <div className="flex-1">
            <div className="text-gray-400 font-poppins text-sm md:text-[26px]">Characters</div>
            <div className="text-white mt-5 font-poppins text-base md:text-[26px]">
              {characterValue}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}