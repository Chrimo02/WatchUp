// MoviePoster.jsx
const MoviePoster = ({ posterUrl, title }) => (
  <div className="flex-shrink-0 mx-auto lg:mx-0">
    <img
      src={posterUrl}
      alt={title}
      className="w-[250px] md:w-[316px] h-[375px] md:h-[474px] rounded-[5px] object-cover"
    />
  </div>
);

export default MoviePoster;