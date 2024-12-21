import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Bookmark, Check, Eye, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ToastProvider from './ToastProvider';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const searchTimeout = useRef(null);
  const { user } = useAuth();

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowDropdown(false);
  };

  const handleAnimeAction = async (anime, status, showToast) => {
    if (!user) {
      showToast('Please login to add animes to your list', 'error');
      return;
    }

    try {
      const animeData = {
        malId: anime.mal_id.toString(),
        title: anime.title,
        image: anime.images.jpg.large_image_url,
        genre: anime.genres?.map(g => g.name).join(', '),
        status
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user-anime/${user.sub}/anime`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(animeData)
      });

      if (!response.ok) {
        throw new Error('Failed to update anime status');
      }

      let message = '';
      switch (status) {
        case 'bookmarked':
          message = `${anime.title} has been added to your bookmarks!`;
          break;
        case 'completed':
          message = `${anime.title} has been marked as completed!`;
          break;
        case 'watching':
          message = `${anime.title} has been added to your watching list!`;
          break;
      }
      showToast(message, 'success');

    } catch (error) {
      console.error('Error:', error);
      showToast('Failed to update anime status', 'error');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (!query.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=5`
        );

        if (response.status === 429) {
          setTimeout(async () => {
            const retryResponse = await fetch(
              `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=5`
            );
            const data = await retryResponse.json();
            setResults(data.data || []);
          }, 1000);
          return;
        }

        const data = await response.json();
        setResults(data.data || []);
        setShowDropdown(true);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [query]);

  return (
    <ToastProvider>
      {({ showToast }) => (
        <div className="search-wrapper" ref={dropdownRef}>
          <div className="search-input-wrapper">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search anime..."
              className="search-input"
            />
            <div className="search-icon">
              {loading ? (
                <Loader2 className="loading-icon" />
              ) : (
                <Search />
              )}
            </div>
            {query && (
              <button 
                className="clear-button"
                onClick={clearSearch}
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {showDropdown && results.length > 0 && (
            <div className="search-dropdown">
              {results.map((anime) => (
                <div 
                  key={anime.mal_id} 
                  className="search-result-item"
                  onClick={() => {
                    const urlTitle = anime.title
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/^-+|-+$/g, '');
                    window.location.hash = `/anime/${urlTitle}`;
                  }}
                >
                  <div className="search-result-content">
                    <img
                      src={anime.images.jpg.image_url}
                      alt={anime.title}
                      className="result-image"
                    />
                    <div className="result-info">
                      <h4 className="result-title">{anime.title}</h4>
                      <p className="result-genres">
                        {anime.genres?.map(g => g.name).join(', ')}
                      </p>
                      <div className="result-actions">
                        <button 
                          className="action-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAnimeAction(anime, 'bookmarked', showToast);
                          }}
                          title="Add to bookmarks"
                        >
                          <Bookmark size={16} />
                        </button>
                        <button 
                          className="action-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAnimeAction(anime, 'completed', showToast);
                          }}
                          title="Mark as completed"
                        >
                          <Check size={16} />
                        </button>
                        <button 
                          className="action-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAnimeAction(anime, 'watching', showToast);
                          }}
                          title="Add to watching"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </ToastProvider>
  );
};

export default SearchBar;