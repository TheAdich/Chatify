import React, { useState } from 'react';
import { Users, ArrowLeft, Plus, Check, AlertCircle } from 'lucide-react';
import AddUser from '../components/Chatify/Adduser';
import axios from 'axios';
import '../staticCss/groupInfo.css'
import { NavLink } from 'react-router-dom';

const GroupInfo = () => {
  const [members, setMembers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [showAddUser, setShowAddUser] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setAlert] = useState(null);
  const [msg, setMsg] = useState("");

  const token = sessionStorage.getItem('jwt');

  const handleSubmit = async () => {
    if (!groupName.trim()) {
      setAlert(false);
      setMsg('Please enter a group name');
      setTimeout(() => setAlert(null), 4000);
      return;
    }
    
    if (members.length === 0) {
      setAlert(false);
      setMsg('Please add at least one member to the group');
      setTimeout(() => setAlert(null), 4000);
      return;
    }

    setIsLoading(true);
    
    const ids = members.map((u) => u._id);
    const grpdata = {
      chatName: groupName,
      users: ids,
    }

    const instance = axios.create({
      baseURL: `${process.env.REACT_APP_BACKEND}/api/chat`,
      withCredentials: true,
      headers: {
        "Content-Type": 'application/json',
        'Accept': 'application/json',
        'Authorization': `${token}`
      }
    });

    try {
      const data = await instance.post('/creategroup', grpdata);
      console.log(data);
      setAlert(true);
      setMsg('Group has been created successfully');
      setTimeout(() => {
        window.location.href = '/chat';
      }, 1000);
    } catch (err) {
      console.log(err);
      setAlert(false);
      setMsg(err.response.data);
      if (err.response.status === 301) {
        window.location.href = '/';
      }
    } finally {
      setIsLoading(false);
    }
  };

  const removeMember = (userId) => {
    setMembers(prev => prev.filter(member => member._id !== userId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 md:p-6">
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

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <NavLink 
            to='/chat'
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </NavLink>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Create New Group</h1>
            <p className="text-gray-400">Add members and set up your group chat</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Add Users Section */}
          <div className="relative">
            <div className="bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 p-8 h-fit">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-blue-500/20">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Add Members</h2>
                    <p className="text-gray-400 text-sm">Search and select users to invite</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddUser(!showAddUser)}
                  className={`p-3 rounded-2xl transition-all duration-300 ${
                    showAddUser 
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                      : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                  }`}
                >
                  <Plus className={`w-5 h-5 transition-transform duration-300 ${showAddUser ? 'rotate-45' : ''}`} />
                </button>
              </div>

              {showAddUser && (
                <div className="mb-6">
                  <AddUser members={members} setMembers={setMembers} />
                </div>
              )}

              {/* Selected Members */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-white mb-4">
                  Selected Members ({members.length})
                </h3>
                {members.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No members added yet</p>
                    <p className="text-gray-500 text-sm">Click the + button to start adding members</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                    {members.map((member) => (
                      <div
                        key={member._id}
                        className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-medium">{member.name}</p>
                            {member.email && (
                              <p className="text-gray-400 text-sm">{member.email}</p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => removeMember(member._id)}
                          className="p-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-300 hover:scale-110"
                        >
                          <Plus className="w-4 h-4 rotate-45" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Group Details Section */}
          <div>
            <div className="bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-purple-500/20">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Group Details</h2>
                  <p className="text-gray-400 text-sm">Configure your group settings</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label htmlFor="groupName" className="block text-white font-medium mb-3">
                    Group Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="groupName"
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Enter group name"
                    className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                    maxLength={50}
                  />
                  <p className="text-gray-500 text-sm mt-2">{groupName.length}/50 characters</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-gray-300">Group Privacy</span>
                    <span className="text-white font-medium">Private</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-gray-300">Message History</span>
                    <span className="text-white font-medium">Visible to all members</span>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading || !groupName.trim() || members.length === 0}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium py-4 px-6 rounded-2xl transition-all duration-300 hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Creating Group...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        Create Group
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => window.location.href = '/chat'}
                    className="px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all duration-300 hover:scale-105"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupInfo;