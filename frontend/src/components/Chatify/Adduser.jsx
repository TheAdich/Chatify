import React, { useState, useEffect } from 'react';
import { Search, UserPlus, UserMinus, Users } from 'lucide-react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const AddUser = ({ members, setMembers }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addedUsers, setAddedUsers] = useState([]);
  
  const authorisedUser = useSelector((state) => state.user);
  const token = localStorage.getItem('jwt');

  useEffect(() => {
    const searchUsers = async () => {
      if (query.length > 0) {
        setIsLoading(true);
        try {
          const response = await axios.get(`${process.env.REACT_APP_BACKEND}/api/user/find?q=${query}`);
          setResults(response.data);
        } catch (err) {
          console.log(err);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    members && setAddedUsers(members.map(u => u._id));
  }, [members]);

  const handleAddUser = (user) => {
    setMembers((prev) => {
      const userExists = prev.some(u => user._id === u._id);
      
      if (userExists) {
        return prev.filter(u => user._id !== u._id);
      }
      return [...prev, user];
    });

    setAddedUsers((prev) => {
      if (prev.includes(user._id)) {
        return prev.filter(u => u !== user._id);
      } else {
        return [...prev, user._id];
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Search Results */}
      <div className="space-y-2">
        {query.length > 0 && (
          <p className="text-gray-400 text-sm px-2">
            {isLoading ? 'Searching...' : `${results.length} users found`}
          </p>
        )}
        
        {results.length > 0 && (
          <div className="max-h-80 overflow-y-auto custom-scrollbar space-y-2">
            {results
              .filter(user => user.name !== authorisedUser.name)
              .map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium text-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium">{user.name}</p>
                      {user.email && (
                        <p className="text-gray-400 text-sm">{user.email}</p>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleAddUser(user)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
                      addedUsers.includes(user._id)
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    }`}
                  >
                    {addedUsers.includes(user._id) ? (
                      <>
                        <UserMinus className="w-4 h-4" />
                        Remove
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Add
                      </>
                    )}
                  </button>
                </div>
              ))}
          </div>
        )}

        {query.length > 0 && results.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No users found</p>
            <p className="text-gray-500 text-sm">Try searching with a different term</p>
          </div>
        )}

        {query.length === 0 && (
          <div className="text-center py-8">
            <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Start typing to search for users</p>
            <p className="text-gray-500 text-sm">You can search by name or email address</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddUser;