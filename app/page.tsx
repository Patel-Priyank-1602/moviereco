"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Star,
  Calendar,
  Film,
  ChevronRight,
  ChevronLeft,
  Tv,
  Grid3X3,
  List,
  Clock,
  Menu,
  ArrowLeft,
  Clapperboard,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { tmdbApi, getPosterUrl, getBackdropUrl, normalizeContent, type TMDBGenre, type TMDBContent } from "@/lib/tmdb"

// Types
interface UserPreferences {
  ratingRange: string
  yearRange: string
  selectedGenres: number[]
  contentType: "all" | "movie" | "tv"
  cinemaType: "indian" | "global"
}

// Professional rating options
const ratingOptions = [
  {
    value: "top-100",
    label: "Top 100 Rated",
    description: "Highest rated content of all time",
    minRating: 8.5,
    minVotes: 10000,
  },
  {
    value: "100-250",
    label: "Highly Rated (8.0+)",
    description: "Excellent quality content",
    minRating: 8.0,
    minVotes: 5000,
  },
  {
    value: "250-500",
    label: "Well Rated (7.5+)",
    description: "Good quality content",
    minRating: 7.5,
    minVotes: 2000,
  },
  {
    value: "7.0+",
    label: "Popular (7.0+)",
    description: "Popular and well-received",
    minRating: 7.0,
    minVotes: 1000,
  },
  {
    value: "6.0+",
    label: "Decent (6.0+)",
    description: "Watchable content",
    minRating: 6.0,
    minVotes: 500,
  },
  {
    value: "all-ratings",
    label: "All Ratings",
    description: "Include all content regardless of rating",
    minRating: 0,
    minVotes: 0,
  },
]

// Comprehensive year options covering all of cinema history
const yearOptions = [
  { value: "1890-1920", label: "Silent Era (1890-1920)", description: "Birth of cinema", shortLabel: "Silent Era" },
  {
    value: "1920-1930",
    label: "Late Silent Era (1920-1930)",
    description: "Golden age of silent films",
    shortLabel: "1920s",
  },
  { value: "1930-1940", label: "Early Talkies (1930-1940)", description: "Sound revolution", shortLabel: "1930s" },
  { value: "1940-1950", label: "Golden Age (1940-1950)", description: "Hollywood's golden era", shortLabel: "1940s" },
  { value: "1950-1960", label: "1950s Classics", description: "Post-war cinema boom", shortLabel: "1950s" },
  { value: "1960-1970", label: "1960s Revolution", description: "New wave and counterculture", shortLabel: "1960s" },
  { value: "1970-1980", label: "1970s Masterpieces", description: "New Hollywood era", shortLabel: "1970s" },
  { value: "1980-1990", label: "1980s Blockbusters", description: "Rise of blockbuster cinema", shortLabel: "1980s" },
  { value: "1990-2000", label: "1990s Classics", description: "Independent film renaissance", shortLabel: "1990s" },
  { value: "2000-2010", label: "2000s Digital Era", description: "Digital revolution begins", shortLabel: "2000s" },
  { value: "2010-2020", label: "2010s Modern", description: "Streaming and franchise era", shortLabel: "2010s" },
  { value: "2020-2025", label: "2020s Latest", description: "Current releases", shortLabel: "2020s" },
  { value: "all-time", label: "All Time (1890-2025)", description: "Complete cinema history", shortLabel: "All Time" },
]

const contentTypeOptions = [
  { value: "all", label: "Movies & TV Shows", icon: Grid3X3, shortLabel: "All" },
  { value: "movie", label: "Movies Only", icon: Film, shortLabel: "Movies" },
  { value: "tv", label: "TV Shows Only", icon: Tv, shortLabel: "TV Shows" },
]

const cinemaTypeOptions = [
  {
    value: "indian",
    label: "Indian Cinema",
    icon: Film,
    shortLabel: "Indian",
    description: "Bollywood, Tollywood, Kollywood & all Indian regional cinema",
  },
  {
    value: "global",
    label: "Global Cinema",
    icon: Grid3X3,
    shortLabel: "Global",
    description: "Movies & TV shows from around the world including India",
  },
]

// Enhanced genres - remove the custom regional cinema section
const genreOptions = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" },
  { id: 10759, name: "Action & Adventure" },
  { id: 10762, name: "Kids" },
  { id: 10763, name: "News" },
  { id: 10764, name: "Reality" },
  { id: 10765, name: "Sci-Fi & Fantasy" },
  { id: 10766, name: "Soap" },
  { id: 10767, name: "Talk" },
  { id: 10768, name: "War & Politics" },
  { id: 10770, name: "TV Movie" },
]

// Simple animated loading dots component
function LoadingDots() {
  return (
    <span className="inline-flex gap-0.5">
      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.2s]"></span>
      <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.1s]"></span>
      <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></span>
    </span>
  )
}

export default function CVRecommendationWebsite() {
  const [currentStep, setCurrentStep] = useState(0) // 0: welcome, 1: content type, 2: rating, 3: year, 4: genre, 5: results
  const [preferences, setPreferences] = useState<UserPreferences>({
    ratingRange: "",
    yearRange: "",
    selectedGenres: [],
    contentType: "all",
    cinemaType: "global",
  })

  const [genres, setGenres] = useState<TMDBGenre[]>([])
  const [content, setContent] = useState<TMDBContent[]>([])
  const [filteredContent, setFilteredContent] = useState<TMDBContent[]>([])
  const [displayedContent, setDisplayedContent] = useState<TMDBContent[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("popularity")
  const [isLoading, setIsLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showMoreLoading, setShowMoreLoading] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const CONTENT_PER_PAGE = 20

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      setInitialLoading(true)
      try {
        const [movieGenresResponse, tvGenresResponse, trendingResponse] = await Promise.all([
          tmdbApi.getMovieGenres(),
          tmdbApi.getTVGenres(),
          tmdbApi.getTrendingContent(),
        ])

        const allGenres = [...movieGenresResponse.genres, ...tvGenresResponse.genres]
        const uniqueGenres = allGenres.filter(
          (genre, index, self) => index === self.findIndex((g) => g.id === genre.id),
        )
        setGenres(uniqueGenres)

        const contentWithImages = trendingResponse.results.map((item) => {
          const normalized = normalizeContent(item)
          return {
            ...normalized,
            poster_path: getPosterUrl(normalized.poster_path),
            backdrop_path: getBackdropUrl(normalized.backdrop_path),
          }
        })
        setContent(contentWithImages)
      } catch (error) {
        console.error("Error fetching initial data:", error)
      } finally {
        setInitialLoading(false)
      }
    }

    fetchInitialData()
  }, [])

  // Filter content based on preferences with Bollywood/Hollywood support
  useEffect(() => {
    const fetchFilteredContent = async () => {
      if (currentStep !== 6) return

      setIsLoading(true)
      setCurrentPage(1)

      try {
        let allContent: TMDBContent[] = []
        let movieResults: TMDBContent[] = []
        let tvResults: TMDBContent[] = []

        if (searchQuery.trim()) {
          if (preferences.contentType === "all") {
            const response = await tmdbApi.searchMulti(searchQuery, 1)
            allContent = response.results.filter((item) => item.media_type === "movie" || item.media_type === "tv")
          } else if (preferences.contentType === "movie") {
            const response = await tmdbApi.searchMovies(searchQuery, 1)
            allContent = response.results.map((item) => normalizeContent({ ...item, media_type: "movie" as const }))
          } else {
            const response = await tmdbApi.searchTVShows(searchQuery, 1)
            allContent = response.results.map((item) => normalizeContent({ ...item, media_type: "tv" as const }))
          }
        } else {
          const movieParams: any = { page: 1, sort_by: "popularity.desc" }
          const tvParams: any = { page: 1, sort_by: "popularity.desc" }

          if (preferences.cinemaType === "indian") {
            movieParams.with_original_language = "hi|ta|te|ml|kn|bn|mr|pa"
            tvParams.with_original_language = "hi|ta|te|ml|kn|bn|mr|pa"
          }

          if (preferences.ratingRange && preferences.ratingRange !== "all-ratings") {
            const ratingOption = ratingOptions.find((opt) => opt.value === preferences.ratingRange)
            if (ratingOption) {
              movieParams["vote_average.gte"] = ratingOption.minRating
              movieParams["vote_count.gte"] = ratingOption.minVotes
              tvParams["vote_average.gte"] = ratingOption.minRating
              tvParams["vote_count.gte"] = ratingOption.minVotes
            }
          }

          if (preferences.yearRange && preferences.yearRange !== "all-time") {
            const [startYear, endYear] = preferences.yearRange.split("-")
            movieParams["primary_release_date.gte"] = `${startYear}-01-01`
            movieParams["primary_release_date.lte"] = `${endYear}-12-31`
            tvParams["first_air_date.gte"] = `${startYear}-01-01`
            tvParams["first_air_date.lte"] = `${endYear}-12-31`
          } else if (preferences.yearRange === "all-time") {
            movieParams["primary_release_date.gte"] = "1890-01-01"
            movieParams["primary_release_date.lte"] = "2025-12-31"
            tvParams["first_air_date.gte"] = "1940-01-01"
            tvParams["first_air_date.lte"] = "2025-12-31"
          }

          switch (sortBy) {
            case "vote_average":
              movieParams.sort_by = "vote_average.desc"
              tvParams.sort_by = "vote_average.desc"
              break
            case "release_date":
              movieParams.sort_by = "release_date.desc"
              tvParams.sort_by = "first_air_date.desc"
              break
            case "release_date_asc":
              movieParams.sort_by = "release_date.asc"
              tvParams.sort_by = "first_air_date.asc"
              break
            case "title":
              movieParams.sort_by = "original_title.asc"
              tvParams.sort_by = "name.asc"
              break
            default:
              movieParams.sort_by = "popularity.desc"
              tvParams.sort_by = "popularity.desc"
          }

          if (preferences.contentType === "all" || preferences.contentType === "movie") {
            if (preferences.selectedGenres.length > 0) {
              for (const genreId of preferences.selectedGenres) {
                for (let page = 1; page <= 3; page++) {
                  try {
                    const response = await tmdbApi.discoverMovies({
                      ...movieParams,
                      with_genres: genreId.toString(),
                      page,
                    })
                    const movies = response.results.map((item) => normalizeContent({ ...item, media_type: "movie" as const }))
                    movieResults = [...movieResults, ...movies]
                  } catch (error) {
                    console.error(`Error fetching movies for genre ${genreId}:`, error)
                  }
                }
              }
            } else {
              for (let page = 1; page <= 5; page++) {
                try {
                  const response = await tmdbApi.discoverMovies({ ...movieParams, page })
                  const movies = response.results.map((item) => normalizeContent({ ...item, media_type: "movie" as const }))
                  movieResults = [...movieResults, ...movies]
                } catch (error) {
                  console.error(`Error fetching movies page ${page}:`, error)
                }
              }
            }
          }

          if (preferences.contentType === "all" || preferences.contentType === "tv") {
            if (preferences.selectedGenres.length > 0) {
              for (const genreId of preferences.selectedGenres) {
                for (let page = 1; page <= 3; page++) {
                  try {
                    const response = await tmdbApi.discoverTVShows({
                      ...tvParams,
                      with_genres: genreId.toString(),
                      page,
                    })
                    const tvShows = response.results.map((item) => normalizeContent({ ...item, media_type: "tv" as const }))
                    tvResults = [...tvResults, ...tvShows]
                  } catch (error) {
                    console.error(`Error fetching TV shows for genre ${genreId}:`, error)
                  }
                }
              }
            } else {
              for (let page = 1; page <= 5; page++) {
                try {
                  const response = await tmdbApi.discoverTVShows({ ...tvParams, page })
                  const tvShows = response.results.map((item) => normalizeContent({ ...item, media_type: "tv" as const }))
                  tvResults = [...tvResults, ...tvShows]
                } catch (error) {
                  console.error(`Error fetching TV shows page ${page}:`, error)
                }
              }
            }
          }

          allContent = [...movieResults, ...tvResults]

          if (
            preferences.yearRange === "all-time" ||
            preferences.yearRange?.includes("1890") ||
            preferences.yearRange?.includes("1920")
          ) {
            try {
              const classicMovieParams = {
                ...movieParams,
                sort_by: "vote_count.desc",
                "primary_release_date.lte": "1970-12-31",
                "vote_count.gte": 100,
              }

              for (let page = 1; page <= 2; page++) {
                const classicResponse = await tmdbApi.discoverMovies({ ...classicMovieParams, page })
                const classicMovies = classicResponse.results.map((item) => normalizeContent({ ...item, media_type: "movie" as const }))
                allContent = [...allContent, ...classicMovies]
              }
            } catch (error) {
              console.error("Error fetching classic content:", error)
            }
          }
        }

        if (searchQuery.trim() && preferences.cinemaType === "indian") {
          const indianLanguages = ["hi", "ta", "te", "ml", "kn", "bn", "mr", "pa"]
          allContent = allContent.filter(
            (item) =>
              indianLanguages.includes(item.original_language) ||
              (typeof item.display_title === "string" &&
                item.display_title.match(
                  /[\u0900-\u097F]|[\u0980-\u09FF]|[\u0A00-\u0A7F]|[\u0A80-\u0AFF]|[\u0B00-\u0B7F]|[\u0B80-\u0BFF]|[\u0C00-\u0C7F]|[\u0C80-\u0CFF]|[\u0D00-\u0D7F]/,
                )),
          )
        }

        const normalizedContent = allContent.map((item) => {
          const normalized = normalizeContent(item)
          return {
            ...normalized,
            poster_path: getPosterUrl(normalized.poster_path),
            backdrop_path: getBackdropUrl(normalized.backdrop_path),
          }
        })

        const uniqueContent = normalizedContent.filter(
          (item, index, self) =>
            index === self.findIndex((c) => c.id === item.id && c.media_type === item.media_type) &&
            item.display_title &&
            item.vote_average >= 0,
        )

        const sortedContent = uniqueContent.sort((a, b) => {
          switch (sortBy) {
            case "vote_average":
              return b.vote_average - a.vote_average
            case "release_date":
              return new Date(b.display_date).getTime() - new Date(a.display_date).getTime()
            case "release_date_asc":
              return new Date(a.display_date).getTime() - new Date(b.display_date).getTime()
            case "title":
              return a.display_title.localeCompare(b.display_title)
            default:
              return b.popularity - a.popularity
          }
        })

        setFilteredContent(sortedContent)
        setDisplayedContent(sortedContent.slice(0, CONTENT_PER_PAGE))
        setTotalPages(Math.ceil(sortedContent.length / CONTENT_PER_PAGE))
      } catch (error) {
        console.error("Error fetching filtered content:", error)
        setFilteredContent([])
        setDisplayedContent([])
      } finally {
        setIsLoading(false)
      }
    }

    const timeoutId = setTimeout(fetchFilteredContent, 300)
    return () => clearTimeout(timeoutId)
  }, [preferences, searchQuery, sortBy, currentStep])

  const handleLoadMore = () => {
    if (currentPage >= totalPages) return

    setShowMoreLoading(true)
    const nextPage = currentPage + 1
    const startIndex = (nextPage - 1) * CONTENT_PER_PAGE
    const endIndex = startIndex + CONTENT_PER_PAGE

    const newContent = filteredContent.slice(startIndex, endIndex)
    setDisplayedContent((prev) => [...prev, ...newContent])
    setCurrentPage(nextPage)
    setShowMoreLoading(false)
  }

  const handleCinemaTypeSelect = (type: "indian" | "global") => {
    setPreferences((prev) => ({ ...prev, cinemaType: type }))
    setCurrentStep(2)
  }

  const handleContentTypeSelect = (type: "all" | "movie" | "tv") => {
    setPreferences((prev) => ({ ...prev, contentType: type }))
    setCurrentStep(3)
  }

  const handleRatingSelect = (rating: string) => {
    setPreferences((prev) => ({ ...prev, ratingRange: rating }))
    setCurrentStep(4)
  }

  const handleYearSelect = (year: string) => {
    setPreferences((prev) => ({ ...prev, yearRange: year }))
    setCurrentStep(5)
  }

  const handleGenreToggle = (genreId: number) => {
    setPreferences((prev) => {
      const newGenres = prev.selectedGenres.includes(genreId)
        ? prev.selectedGenres.filter((id) => id !== genreId)
        : [...prev.selectedGenres, genreId]
      return { ...prev, selectedGenres: newGenres }
    })
  }

  const handleFinishQuestionnaire = () => {
    setCurrentStep(6)
  }

  const resetQuestionnaire = () => {
    setCurrentStep(0)
    setPreferences({
      ratingRange: "",
      yearRange: "",
      selectedGenres: [],
      contentType: "all",
      cinemaType: "global",
    })
    setSearchQuery("")
    setSortBy("popularity")
    setCurrentPage(1)
  }

  const getGenreNames = (genreIds: number[]) => {
    return genreIds.map((id) => genres.find((genre) => genre.id === id)?.name).filter(Boolean)
  }

  const getProgressPercentage = () => {
    return (currentStep / 6) * 100
  }

  const handlePreferenceBadgeClick = (step: number) => {
    setCurrentStep(step)
  }

  // Simple loading animation for initial load
  if (initialLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat bg-gradient-to-br from-gray-50 to-gray-100"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('bg.png')`,
        }}
      >
        <div className="flex flex-col items-center space-y-6">
          <Clapperboard className="h-12 w-12 text-blue-600 animate-bounce" />
          <span className="text-lg font-semibold text-white">Loading Cinema History...</span>
        </div>
      </div>
    )
  }

  // Welcome Screen
  if (currentStep === 0) {
    return (
      <div
        className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-gray-100"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('bg.png')`,
        }}
      >
        <div className="max-w-5xl w-full">
          <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center space-y-6 sm:space-y-8 py-12 sm:py-16 px-4 sm:px-8">
              <div className="flex justify-center">
                <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg animate-float">
                  <Clapperboard className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  CVHRecommendation
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
                  Discover the complete history of cinema and television. From the first films of the 1890s to the
                  latest releases of 2025.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 pt-6 sm:pt-8 px-4">
                <div className="text-center space-y-3 p-4 rounded-xl bg-gradient-to-br from-blue-50/90 to-blue-100/90 border border-blue-200 hover:shadow-lg transition-all duration-300">
                  <div className="p-3 sm:p-4 bg-blue-500 rounded-xl inline-block animate-pulse-glow">
                    <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Complete History</h3>
                  <p className="text-gray-600 text-xs sm:text-sm">From 1890s silent films to 2025 releases</p>
                </div>

                <div className="text-center space-y-3 p-4 rounded-xl bg-gradient-to-br from-green-50/90 to-green-100/90 border border-green-200 hover:shadow-lg transition-all duration-300">
                  <div className="p-3 sm:p-4 bg-green-500 rounded-xl inline-block animate-pulse-glow">
                    <Star className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">All Ratings</h3>
                  <p className="text-gray-600 text-xs sm:text-sm">From masterpieces to hidden gems</p>
                </div>

                <div className="text-center space-y-3 p-4 rounded-xl bg-gradient-to-br from-purple-50/90 to-purple-100/90 border border-purple-200 hover:shadow-lg transition-all duration-300">
                  <div className="p-3 sm:p-4 bg-purple-500 rounded-xl inline-block animate-pulse-glow">
                    <Tv className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Movies & Series</h3>
                  <p className="text-gray-600 text-xs sm:text-sm">Complete entertainment library</p>
                </div>
              </div>

              <div className="pt-6 sm:pt-8">
                <Button
                  onClick={() => setCurrentStep(1)}
                  size="lg"
                  className="w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 text-base sm:text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 animate-gradient"
                >
                  Explore Global Cinema
                  <ChevronRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  // Questionnaire Steps
  if (currentStep >= 1 && currentStep <= 5) {
    return (
      <div
        className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-gray-100"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('bg.png')`,
        }}
      >
        <div className="max-w-7xl w-full">
          <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
            <CardHeader className="space-y-4 sm:space-y-6 p-4 sm:p-8">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  className="flex items-center gap-2 text-sm sm:text-base hover:bg-gray-100"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
                <span className="text-xs sm:text-sm text-gray-500 bg-gradient-to-r from-blue-100 to-purple-100 px-3 py-1 rounded-full">
                  Step {currentStep} of 5
                </span>
              </div>

              <Progress value={getProgressPercentage()} className="h-2 sm:h-3" />

              <div className="text-center space-y-2">
                {currentStep === 1 && (
                  <>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Choose Your Cinema Preference
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base">Select between Indian cinema or global content</p>
                  </>
                )}
                {currentStep === 2 && (
                  <>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      What would you like to explore?
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base">Choose your preferred content type</p>
                  </>
                )}
                {currentStep === 3 && (
                  <>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Select Quality Level
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base">Choose your preferred rating range</p>
                  </>
                )}
                {currentStep === 4 && (
                  <>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Choose Time Period
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base">Select from complete cinema history</p>
                  </>
                )}
                {currentStep === 5 && (
                  <>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Select Genres
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base">Choose your favorite genres (select multiple)</p>
                  </>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6 sm:space-y-8 p-4 sm:p-8 pb-8 sm:pb-12">
              {currentStep === 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
                  {cinemaTypeOptions.map((option) => (
                    <Card
                      key={option.value}
                      className={`cursor-pointer transition-all duration-300 hover:shadow-xl border-2 ${
                        preferences.cinemaType === option.value
                          ? "border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg"
                          : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                      }`}
                      onClick={() => handleCinemaTypeSelect(option.value as any)}
                    >
                      <CardContent className="p-6 sm:p-8 text-center space-y-4">
                        <option.icon className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-700" />
                        <div className="space-y-2">
                          <h3 className="font-bold text-lg sm:text-xl text-gray-900">{option.label}</h3>
                          <p className="text-gray-600 text-sm sm:text-base">{option.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {currentStep === 2 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  {contentTypeOptions.map((option) => (
                    <Card
                      key={option.value}
                      className={`cursor-pointer transition-all duration-300 hover:shadow-xl border-2 ${
                        preferences.contentType === option.value
                          ? "border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg"
                          : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                      }`}
                      onClick={() => handleContentTypeSelect(option.value as any)}
                    >
                      <CardContent className="p-6 sm:p-8 text-center space-y-3 sm:space-y-4">
                        <option.icon className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-700" />
                        <h3 className="font-semibold text-base sm:text-lg text-gray-900">{option.label}</h3>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {currentStep === 3 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {ratingOptions.map((option) => (
                    <Card
                      key={option.value}
                      className={`cursor-pointer transition-all duration-300 hover:shadow-xl border-2 ${
                        preferences.ratingRange === option.value
                          ? "border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg"
                          : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                      }`}
                      onClick={() => handleRatingSelect(option.value)}
                    >
                      <CardContent className="p-4 sm:p-6 space-y-2 sm:space-y-3">
                        <h3 className="font-semibold text-base sm:text-lg text-gray-900">{option.label}</h3>
                        <p className="text-gray-600 text-xs sm:text-sm">{option.description}</p>
                        {option.value !== "all-ratings" && (
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                            <Star className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>
                              {option.minRating}+ rating • {option.minVotes.toLocaleString()}+ votes
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {currentStep === 4 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {yearOptions.map((option) => (
                    <Card
                      key={option.value}
                      className={`cursor-pointer transition-all duration-300 hover:shadow-xl border-2 ${
                        preferences.yearRange === option.value
                          ? "border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg"
                          : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                      }`}
                      onClick={() => handleYearSelect(option.value)}
                    >
                      <CardContent className="p-4 sm:p-6 space-y-2 sm:space-y-3">
                        <h3 className="font-semibold text-sm sm:text-base text-gray-900">{option.shortLabel}</h3>
                        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{option.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-6 sm:space-y-8">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                    {genreOptions.map((genre) => (
                      <Card
                        key={genre.id}
                        className={`cursor-pointer transition-all duration-300 border ${
                          preferences.selectedGenres.includes(genre.id)
                            ? "border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-md"
                            : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                        }`}
                        onClick={() => handleGenreToggle(genre.id)}
                      >
                        <CardContent className="p-3 sm:p-4 text-center space-y-2">
                          <Checkbox
                            checked={preferences.selectedGenres.includes(genre.id)}
                            className="mx-auto"
                            disabled
                          />
                          <p className="text-xs sm:text-sm font-medium text-gray-900 leading-tight">{genre.name}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="text-center space-y-4 sm:space-y-6">
                    {preferences.selectedGenres.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-2">
                        {preferences.selectedGenres.slice(0, 6).map((genreId) => {
                          const genre = genreOptions.find((g) => g.id === genreId)
                          return genre ? (
                            <Badge key={genreId} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                              {genre.name}
                            </Badge>
                          ) : null
                        })}
                        {preferences.selectedGenres.length > 6 && (
                          <Badge variant="secondary" className="text-xs">
                            +{preferences.selectedGenres.length - 6} more
                          </Badge>
                        )}
                      </div>
                    )}

                    <p className="text-gray-600 text-sm sm:text-base">
                      {preferences.selectedGenres.length} genre{preferences.selectedGenres.length !== 1 ? "s" : ""}{" "}
                      selected
                    </p>

                    <Button
                      onClick={handleFinishQuestionnaire}
                      size="lg"
                      disabled={preferences.selectedGenres.length === 0}
                      className="w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 text-base sm:text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      Discover Content
                      <ChevronRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Results Page
  if (currentStep === 6) {
    return (
      <div
        className="min-h-screen bg-cover bg-center bg-no-repeat bg-gradient-to-br from-gray-50 to-gray-100"
      >
        <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <Button variant="ghost" size="sm" onClick={() => setCurrentStep(5)} className="p-2 hover:bg-gray-100">
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
                  <Clapperboard className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    CVHRecommendation
                  </h1>
                  <p className="text-xs text-gray-500 hidden sm:block">Global Cinema Explorer</p>
                </div>
              </div>

              <div className="hidden lg:flex items-center gap-4 flex-1 max-w-2xl mx-8">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search all movies and TV shows..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48 border-gray-300">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popularity">Popularity</SelectItem>
                    <SelectItem value="vote_average">Rating</SelectItem>
                    <SelectItem value="release_date">Newest First</SelectItem>
                    <SelectItem value="release_date_asc">Oldest First</SelectItem>
                    <SelectItem value="title">Title A-Z</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={resetQuestionnaire}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  New Search
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <a href="https://patel-priyank-1602.github.io/contactcvr/" rel="noopener noreferrer">
                    Contact us
                  </a>
                </Button>
              </div>

              <div className="lg:hidden">
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-2">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80 p-0">
                    <div className="p-6 space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Search & Filter</h2>
                      </div>

                      <div className="space-y-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            placeholder="Search movies and TV shows..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>

                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="popularity">Popularity</SelectItem>
                            <SelectItem value="vote_average">Rating</SelectItem>
                            <SelectItem value="release_date">Newest First</SelectItem>
                            <SelectItem value="release_date_asc">Oldest First</SelectItem>
                            <SelectItem value="title">Title A-Z</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          onClick={() => {
                            resetQuestionnaire()
                            setIsMobileMenuOpen(false)
                          }}
                          variant="outline"
                          className="w-full"
                        >
                          New Search
                        </Button>
                        <Button
                          asChild
                          variant="outline"
                          className="w-full mt-2"
                        >
                          <a
                            href="https://patel-priyank-1602.github.io/contactcvr/"
                            rel="noopener noreferrer"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Contact Us
                          </a>
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            <div className="lg:hidden mt-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search all movies and TV shows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <Card className="mb-6 sm:mb-8 bg-white/95 backdrop-blur-sm border-gray-200 shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3">
                <span className="font-semibold text-gray-900 text-sm sm:text-base">Your Selection:</span>

                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className="border-orange-200 text-orange-700 bg-orange-50 text-xs sm:text-sm cursor-pointer hover:bg-orange-100 transition-colors"
                    onClick={() => handlePreferenceBadgeClick(1)}
                  >
                    {cinemaTypeOptions.find((opt) => opt.value === preferences.cinemaType)?.shortLabel}
                  </Badge>

                  <Badge
                    variant="outline"
                    className="border-blue-200 text-blue-700 bg-blue-50 text-xs sm:text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handlePreferenceBadgeClick(2)}
                  >
                    {contentTypeOptions.find((opt) => opt.value === preferences.contentType)?.shortLabel}
                  </Badge>

                  {preferences.ratingRange && (
                    <Badge
                      variant="outline"
                      className="border-green-200 text-green-700 bg-green-50 text-xs sm:text-sm cursor-pointer hover:bg-green-100 transition-colors"
                      onClick={() => handlePreferenceBadgeClick(3)}
                    >
                      {ratingOptions.find((opt) => opt.value === preferences.ratingRange)?.label}
                    </Badge>
                  )}

                  {preferences.yearRange && (
                    <Badge
                      variant="outline"
                      className="border-purple-200 text-purple-700 bg-purple-50 text-xs sm:text-sm cursor-pointer hover:bg-purple-100 transition-colors"
                      onClick={() => handlePreferenceBadgeClick(4)}
                    >
                      {yearOptions.find((opt) => opt.value === preferences.yearRange)?.shortLabel}
                    </Badge>
                  )}

                  {preferences.selectedGenres.length > 0 && (
                    <>
                      {preferences.selectedGenres.slice(0, 2).map((genreId) => {
                        const genre = genreOptions.find((g) => g.id === genreId)
                        return genre ? (
                          <Badge
                            key={genreId}
                            variant="outline"
                            className="text-xs sm:text-sm cursor-pointer transition-colors border-gray-300 text-gray-700 hover:bg-gray-100"
                            onClick={() => handlePreferenceBadgeClick(5)}
                          >
                            {genre.name}
                          </Badge>
                        ) : null
                      })}
                      {preferences.selectedGenres.length > 2 && (
                        <Badge
                          variant="outline"
                          className="border-gray-300 text-gray-700 text-xs sm:text-sm cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handlePreferenceBadgeClick(5)}
                        >
                          +{preferences.selectedGenres.length - 2} more
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                {searchQuery ? `Search Results for "${searchQuery}"` : "Discovered Content"}
              </h2>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <LoadingDots />
                    Loading results...
                  </span>
                ) : (
                  `Showing ${displayedContent.length} of ${filteredContent.length} results`
                )}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="flex-1 sm:flex-none"
              >
                <Grid3X3 className="h-4 w-4 mr-2 sm:mr-0" />
                <span className="sm:hidden">Grid</span>
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="flex-1 sm:flex-none"
              >
                <List className="h-4 w-4 mr-2 sm:mr-0" />
                <span className="sm:hidden">List</span>
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6 mb-8"
                  : "space-y-3 sm:space-y-4 mb-8"
              }
            >
              {Array.from({ length: viewMode === "grid" ? 12 : 6 }).map((_, i) => (
                <Card key={i} className={`overflow-hidden animate-pulse bg-gray-100 ${viewMode === "list" ? "flex" : ""}`}>
                  <div
                    className={viewMode === "grid" ? "aspect-[2/3] bg-gray-200" : "w-16 h-24 sm:w-24 sm:h-36 flex-shrink-0 bg-gray-200"}
                  />
                  <CardContent className={`${viewMode === "grid" ? "p-2 sm:p-4" : "p-3 sm:p-4 flex-1"} space-y-2`}>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6 mb-8"
                    : "space-y-3 sm:space-y-4 mb-8"
                }
              >
                {displayedContent.map((item, index) => (
                  <Card
                    key={`${item.id}-${item.media_type}`}
                    className={`overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group ${
                      viewMode === "list" ? "flex" : ""
                    }`}
                  >
                    <div
                      className={`relative ${
                        viewMode === "grid" ? "aspect-[2/3]" : "w-16 h-24 sm:w-24 sm:h-36 flex-shrink-0"
                      }`}
                    >
                      <img
                        src={item.poster_path || "/placeholder.svg"}
                        alt={item.display_title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-1 sm:top-2 right-1 sm:right-2">
                        <Badge
                          variant="secondary"
                          className={`text-xs ${
                            item.media_type === "movie" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                          }`}
                        >
                          {item.media_type === "movie" ? "Movie" : "TV"}
                        </Badge>
                      </div>
                      {item.display_date && new Date(item.display_date).getFullYear() < 1960 && viewMode === "grid" && index < 6 && (
                        <div className="absolute top-1 sm:top-2 left-1 sm:left-2">
                          <Badge className="bg-amber-500 text-white font-bold text-xs">Classic</Badge>
                        </div>
                      )}
                    </div>

                    <CardContent
                      className={`${viewMode === "grid" ? "p-2 sm:p-4" : "p-3 sm:p-4 flex-1"} space-y-1 sm:space-y-2`}
                    >
                      <h3 className="font-semibold text-gray-900 line-clamp-2 leading-tight text-xs sm:text-sm lg:text-base">
                        {item.display_title}
                      </h3>

                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{item.vote_average.toFixed(1)}</span>
                          </div>
                          {item.display_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                              <span className="text-gray-600">{new Date(item.display_date).getFullYear()}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {viewMode === "grid" && (
                        <div className="flex flex-wrap gap-1">
                          {getGenreNames(item.genre_ids)
                            .slice(0, 1)
                            .map((genre) => (
                              <Badge key={genre} variant="outline" className="text-xs">
                                {genre}
                              </Badge>
                            ))}
                        </div>
                      )}

                      {viewMode === "list" && (
                        <>
                          <div className="flex flex-wrap gap-1">
                            {getGenreNames(item.genre_ids)
                              .slice(0, 2)
                              .map((genre) => (
                                <Badge key={genre} variant="outline" className="text-xs">
                                  {genre}
                                </Badge>
                              ))}
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 hidden sm:block">
                            {item.overview}
                          </p>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {currentPage < totalPages && (
                <div className="text-center">
                  <Button
                    onClick={handleLoadMore}
                    disabled={showMoreLoading}
                    size="lg"
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {showMoreLoading ? (
                      <>
                        <LoadingDots />
                        <span className="ml-2">Loading More...</span>
                      </>
                    ) : (
                      <>
                        Load More Results
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                  <p className="text-gray-500 text-xs sm:text-sm mt-2">
                    {displayedContent.length} of {filteredContent.length} results shown
                  </p>
                </div>
              )}
            </>
          )}

          {filteredContent.length === 0 && !isLoading && (
            <div className="text-center py-12 sm:py-16">
              <div className="space-y-4">
                <Clapperboard className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">No content found</h3>
                <p className="text-gray-600 max-w-md mx-auto text-sm sm:text-base px-4">
                  We couldn't find any content matching your criteria. Try adjusting your preferences or search terms.
                </p>
                <Button
                  onClick={resetQuestionnaire}
                  className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white w-full sm:w-auto"
                >
                  Start New Search
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    )
  }
}