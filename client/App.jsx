// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import MyListsPage from './pages/MyListsPage';
import SearchResultsPage from './pages/SearchResultsPage';
import MovieDetailsPage from './pages/MovieDetailsPage';
import SeriesDetailsPage from './pages/SeriesDetailsPage';
import SingleArtistPage from './pages/SingleArtistPage';
import PopularPeople from './pages/PopularPeople';
import ComponentTestPage from './pages/ComponentTestPage';
import SeasonPage from './pages/SeasonPage';
import ListDetailsPage from './pages/ListDetailsPage';
import NotFound from './pages/NotFound';

import DiscoveryMoviesPage from './pages/DiscoveryMoviesPage';
import DiscoverySeriesPage from './pages/DiscoverySeriesPage';

import { useAuth } from './contexts/AuthContext';

export default function App() {
  const { isInitialized } = useAuth();
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary" />
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="my-lists" element={<MyListsPage />} />
          <Route path="search" element={<SearchResultsPage />} />
          <Route path="movie/:id" element={<MovieDetailsPage />} />
          <Route path="tv/:id" element={<SeriesDetailsPage />} />
          <Route path="person/:id" element={<SingleArtistPage />} />
          <Route path="people" element={<PopularPeople />} />
          <Route path="series/:tvId/season/:seasonNumber" element={<SeasonPage />} />
          <Route path="list/:listId" element={<ListDetailsPage />} />

          <Route path="discover">
            <Route index element={<Navigate to="movies" replace />} />
            <Route path="movies" element={<DiscoveryMoviesPage />} />
            <Route path="series" element={<DiscoverySeriesPage />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}