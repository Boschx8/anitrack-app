import React, { useState } from 'react';
import { Bookmark, Check, Eye, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import ToastProvider from './ToastProvider';

const AnimeCard = ({ anime, onStatusUpdate = () => {}, onDelete = () => {}, isProfileCard = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleAnimeAction = async (status, showToast) => {
    if (!user) {
      showToast('Please login to add animes to your list', 'error');
      return;
    }

    const animeId = anime.mal_id || Date.now().toString();
    
    const animeData = {
      malId: animeId,
      title: anime.title || 'Unknown Title',
      image: anime.image || anime.images?.jpg?.large_image_url || '',
      genre: anime.genre || 'No Genre',
      status
    };

    try {
      const response = await fetch(`http://localhost:5000/api/user-anime/${user.sub}/anime`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(animeData)
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      onStatusUpdate(animeId, status);
      
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
      showToast(message);

    } catch (error) {
      console.error('Error:', error);
      showToast('Failed to update anime status: ' + error.message, 'error');
    }
  };

  const handleDelete = async (showToast) => {
    if (!user) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/user-anime/${user.sub}/anime/${anime.mal_id}`, 
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('Failed to delete anime');
      }

      onDelete(anime.mal_id);
      showToast(`${anime.title} has been removed from your list`);
    } catch (error) {
      console.error('Error deleting anime:', error);
      showToast('Failed to delete anime', 'error');
    }
  };

  const handleCardClick = () => {
    if (anime.title) {
      // Convert title to match anime
      const urlTitle = anime.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') 
        .replace(/^-+|-+$/g, ''); 
      navigate(`/anime/${urlTitle}`);
    }
  };

  return (
    <ToastProvider>
      {({ showToast }) => (
        <div 
          className="anime-card"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleCardClick}
        >
          <img src={anime.image || anime.images?.jpg?.large_image_url} alt={anime.title} />
          
          <div className={`anime-card-overlay ${isHovered ? 'show' : ''}`}>
            <button 
              className="action-button"
              onClick={(e) => {
                e.stopPropagation();
                handleAnimeAction('bookmarked', showToast);
              }}
            >
              <Bookmark size={20} />
            </button>
            
            <button 
              className="action-button"
              onClick={(e) => {
                e.stopPropagation();
                handleAnimeAction('completed', showToast);
              }}
            >
              <Check size={20} />
            </button>
            
            <button 
              className="action-button"
              onClick={(e) => {
                e.stopPropagation();
                handleAnimeAction('watching', showToast);
              }}
            >
              <Eye size={20} />
            </button>

            {isProfileCard && (
              <button 
                className="action-button delete-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(showToast);
                }}
              >
                <X size={20} />
              </button>
            )}
          </div>

          <h4>{anime.title}</h4>
          <p>{anime.genre}</p>
        </div>
      )}
    </ToastProvider>
  );
};

export default AnimeCard;