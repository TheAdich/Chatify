import React, { useState, useEffect } from 'react';
import { Search, MessageCircle, User, Check, AlertCircle, X } from 'lucide-react';
import axios from 'axios';

const Searchuser = ({ searchBoxstyle, user }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const authorisedUser = user;
  const token = sessionStorage.getItem('jwt');
  const [showAlert, setAlert] = useState(null);
  const [msg, setMsg] = useState("");
  const [isCreatingChat, setIsCreatingChat] = useState(null);

  const createChatWithUser = async (userId) => {
    setIsCreatingChat(userId);
    const instance = axios.create({
      baseURL: `${process.env.REACT_APP_BACKEND}/api/chat`,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `${token}`
      }
    });

    try {
      const res = await instance.post('/createChat', { userId });
      console.log(res.data);
      setAlert(true);
      setMsg("Chat Created Successfully");
      setTimeout(() => {
        window.location.href = '/chat';
      }, 1000);
    } catch (err) {
      console.log(err);
      setAlert(false);
      setMsg('Internal error occurred!');
      setTimeout(() => setAlert(null), 4000);
    } finally {
      setIsCreatingChat(null);
    }
  };

  useEffect(() => {
    if (query.length > 0) {
      const fetchData = async () => {
        try {
          const response = await axios.get(`${process.env.REACT_APP_BACKEND}/api/user/find?q=${query}`);
          setResults(response.data);
        } catch (err) { 
          console.log(err); 
        }
      };
      fetchData();
    } else {
      setResults([]);
    }
  }, [query]);

  const filteredResults = results.filter(searchUser => searchUser.name !== authorisedUser?.name);

  return (
    <React.Fragment>
      {/* Toast Notification */}
      {showAlert !== null && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl backdrop-blur-lg border transition-all duration-500 transform ${
          showAlert 
            ? 'bg-green-500/10 border-green-500/20 text-green-100' 
            : 'bg-red-500/10 border-red-500/20 text-red-100'
        }`}>
          <div className="flex items-center gap-3">
            {showAlert ? (
              <Check className="w-5 h-5 text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400" />
            )}
            <span className="font-medium">{msg}</span>
          </div>
        </div>
      )}

      <div 
        className="bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 p-6 min-w-96 max-w-md"
        style={searchBoxstyle}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-blue-500/20">
            <Search className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Find Users</h2>
            <p className="text-gray-400 text-sm">Search for users to start chatting</p>
          </div>
        </div>

        {/* Search Input */}
        <form onSubmit={(e) => e.preventDefault()} className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Type username of user"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-colors duration-300"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </form>

        {/* Results Section */}
        <div className="space-y-3">
          {query.length === 0 ? (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">Start typing to search users</p>
              <p className="text-gray-500 text-sm">Enter a username to find people to chat with</p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No users found</p>
              <p className="text-gray-500 text-sm">Try searching with a different username</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
              <h3 className="text-sm font-medium text-gray-300 mb-3">
                Found {filteredResults.length} user{filteredResults.length !== 1 ? 's' : ''}
              </h3>
              {filteredResults.map((searchUser) => (
                <div
                  key={searchUser._id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3">
                    {searchUser.pic ? (
                      <img 
                        src={searchUser.pic} 
                        alt={searchUser.name}
                        className="w-10 h-10 rounded-full border border-white/20"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium">
                        {searchUser.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-white font-medium">{searchUser.name}</p>
                      {searchUser.email && (
                        <p className="text-gray-400 text-sm">{searchUser.email}</p>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => createChatWithUser(searchUser._id)}
                    disabled={isCreatingChat === searchUser._id}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 disabled:bg-gray-500/20 text-blue-400 disabled:text-gray-400 transition-all duration-300 hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    {isCreatingChat === searchUser._id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin"></div>
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-4 h-4" />
                        <span>Chat</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </React.Fragment>
  );
};

export default Searchuser;