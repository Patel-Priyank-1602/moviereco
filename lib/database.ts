"use client"

// Database configuration
const DATABASE_KEY = "your_database_key_here" // Replace with your actual database key

// User preferences and watchlist management
export interface UserProfile {
  id: string
  preferences: {
    ratingRange: string
    yearRange: string
    selectedGenres: number[]
  }
  watchlist: number[] // Movie IDs
  favorites: number[] // Movie IDs
  searchHistory: string[]
  createdAt: string
  updatedAt: string
}

// Mock database functions - replace with your actual database implementation
export const database = {
  // Save user preferences
  saveUserPreferences: async (userId: string, preferences: UserProfile["preferences"]): Promise<void> => {
    try {
      // Replace with your database save logic
      const userProfile: UserProfile = {
        id: userId,
        preferences,
        watchlist: [],
        favorites: [],
        searchHistory: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      localStorage.setItem(`user_${userId}`, JSON.stringify(userProfile))
      console.log("User preferences saved:", preferences)
    } catch (error) {
      console.error("Error saving user preferences:", error)
      throw error
    }
  },

  // Get user preferences
  getUserPreferences: async (userId: string): Promise<UserProfile | null> => {
    try {
      // Replace with your database fetch logic
      const stored = localStorage.getItem(`user_${userId}`)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error("Error fetching user preferences:", error)
      return null
    }
  },

  // Add movie to watchlist
  addToWatchlist: async (userId: string, movieId: number): Promise<void> => {
    try {
      const profile = await database.getUserPreferences(userId)
      if (profile) {
        if (!profile.watchlist.includes(movieId)) {
          profile.watchlist.push(movieId)
          profile.updatedAt = new Date().toISOString()
          localStorage.setItem(`user_${userId}`, JSON.stringify(profile))
        }
      }
    } catch (error) {
      console.error("Error adding to watchlist:", error)
      throw error
    }
  },

  // Remove movie from watchlist
  removeFromWatchlist: async (userId: string, movieId: number): Promise<void> => {
    try {
      const profile = await database.getUserPreferences(userId)
      if (profile) {
        profile.watchlist = profile.watchlist.filter((id) => id !== movieId)
        profile.updatedAt = new Date().toISOString()
        localStorage.setItem(`user_${userId}`, JSON.stringify(profile))
      }
    } catch (error) {
      console.error("Error removing from watchlist:", error)
      throw error
    }
  },

  // Add movie to favorites
  addToFavorites: async (userId: string, movieId: number): Promise<void> => {
    try {
      const profile = await database.getUserPreferences(userId)
      if (profile) {
        if (!profile.favorites.includes(movieId)) {
          profile.favorites.push(movieId)
          profile.updatedAt = new Date().toISOString()
          localStorage.setItem(`user_${userId}`, JSON.stringify(profile))
        }
      }
    } catch (error) {
      console.error("Error adding to favorites:", error)
      throw error
    }
  },

  // Save search history
  saveSearchHistory: async (userId: string, searchQuery: string): Promise<void> => {
    try {
      const profile = await database.getUserPreferences(userId)
      if (profile) {
        // Add to beginning of array and limit to 10 recent searches
        profile.searchHistory = [searchQuery, ...profile.searchHistory.filter((q) => q !== searchQuery)].slice(0, 10)
        profile.updatedAt = new Date().toISOString()
        localStorage.setItem(`user_${userId}`, JSON.stringify(profile))
      }
    } catch (error) {
      console.error("Error saving search history:", error)
      throw error
    }
  },

  // Get user's watchlist movies
  getWatchlistMovies: async (userId: string): Promise<number[]> => {
    try {
      const profile = await database.getUserPreferences(userId)
      return profile?.watchlist || []
    } catch (error) {
      console.error("Error fetching watchlist:", error)
      return []
    }
  },

  // Get user's favorite movies
  getFavoriteMovies: async (userId: string): Promise<number[]> => {
    try {
      const profile = await database.getUserPreferences(userId)
      return profile?.favorites || []
    } catch (error) {
      console.error("Error fetching favorites:", error)
      return []
    }
  },
}

// Generate a simple user ID (replace with your authentication system)
export const generateUserId = (): string => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Get or create user ID
export const getUserId = (): string => {
  let userId = localStorage.getItem("moviefinder_user_id")
  if (!userId) {
    userId = generateUserId()
    localStorage.setItem("moviefinder_user_id", userId)
  }
  return userId
}
