const MovieBackground = ({ url }) => (
  <div className="absolute inset-0 w-full h-full z-0">
    <img
      src={url}
      alt="Movie Background"
      className="w-full h-full object-cover opacity-25"
    />
  </div>
);

export default MovieBackground;
