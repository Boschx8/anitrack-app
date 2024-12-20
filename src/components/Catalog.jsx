import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react';
import AnimeCard from './AnimeCard';
import LoadingSpinner from './LoadingSpinner';

const Catalog = () => {
  const genres = [
    { id: 1, name: "Action" },
    { id: 2, name: "Adventure" },
    { id: 4, name: "Comedy" },
    { id: 8, name: "Drama" },
    { id: 10, name: "Fantasy" },
    { id: 14, name: "Horror" },
    { id: 7, name: "Mystery" },
    { id: 22, name: "Romance" },
    { id: 24, name: "Sci-Fi" },
    { id: 36, name: "Slice of Life" },
    { id: 30, name: "Sports" },
    { id: 37, name: "Supernatural" },
    { id: 41, name: "Suspense" },
    { id: 27, name: "Shounen" }
  ];

  const statuses = ["Airing", "Complete", "Upcoming"];
  const ratings = [
    { value: "g", label: "G - All Ages" },
    { value: "pg", label: "PG - Children" },
    { value: "pg13", label: "PG-13 " },
    { value: "r17", label: "R - 17+ " },
    { value: "r", label: "R+ - Mild Nudity" }
  ];

  const [collapsedSections, setCollapsedSections] = useState({
    year: false,
    genres: false,
    status: false,
    rating: false
  });

  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    genres: [],
    status: [],
    rating: []
  });

  const [sortBy, setSortBy] = useState('popularity');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [animeData, setAnimeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [retryCount, setRetryCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const handleFilterChange = (filterName, value, isArray = true) => {
    setPage(1);
    setAnimeData([]);
    setHasMore(true);
    setFilters(prev => ({
      ...prev,
      [filterName]: isArray
        ? prev[filterName].includes(value)
          ? prev[filterName].filter(item => item !== value)
          : [value]
        : value
    }));
  };

  const handleYearChange = (year) => {
    setPage(1);
    setAnimeData([]);
    setHasMore(true);
    setFilters(prev => ({
      ...prev,
      year: year
    }));
  };

  useEffect(() => {
    const controller = new AbortController();
    let timeoutId;

    const fetchAnime = async () => {
      try {
        setLoading(true);
        setError(null);

        await new Promise(resolve => setTimeout(resolve, 1000));

        let url = `https://api.jikan.moe/v4/anime?page=${page}&limit=24`;

        // Handle status and sorting
        const isUpcoming = filters.status.includes('Upcoming');
        
        if (isUpcoming && sortBy === 'popularity') {
          url += '&order_by=members&sort=desc';
        } else {
          switch (sortBy) {
            case 'popularity':
              url += '&order_by=members&sort=desc';
              break;
            case 'title':
              url += '&order_by=title&sort=asc';
              break;
            case 'newest':
              url += '&order_by=start_date&sort=desc';
              break;
            case 'rating':
              url += '&order_by=score&sort=desc';
              break;
          }
        }

        // Add filters to URL
        if (filters.year && !isUpcoming) {
          const formattedYear = filters.year.toString();
          url += `&start_date=${formattedYear}-01-01&end_date=${formattedYear}-12-31`;
        }

        if (filters.genres.length > 0) {
          url += `&genres=${filters.genres[0]}`;
        }

        if (filters.status.length > 0) {
          const statusMap = {
            'Airing': 'airing',
            'Complete': 'completed',
            'Upcoming': 'upcoming'
          };
          url += `&status=${statusMap[filters.status[0]]}`;
        }

        if (filters.rating.length > 0) {
          url += `&rating=${filters.rating[0].toUpperCase()}`;
        }

        const response = await fetch(url, {
          signal: controller.signal
        });

        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Retrying...');
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        const newData = data.data || [];
        setHasMore(newData.length === 24);

        setAnimeData(prevData => 
          page === 1 ? newData : [...prevData, ...newData]
        );
        
        setRetryCount(0);
        
      } catch (error) {
        if (error.name === 'AbortError') {
          return;
        }

        if (error.message.includes('Rate limit exceeded') && retryCount < 3) {
          setError('Rate limit exceeded. Retrying...');
          setRetryCount(prev => prev + 1);
          timeoutId = setTimeout(() => {
            fetchAnime();
          }, 4000);
          return;
        }

        setError(error.message);
        console.error('API Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnime();

    return () => {
      controller.abort();
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [page, sortBy, filters, retryCount]);

  const handleShowMore = () => {
    if (!loading && !error && hasMore) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const handleRetry = () => {
    setError(null);
    setRetryCount(0);
    setPage(1);
    setAnimeData([]);
    setHasMore(true);
  };

  const toggleSection = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const FilterSection = ({ title, children, section }) => (
    <div className="filter-section">
      <div 
        className="filter-header"
        onClick={() => toggleSection(section)}
      >
        <h3>{title}</h3>
        {collapsedSections[section] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>
      <div className={`filter-options ${collapsedSections[section] ? 'collapsed' : ''}`}>
        {children}
      </div>
    </div>
  );

  const YearFilter = () => {
    const isUpcoming = filters.status.includes('Upcoming');
    const [inputValue, setInputValue] = useState(filters.year.toString());
    
    const handleInputChange = (e) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      
      // Only update the filter if the value is a valid year
      if (newValue.length === 4) {
        const year = parseInt(newValue);
        if (year >= 1940 && year <= new Date().getFullYear()) {
          handleYearChange(year);
        }
      }
    };

    const handleBlur = () => {
      if (!inputValue || inputValue.length !== 4) {
        setInputValue(filters.year.toString());
      }
    };
    
    return (
      <div className="year-filter">
        <input
          type="number"
          min="1940"
          max={new Date().getFullYear()}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className="year-input"
          placeholder={new Date().getFullYear().toString()}
          disabled={isUpcoming}
        />
        {isUpcoming && (
          <p style={{ color: '#666', fontSize: '0.8rem', marginTop: '0.5rem' }}>
            Year filter is disabled for upcoming anime
          </p>
        )}
      </div>
    );
  };

  const CheckboxFilter = ({ options, selectedValues, onToggle, isGenre = false }) => (
    <div className="checkbox-group">
      {options.map(option => {
        const value = isGenre ? option.id : option.value || option;
        const label = isGenre ? option.name : option.label || option;
        
        return (
          <label key={value} className="filter-option">
            <input
              type="checkbox"
              checked={selectedValues.includes(value)}
              onChange={() => onToggle(value)}
            />
            <span>{label}</span>
          </label>
        );
      })}
    </div>
  );

  return (
    <div className="catalog-container">
      <button 
        className="mobile-filters-toggle"
        onClick={() => setIsMobileFiltersOpen(true)}
      >
        <Filter size={20} />
        <span>Filters</span>
      </button>

      <aside className={`filters-sidebar ${isMobileFiltersOpen ? 'mobile-open' : ''}`}>
        <div className="filters-header-mobile">
          <h2>Filters</h2>
          <button 
            className="close-filters-btn"
            onClick={() => setIsMobileFiltersOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <div className="filters-content">
          <FilterSection title="Year" section="year">
            <YearFilter />
          </FilterSection>

          <FilterSection title="Genres" section="genres">
            <CheckboxFilter
              options={genres}
              selectedValues={filters.genres}
              onToggle={(genreId) => handleFilterChange('genres', genreId)}
              isGenre={true}
            />
          </FilterSection>

          <FilterSection title="Status" section="status">
            <CheckboxFilter
              options={statuses}
              selectedValues={filters.status}
              onToggle={(status) => handleFilterChange('status', status)}
            />
          </FilterSection>

          <FilterSection title="Rating" section="rating">
            <CheckboxFilter
              options={ratings}
              selectedValues={filters.rating}
              onToggle={(rating) => handleFilterChange('rating', rating)}
            />
          </FilterSection>
        </div>
      </aside>

      {isMobileFiltersOpen && (
        <div 
          className="mobile-filters-overlay"
          onClick={() => setIsMobileFiltersOpen(false)}
        />
      )}

      <main className="catalog-content">
        <div className="catalog-header">
          <h1>Catalog</h1>
          <select 
            value={sortBy} 
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
              setAnimeData([]);
              setHasMore(true);
            }}
            className="sort-select"
          >
            <option value="popularity">Sort by Popularity</option>
            <option value="title">Sort by Title</option>
            <option value="newest">Sort by Newest</option>
            <option value="rating">Sort by Rating</option>
          </select>
        </div>

        {error && (
          <div className="error-container" style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ marginBottom: '1rem' }}>{error}</p>
            <button 
              onClick={handleRetry}
              className="login-btn"
              style={{ padding: '0.5rem 1rem' }}
            >
              Retry
            </button>
          </div>
        )}

        {loading && <LoadingSpinner />}

        {!loading && (
          <>
            <div className="catalog-grid">
              {animeData.map(anime => (
                <AnimeCard
                  key={anime.mal_id}
                  anime={{
                    title: anime.title,
                    genre: anime.genres?.map(g => g.name).join(', '),
                    image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
                    mal_id: anime.mal_id
                  }}
                />
              ))}
            </div>

            {!error && animeData.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                No results found for the selected filters.
              </div>
            )}
          </>
        )}
        
        {!loading && !error && animeData.length > 0 && hasMore && (
          <button 
            className="show-more-btn" 
            onClick={handleShowMore}
            disabled={loading}
          >
            Show More
          </button>
        )}
      </main>
    </div>
  );
};

export default Catalog;