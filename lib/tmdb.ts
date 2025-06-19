"use client"

// TMDB API Configuration
const TMDB_API_KEY = "411f87653c2105d2ce0c9fe683843c10"
const TMDB_READ_ACCESS_TOKEN =
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0MTFmODc2NTNjMjEwNWQyY2UwYzlmZTY4Mzg0M2MxMCIsIm5iZiI6MTc1MDMwODM2Ni41MDMsInN1YiI6IjY4NTM5NjBlODEzODVhNGU0MDBjZjIyMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Mx-jqu9iLOcY31neRd7lCwj0FB7lhcArb6_lLcP4ANA"
const TMDB_BASE_URL = "https://api.themoviedb.org/3"
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p"

export interface TMDBMovie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  genre_ids: number[]
  popularity: number
  adult: boolean
  original_language: string
  original_title: string
  video: boolean
  media_type?: "movie"
}

export interface TMDBTVShow {
  id: number
  name: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  first_air_date: string
  vote_average: number
  vote_count: number
  genre_ids: number[]
  popularity: number
  adult: boolean
  original_language: string
  original_name: string
  media_type?: "tv"
}

export interface TMDBGenre {
  id: number
  name: string
}

export interface TMDBResponse<T> {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}

// Combined content type
export type TMDBContent = (TMDBMovie | TMDBTVShow) & {
  media_type: "movie" | "tv"
  display_title: string
  display_date: string
}

const headers = {
  Authorization: `Bearer ${TMDB_READ_ACCESS_TOKEN}`,
  "Content-Type": "application/json",
}

// API Functions
export const tmdbApi = {
  // Movies
  getPopularMovies: async (page = 1): Promise<TMDBResponse<TMDBMovie>> => {
    const response = await fetch(`${TMDB_BASE_URL}/movie/popular?page=${page}`, { headers })
    if (!response.ok) throw new Error("Failed to fetch popular movies")
    return response.json()
  },

  getTopRatedMovies: async (page = 1): Promise<TMDBResponse<TMDBMovie>> => {
    const response = await fetch(`${TMDB_BASE_URL}/movie/top_rated?page=${page}`, { headers })
    if (!response.ok) throw new Error("Failed to fetch top rated movies")
    return response.json()
  },

  // TV Shows
  getPopularTVShows: async (page = 1): Promise<TMDBResponse<TMDBTVShow>> => {
    const response = await fetch(`${TMDB_BASE_URL}/tv/popular?page=${page}`, { headers })
    if (!response.ok) throw new Error("Failed to fetch popular TV shows")
    return response.json()
  },

  getTopRatedTVShows: async (page = 1): Promise<TMDBResponse<TMDBTVShow>> => {
    const response = await fetch(`${TMDB_BASE_URL}/tv/top_rated?page=${page}`, { headers })
    if (!response.ok) throw new Error("Failed to fetch top rated TV shows")
    return response.json()
  },

  // Combined trending content
  getTrendingContent: async (timeWindow: "day" | "week" = "week", page = 1): Promise<TMDBResponse<TMDBContent>> => {
    const response = await fetch(`${TMDB_BASE_URL}/trending/all/${timeWindow}?page=${page}`, { headers })
    if (!response.ok) throw new Error("Failed to fetch trending content")
    return response.json()
  },

  // Search both movies and TV shows
  searchMulti: async (query: string, page = 1): Promise<TMDBResponse<TMDBContent>> => {
    const response = await fetch(`${TMDB_BASE_URL}/search/multi?query=${encodeURIComponent(query)}&page=${page}`, {
      headers,
    })
    if (!response.ok) throw new Error("Failed to search content")
    return response.json()
  },

  searchMovies: async (query: string, page = 1): Promise<TMDBResponse<TMDBMovie>> => {
    const response = await fetch(`${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${page}`, {
      headers,
    })
    if (!response.ok) throw new Error("Failed to search movies")
    return response.json()
  },

  searchTVShows: async (query: string, page = 1): Promise<TMDBResponse<TMDBTVShow>> => {
    const response = await fetch(`${TMDB_BASE_URL}/search/tv?query=${encodeURIComponent(query)}&page=${page}`, {
      headers,
    })
    if (!response.ok) throw new Error("Failed to search TV shows")
    return response.json()
  },

  // Discover content
  discoverMovies: async (params: {
    page?: number
    sort_by?: string
    with_genres?: string
    primary_release_year?: number
    "vote_count.gte"?: number
    "vote_count.lte"?: number
    "vote_average.gte"?: number
    "vote_average.lte"?: number
    "primary_release_date.gte"?: string
    "primary_release_date.lte"?: string
  }): Promise<TMDBResponse<TMDBMovie>> => {
    const searchParams = new URLSearchParams(
      Object.fromEntries(Object.entries(params).map(([key, value]) => [key, String(value)])),
    )
    const response = await fetch(`${TMDB_BASE_URL}/discover/movie?${searchParams}`, { headers })
    if (!response.ok) throw new Error("Failed to discover movies")
    return response.json()
  },

  discoverTVShows: async (params: {
    page?: number
    sort_by?: string
    with_genres?: string
    first_air_date_year?: number
    "vote_count.gte"?: number
    "vote_count.lte"?: number
    "vote_average.gte"?: number
    "vote_average.lte"?: number
    "first_air_date.gte"?: string
    "first_air_date.lte"?: string
  }): Promise<TMDBResponse<TMDBTVShow>> => {
    const searchParams = new URLSearchParams(
      Object.fromEntries(Object.entries(params).map(([key, value]) => [key, String(value)])),
    )
    const response = await fetch(`${TMDB_BASE_URL}/discover/tv?${searchParams}`, { headers })
    if (!response.ok) throw new Error("Failed to discover TV shows")
    return response.json()
  },

  // Genres
  getMovieGenres: async (): Promise<{ genres: TMDBGenre[] }> => {
    const response = await fetch(`${TMDB_BASE_URL}/genre/movie/list`, { headers })
    if (!response.ok) throw new Error("Failed to fetch movie genres")
    return response.json()
  },

  getTVGenres: async (): Promise<{ genres: TMDBGenre[] }> => {
    const response = await fetch(`${TMDB_BASE_URL}/genre/tv/list`, { headers })
    if (!response.ok) throw new Error("Failed to fetch TV genres")
    return response.json()
  },

  // Details
  getMovieDetails: async (movieId: number) => {
    const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}?append_to_response=credits,videos,similar`, {
      headers,
    })
    if (!response.ok) throw new Error("Failed to fetch movie details")
    return response.json()
  },

  getTVDetails: async (tvId: number) => {
    const response = await fetch(`${TMDB_BASE_URL}/tv/${tvId}?append_to_response=credits,videos,similar`, {
      headers,
    })
    if (!response.ok) throw new Error("Failed to fetch TV show details")
    return response.json()
  },
}

// Helper functions for image URLs
export const getImageUrl = (path: string | null, size = "w500"): string => {
  if (!path) return "/placeholder.svg?height=600&width=400"
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`
}

export const getPosterUrl = (path: string | null): string => {
  return getImageUrl(path, "w500")
}

export const getBackdropUrl = (path: string | null): string => {
  return getImageUrl(path, "w1280")
}

// Helper function to normalize content
export const normalizeContent = (item: TMDBMovie | TMDBTVShow | TMDBContent): TMDBContent => {
  const isMovie = "title" in item || item.media_type === "movie"

  return {
    ...item,
    media_type: isMovie ? "movie" : "tv",
    display_title: isMovie
      ? (item as TMDBMovie).title || (item as TMDBMovie).original_title
      : (item as TMDBTVShow).name || (item as TMDBTVShow).original_name,
    display_date: isMovie ? (item as TMDBMovie).release_date : (item as TMDBTVShow).first_air_date,
  } as TMDBContent
}
