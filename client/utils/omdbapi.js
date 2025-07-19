import axios from 'axios';

const API_KEY = import.meta.env.VITE_OMDB_API_KEY; // Replace with your OMDb API key
const BASE_URL = 'https://www.omdbapi.com/';

export async function fetchMovieById(imdbID) {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        apikey: API_KEY,
        i: imdbID,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function fetchMoviesBySearch(searchTerm) {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        apikey: API_KEY,
        s: searchTerm,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}
