import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Edit } from 'lucide-react';
import AnimeCard from '../components/AnimeCard';

const ProfilePage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('watching');
  const [userAnimes, setUserAnimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserAnimes = async () => {
    if (!user) return;

    try {
      const response = await fetch(`http://localhost:5000/api/user-anime/${user.sub}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error('Failed to fetch user animes');
      }

      setUserAnimes(data.animes || []);
    } catch (error) {
      console.error('Error fetching user animes:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserAnimes();
  }, [user]);

  // Manejador para actualizar el estado localmente
  const handleStatusUpdate = (animeId, newStatus) => {
    setUserAnimes(prevAnimes => {
      return prevAnimes.map(anime => {
        if (anime.malId === animeId) {
          return { ...anime, status: newStatus };
        }
        return anime;
      });
    });
  };

  const filteredAnimes = userAnimes.filter(anime => anime.status === activeTab);

  return (
    <div className="profile-page">
      <div className="profile-banner">
        <div className="profile-info">
          <img 
            src={user?.picture || '/default-avatar.png'} 
            alt={user?.name} 
            className="profile-avatar"
          />
          <div className="profile-name">
            <h1>{user?.name}</h1>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <button 
          className={`tab ${activeTab === 'watching' ? 'active' : ''}`}
          onClick={() => setActiveTab('watching')}
        >
          Watching
        </button>
        <button 
          className={`tab ${activeTab === 'bookmarked' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookmarked')}
        >
          Bookmarked
        </button>
        <button 
          className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed
        </button>
      </div>

      <div className="profile-anime-grid">
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>Error: {error}</div>
        ) : filteredAnimes.length > 0 ? (
          filteredAnimes.map((anime) => (
            <AnimeCard
              key={anime.malId}
              anime={{
                title: anime.title,
                image: anime.image,
                genre: anime.genre,
                mal_id: anime.malId
              }}
              onStatusUpdate={handleStatusUpdate}
              onDelete={(animeId) => {
                setUserAnimes(prevAnimes => 
                  prevAnimes.filter(anime => anime.malId !== animeId)
                );
              }}
              isProfileCard={true}
            />
          ))
        ) : (
          <div>No animes in this category</div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;