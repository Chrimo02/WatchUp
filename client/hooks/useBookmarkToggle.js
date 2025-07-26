// src/hooks/useBookmarkToggle.js
import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMovies } from '../contexts/MovieContext';

export function useBookmarkToggle() {
  const { isAuthenticated, user, sessionId, login } = useAuth();
  const { toggleWatchlist, isInWatchlist } = useMovies();

  // keep track of which IDs are mid‑toggle
  const [loadingSet, setLoadingSet] = useState(new Set());

  const toggle = useCallback(async (itemId, itemType) => {
    if (!isAuthenticated) {
      // not logged in → send to login flow
      return login();
    }
    if (!user || !sessionId) {
      console.error('Missing user/session');
      return;
    }
    // prevent double‑clicks
    if (loadingSet.has(itemId)) return;
    setLoadingSet(s => new Set(s).add(itemId));

    try {
      const currentlyBookmarked = isInWatchlist(itemId, itemType);
      await toggleWatchlist(user.id, sessionId, itemId, itemType, currentlyBookmarked);
      console.log(
        `${currentlyBookmarked ? 'Removed' : 'Added'} ${itemType} ${itemId}`
      );
    } catch (err) {
      console.error('Bookmark toggle failed:', err);
      if (err.response?.status === 429) {
        alert('Too many requests, try again in a moment.');
      } else {
        alert('Failed to update watchlist.');
      }
    } finally {
      setLoadingSet(s => {
        const next = new Set(s);
        next.delete(itemId);
        return next;
      });
    }
  }, [
    isAuthenticated,
    user,
    sessionId,
    login,
    toggleWatchlist,
    isInWatchlist,
    loadingSet
  ]);

  return {
    handleBookmarkToggle: toggle,
    bookmarkLoadingStates: loadingSet,
  };
}
