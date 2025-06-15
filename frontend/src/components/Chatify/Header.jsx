import React from 'react';
import { Video, Users, CreditCard, User, LogOut, MessageCircle } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const Header = ({ user, setProfilePageopen }) => {
  return (
    <div className="bg-white/5 backdrop-blur-lg border-b border-white/10 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo and App Name */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <MessageCircle className="w-7 h-7 text-white" />
          </div>
          <div className="text-2xl font-bold text-white">Chatify</div>
        </div>

        {/* Navigation Toolbar */}
        <div className="flex items-center gap-4">
          {/* Navigation Links */}
          {/* <NavLink 
            to='/videochat'
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all duration-300 hover:scale-105 text-sm font-medium"
          >
            <Video className="w-4 h-4" />
            <span className="hidden md:inline">Video Call</span>
          </NavLink> */}

          <NavLink 
            to='/creategroup'
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all duration-300 hover:scale-105 text-sm font-medium"
          >
            <Users className="w-4 h-4" />
            <span className="hidden md:inline">Create Group</span>
          </NavLink>

          {/* <NavLink 
            to='/payment'
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/20 hover:bg-green-500/30 border border-green-500/20 text-green-400 transition-all duration-300 hover:scale-105 text-sm font-medium"
          >
            <CreditCard className="w-4 h-4" />
            <span className="hidden md:inline">UPI Transaction</span>
          </NavLink> */}

          {/* User Profile Section */}
          <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/10">
            {/* Profile Image */}
            <button
              onClick={() => setProfilePageopen((prev) => !prev)}
              className="relative group"
            >
              {user?.pic ? (
                <img 
                  src={user.pic} 
                  alt="Profile"
                  className="w-10 h-10 rounded-full border-2 border-white/20 group-hover:border-white/40 transition-all duration-300"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center border-2 border-white/20 group-hover:border-white/40 transition-all duration-300">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </button>

            {/* Username */}
            <button
              onClick={() => setProfilePageopen((prev) => !prev)}
              className="text-white font-medium hover:text-blue-300 transition-colors duration-300 hidden sm:block"
            >
              {user?.name || 'User'}
            </button>

            {/* Logout Button */}
            <button
              onClick={() => {
                sessionStorage.removeItem('jwt');
                window.location.href = '/';
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/20 text-red-400 transition-all duration-300 hover:scale-105"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden lg:inline text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;