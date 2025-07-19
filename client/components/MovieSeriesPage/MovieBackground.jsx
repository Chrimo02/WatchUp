// MovieBackground.jsx
const MovieBackground = ({ url }) => (
  <div className="absolute inset-0 w-full min-h-full">
    <img
      src={url}
      alt="Movie Background"
      className="w-full h-full min-h-full object-cover opacity-25"
    />
  </div>
);

export default MovieBackground;