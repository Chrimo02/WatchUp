import { Search, User } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext'; // Pfad anpassen, falls nötig
import SignIn from '../assets/SignIn.svg';
import Shuffle from '../assets/Shuffle.svg';
import WatchlistIcon from '../assets/Watchlist.svg';

export default function Navbar() {
  const { isAuthenticated, user, login } = useAuth();
  const [searchValue, setSearchValue] = useState('');

  return (
    <nav className="relative grid h-24 grid-cols-3 items-center bg-red-700 px-4">
      {/* ───── Logo & Navigation ───── */}
      <div className="flex items-center gap-1 lg:gap-2">
        <h1
          className="font-limelight text-[20px] leading-6 tracking-[0.02em] text-white sm:text-[24px] lg:text-[32px]"
          style={{
            textShadow:
              '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
          }}
        >
          WatchUp
        </h1>

        <ul className="hidden lg:flex">
          {['Movies', 'TV Shows', 'People'].map((item) => (
            <li
              key={item}
              className="flex cursor-pointer items-center px-2 py-3 text-[16px] font-bold leading-6 tracking-[0.32px] text-white transition-opacity hover:opacity-80"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* ───── Suche ───── */}
      <div className="flex justify-center">
        <label className="flex w-full max-w-[460px] items-center gap-2 rounded border border-white/75 bg-black/10 px-3 py-2 lg:px-4 lg:py-3">
          <Search className="h-4 w-4 text-white lg:h-5 lg:w-5" />
          <input
            type="text"
            placeholder="Search Movies or TV Shows"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full bg-transparent text-[12px] leading-4 text-white/75 placeholder:text-white/75 focus:outline-none lg:text-[14px]"
          />
        </label>
      </div>

      {/* ───── Icons / Profil ───── */}
      <div className="flex items-center justify-end gap-2 lg:gap-4">
        <span className="flex h-6 w-6 items-center justify-center border border-white text-[12px] font-bold leading-6 tracking-[0.32px] text-white lg:text-[14px]">
          EN
        </span>

        <img src={Shuffle} alt="Shuffle" className="hidden h-5 w-5 lg:block" />

        <button className="flex items-center gap-1 lg:gap-1">
          <img src={WatchlistIcon} alt="Watchlist" className="h-4 w-3 lg:h-5 lg:w-4" />
          <span className="hidden whitespace-nowrap text-[16px] font-bold leading-6 tracking-[0.32px] text-white lg:inline">
            Watchlist
          </span>
        </button>

        {/* ───── Auth ───── */}
        <button
          onClick={login}
          className="flex items-center gap-1 transition-opacity hover:opacity-80 lg:gap-1"
        >
          {isAuthenticated ? (
            <User className="h-4 w-4 text-white lg:h-5 lg:w-5" />
          ) : (
            <img src={SignIn} alt="Sign in" className="h-4 w-4 lg:h-5 lg:w-5" />
          )}
          <span className="hidden whitespace-nowrap text-[16px] font-bold leading-6 tracking-[0.32px] text-white lg:inline">
            {isAuthenticated ? user?.username ?? 'My Account' : 'Sign in with TMDB'}
          </span>
        </button>
      </div>
    </nav>
  );
}
