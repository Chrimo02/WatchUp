// Sidebar.jsx
import React from 'react';
import { posterSizes } from '../../utils/api';

// Icon imports
import homepageIcon from '../../assets/home.svg';
import facebookIcon from '../../assets/facebook.svg';
import imdbIcon     from '../../assets/imdb.svg';
import instagramIcon from '../../assets/instagram.svg';
import thetvdbIcon   from '../../assets/tvdb.svg';
import twitterIcon   from '../../assets/twitter.svg';
import wikidataIcon  from '../../assets/wikidata.svg';

export function Sidebar({
  // Series props
  externalIds = {},    // { facebook_id, imdb_id, instagram_id, tvdb_id, twitter_id, wikidata_id }
  homepage,            // string
  status,
  originalLanguage,
  network = [],        // array of { name, logo_path }
  type,
  // Movie props
  budget,
  revenue,
  // Common
  keywords = []
}) {

  // build array of { url, icon, label }
  const links = [];
  if (homepage) {
    links.push({ url: homepage, icon: homepageIcon, label: 'Homepage' });
  }
  if (externalIds.facebook_id) {
    links.push({
      url: `https://www.facebook.com/${externalIds.facebook_id}`,
      icon: facebookIcon,
      label: 'Facebook'
    });
  }
  if (externalIds.imdb_id) {
    links.push({
      url: `https://www.imdb.com/title/${externalIds.imdb_id}`,
      icon: imdbIcon,
      label: 'IMDb'
    });
  }
  if (externalIds.instagram_id) {
    links.push({
      url: `https://www.instagram.com/${externalIds.instagram_id}`,
      icon: instagramIcon,
      label: 'Instagram'
    });
  }
  if (externalIds.tvdb_id) {
    links.push({
      url: `https://thetvdb.com/?tab=series&id=${externalIds.tvdb_id}`,
      icon: thetvdbIcon,
      label: 'TheTVDB'
    });
  }
  if (externalIds.twitter_id) {
    links.push({
      url: `https://twitter.com/${externalIds.twitter_id}`,
      icon: twitterIcon,
      label: 'Twitter'
    });
  }
  if (externalIds.wikidata_id) {
    links.push({
      url: `https://www.wikidata.org/wiki/${externalIds.wikidata_id}`,
      icon: wikidataIcon,
      label: 'Wikidata'
    });
  }

  return (
    <div className="space-y-6">
      {/* External Links as Icons */}
      {links.length > 0 && (
        <div>
          <h4 className="text-white text-lg font-semibold">Links</h4>
          <div className="flex items-center gap-4 mt-2">
            {links.map((l, i) => (
              <a
                key={i}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                title={l.label}
                className="inline-block w-10 h-10"
              >
                <img
                  src={l.icon}
                  alt={l.label}
                  className="w-full h-full object-contain filter brightness-0 invert"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Status */}
      {status && (
        <div>
          <h4 className="text-white text-lg font-semibold">Status</h4>
          <p className="text-gray-300">{status}</p>
        </div>
      )}

      {/* Original Language */}
      {originalLanguage && (
        <div>
          <h4 className="text-white text-lg font-semibold">
            Original Language
          </h4>
          <p className="text-gray-300">{originalLanguage}</p>
        </div>
      )}

      {/* Network Logos */}
      {network.length > 0 && (
        <div>
          <h4 className="text-white text-lg font-semibold">Network</h4>
          <div className="flex items-center gap-4 mt-2">
            {network.map((n, i) => (
              <img
                key={i}
                src={n.logo_path ? `${posterSizes.medium}${n.logo_path}` : ''}
                alt={n.name}
                title={n.name}
                className="w-14 h-auto object-contain filter brightness-0 invert"
              />
            ))}
          </div>
        </div>
      )}

      {/* Type */}
      {type && (
        <div>
          <h4 className="text-white text-lg font-semibold">Type</h4>
          <p className="text-gray-300">{type}</p>
        </div>
      )}

      {/* Budget & Revenue (movies only) */}
      {budget != null && (
        <div>
          <h4 className="text-white text-lg font-semibold">Budget</h4>
          <p className="text-gray-300">
            ${budget.toLocaleString()}
          </p>
        </div>
      )}
      {revenue != null && (
        <div>
          <h4 className="text-white text-lg font-semibold">Revenue</h4>
          <p className="text-gray-300">
            ${revenue.toLocaleString()}
          </p>
        </div>
      )}

      {/* Keywords */}
      {keywords.length > 0 && (
        <div>
          <h4 className="text-white text-lg font-semibold">Keywords</h4>
          <div className="flex flex-wrap gap-2 mt-2">
            {keywords.slice(0, 15).map((kw, i) => (
              <span
                key={i}
                className="bg-gray-400 text-black text-xs px-1 py-1 rounded"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
