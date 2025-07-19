import React from "react";
import JustWatchLogo from "../../assets/JustWatchLogo.svg";

const WatchProviders = ({ providers, region }) => {
  const rows = [
    { key: "stream", label: "Stream", labelClass: "text-2xl font-semibold", logoSize: 50 },
    { key: "rent",   label: "Rent",   labelClass: "text-xl font-medium",  logoSize: 30 },
    { key: "buy",    label: "Buy",    labelClass: "text-xl font-medium",  logoSize: 30 },
  ];

  return (
    <section>
      {/* header with logo above the title */}
      <div className="flex flex-col items-start">
        <img src={JustWatchLogo} alt="JustWatch" className="h-4 mb-1" />  {/* smaller and with bottom margin */}
        <h2 className="text-white text-2xl font-semibold">Where to Watch</h2>
      </div>

      <div className="p-3 rounded-2xl space-y-5">
        {rows.map(({ key, label, labelClass, logoSize }) => {
          const items = providers[key] || [];
          return (
            <div key={key} className="flex items-center pl-12">
              <div className={`w-32 pr-4 text-white ${labelClass}`}>
                {label}
              </div>
              <div className="flex flex-wrap gap-4">
                {items.length > 0 ? items.map(item => (
                  <img
                    key={item.provider_id}
                    src={`https://image.tmdb.org/t/p/w92${item.logo_path}`}
                    alt={item.provider_name}
                    width={logoSize}
                    height={logoSize}
                    className="object-contain rounded-lg shadow-lg"
                    title={item.provider_name}
                  />
                )) : (
                  <span className="text-gray-500 italic">
                    Not available in {region}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default WatchProviders;
