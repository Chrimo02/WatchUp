import stageBg from "../../assets/stage.png";
import profilePlaceholder from "../../assets/placeholder-profile.png";
import { useState } from "react";

export default function ArtistShowcase({
  portraitSrc,
  portraitAlt = profilePlaceholder,
}) {
  const [src, setSrc] = useState(portraitSrc || profilePlaceholder);

  return (
    <div className="w-full max-w-[280px] mx-auto">
      <div className="relative w-full aspect-[478/641]">
        {/* Stage background image */}
        <div className="absolute inset-0">
          <img
            src={stageBg}
            alt="Stage background"
            className="w-full h-full object-cover rounded-[2.09%]"
          />
        </div>
        {/* Right gradient overlay */}
        <div className="absolute top-0 w-[45%] h-full" style={{ left: "55%" }}>
          <svg
            className="w-full h-full"
            viewBox="0 0 195 641"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path d="M0 0H195V641H0V0Z" fill="url(#paint0_linear_217_3993)" />
            <defs>
              <linearGradient
                id="paint0_linear_217_3993"
                x1="-12"
                y1="291.221"
                x2="183"
                y2="291.221"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopOpacity="0" />
                <stop offset="1" stopColor="#141414" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        {/* Left gradient overlay */}
        <div className="absolute top-0 left-0 w-[45%] h-full">
          <svg
            className="w-full h-full"
            viewBox="0 0 195 641"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            style={{ transform: "scaleX(-1)" }}
          >
            <path d="M0 0H195V641H0V0Z" fill="url(#paint0_linear_left)" />
            <defs>
              <linearGradient
                id="paint0_linear_left"
                x1="-12"
                y1="291.221"
                x2="183"
                y2="291.221"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopOpacity="0" />
                <stop offset="1" stopColor="#141414" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        {/* Top gradient overlay */}
        <div
          className="absolute top-0 left-0 w-full h-[12%]"
          style={{
            background:
              "linear-gradient(180deg, #141414 0%, rgba(20,20,20,0) 100%)",
          }}
        />
        {/* Bottom gradient overlay - full width */}
        <div
          className="absolute bottom-0 left-0 w-full h-[11.54%]"
          style={{
            background:
              "linear-gradient(180deg, rgba(0, 0, 0, 0.00) 0%, #141414 100%)",
          }}
        />
        {/* Artist portrait */}
        <div className="absolute top-[27.14%] left-[23.22%] w-[48.12%] aspect-[2/3]">
          <img
            src={src}
            alt={portraitAlt}
            className="w-full h-full object-cover rounded-[4.35%]"
            onError={() => {
              if (src !== profilePlaceholder) {
                setSrc(profilePlaceholder);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}