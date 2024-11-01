import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaUsers, FaTimes } from 'react-icons/fa';
import RightPanelSkeleton from '../skeletons/RightPanelSkeleton';
import LoadingSpinner from '../common/LoadingSpinner';
import UseFollow from '../../hooks/useFollow';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const scrollbarStyles = {
  customScrollbar: {
    scrollbarWidth: 'thin',
    scrollbarColor: '#4B5563 transparent',
  },
  customScrollbarWebkit: {
    '&::-webkit-scrollbar': {
      width: '4px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#4B5563',
      borderRadius: '20px',
    },
    '&::-webkit-scrollbar-thumb:hover': {
      background: '#6B7280',
    },
  },
};

const RightPanel = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [followState, setFollowState] = useState({});

  const { data: currentUser } = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch current user');
      return data;
    },
  });

  const { data: suggestedUsers, isLoading } = useQuery({
    queryKey: ['suggestedUsers'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/users/suggested');
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Something went wrong');
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
  });

  const { follow, isPending } = UseFollow();
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchQuery.trim().length >= 3) {
        setIsSearchLoading(true);
        try {
          const response = await fetch(`/api/users/search?username=${searchQuery}`);
          const data = await response.json();
          
          const filteredResults = currentUser 
            ? data.filter(user => user._id !== currentUser._id)
            : data;
          
          setSearchResults(filteredResults);
          
          const newFollowState = filteredResults.reduce((acc, user) => {
            acc[user._id] = user.isFollowing;
            return acc;
          }, {});
          setFollowState(prev => ({ ...prev, ...newFollowState }));
        } catch (error) {
          console.error('Error fetching search results:', error);
        } finally {
          setIsSearchLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    };

    const debounceTimer = setTimeout(fetchSearchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, currentUser]);

  const handleFollow = async (userId) => {
    setFollowState(prev => ({
      ...prev,
      [userId]: !prev[userId],
    }));

    try {
      await follow(userId);
      await queryClient.invalidateQueries({ queryKey: ['suggestedUsers'] });
      await queryClient.invalidateQueries({ queryKey: ['authUser'] });
    } catch (error) {
      setFollowState(prev => ({
        ...prev,
        [userId]: !prev[userId],
      }));
    }
  };

  const UserCard = ({ user, showFollowButton = true }) => (
    <div className="group hover:bg-gray-800/30 p-3 rounded-lg transition-all duration-200">
      <div className="flex items-center justify-between gap-4">
        <Link 
          to={`/profile/${user.username}`} 
          className="flex items-center gap-3 flex-1"
        >
          <div className="avatar">
            <div className="w-10 h-10 rounded-full ring-2 ring-blue-500/20">
              <img 
                src={user.profileImg || '/avatar-placeholder.png'} 
                alt={`${user.username}'s avatar`}
                className="object-cover"
              />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-white group-hover:text-blue-400 transition-colors">
              {user.username}
            </span>
            {user.fullName && (
              <span className="text-sm text-gray-400">
                {user.fullName}
              </span>
            )}
          </div>
        </Link>
        {showFollowButton && (
          <button
            className={`btn btn-sm px-4 transition-all duration-200 ${
              followState[user._id]
                ? 'btn-outline btn-error hover:btn-error'
                : 'btn-primary'
            }`}
            onClick={(e) => {
              e.preventDefault();
              handleFollow(user._id);
            }}
            disabled={isPending}
          >
            {isPending ? (
              <LoadingSpinner size="sm" />
            ) : followState[user._id] ? (
              'Unfollow'
            ) : (
              'Follow'
            )}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="hidden lg:block w-80 my-4 mx-2">
      <div className="bg-gray-900 rounded-xl shadow-xl sticky top-2">
        <div className="p-4 border-b border-gray-800">
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="input input-bordered w-full bg-gray-800/50 pl-10 pr-8 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="absolute inset-y-0 right-3 flex items-center"
                onClick={() => setSearchQuery('')}
              >
                <FaTimes className="h-4 w-4 text-gray-400 hover:text-white transition-colors" />
              </button>
            )}
          </div>

          {isSearchLoading ? (
            <div className="flex justify-center my-4">
              <LoadingSpinner size="md" />
            </div>
          ) : searchResults.length > 0 && (
            <div 
              className="mt-4 space-y-2 max-h-64 overflow-y-auto"
              style={{
                ...scrollbarStyles.customScrollbar,
                ...scrollbarStyles.customScrollbarWebkit
              }}
            >
              {searchResults.map((user) => (
                <UserCard key={user._id} user={user} />
              ))}
            </div>
          )}
        </div>

        {(suggestedUsers?.length > 0 || isLoading) && (
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <FaUsers className="h-5 w-5 text-blue-400" />
              <h2 className="font-semibold text-lg text-white">Suggested Users</h2>
            </div>
            
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <RightPanelSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {suggestedUsers?.map((user) => (
                  <UserCard key={user._id} user={user} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RightPanel;