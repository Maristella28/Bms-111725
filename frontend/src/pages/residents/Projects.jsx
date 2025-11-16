import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbares from '../../components/Navbares';
import Sidebares from '../../components/Sidebares';
import axios from '../../utils/axiosConfig';
import { useAuth } from '../../contexts/AuthContext';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import {
  HandThumbUpIcon,
  HandThumbDownIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  CalendarIcon,
  DocumentTextIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
  TrophyIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/solid";

const reactionTypes = [
  { type: 'like', icon: HandThumbUpIcon, label: 'Like', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { type: 'dislike', icon: HandThumbDownIcon, label: 'Dislike', color: 'text-red-600', bgColor: 'bg-red-100' },
];

const Project = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { mainClasses } = useResponsiveLayout();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reactionCounts, setReactionCounts] = useState({});
  const [feedbacks, setFeedbacks] = useState({}); // { [projectId]: [feedback, ...] }
  const [commentInput, setCommentInput] = useState({}); // { [projectId]: 'text' }
  const [selectedProject, setSelectedProject] = useState(null);
  const [userReactions, setUserReactions] = useState({}); // { [projectId]: 'reactionType' }
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [modalProjectId, setModalProjectId] = useState(null);
  const [modalCommentInput, setModalCommentInput] = useState('');

  // Fetch all projects
  useEffect(() => {
    fetchProjects();
  }, []);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showCommentsModal) {
        handleCloseCommentsModal();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showCommentsModal]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/projects');
      setProjects(response.data);
    } catch (err) {
      setError('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  // Fetch reactions and feedbacks for each project
  useEffect(() => {
    if (projects.length > 0) {
      projects.forEach(project => {
        fetchReactionCounts(project.id);
        fetchFeedbacks(project.id);
        fetchUserReactions(project.id);
      });
    }
  }, [projects]);

  const fetchReactionCounts = async (projectId) => {
    try {
      const res = await axios.get(`/projects/${projectId}/reactions`);
      setReactionCounts(prev => ({ ...prev, [projectId]: res.data }));
    } catch {}
  };

  const fetchFeedbacks = async (projectId) => {
    try {
      // You need an endpoint to get feedbacks for a project, e.g. `/projects/{id}/feedbacks`
      const res = await axios.get(`/feedbacks?project_id=${projectId}`);
      setFeedbacks(prev => ({ ...prev, [projectId]: res.data }));
    } catch {}
  };

  const fetchUserReactions = async (projectId) => {
    try {
      const res = await axios.get(`/projects/${projectId}/user-reaction`);
      if (res.data && res.data.reaction_type) {
        setUserReactions(prev => ({ ...prev, [projectId]: res.data.reaction_type }));
      }
    } catch {}
  };

  const handleReact = async (projectId, reactionType) => {
    if (!user) {
      alert('You must be logged in to react.');
      navigate('/login');
      return;
    }
    try {
      // If user clicks the same reaction type, remove the reaction
      const currentReaction = userReactions[projectId];
      if (currentReaction === reactionType) {
        await axios.delete(`/projects/${projectId}/react`);
        setUserReactions(prev => ({ ...prev, [projectId]: null }));
      } else {
        await axios.post(`/projects/${projectId}/react`, { reaction_type: reactionType });
        setUserReactions(prev => ({ ...prev, [projectId]: reactionType }));
      }
      fetchReactionCounts(projectId);
    } catch (err) {
      alert('You must be logged in to react.');
    }
  };


  const handleAddFeedback = async (e, projectId) => {
    e.preventDefault();
    const message = commentInput[projectId];
    if (!message || !message.trim()) return;
    try {
      await axios.post('/feedbacks', {
        message,
        subject: 'Comment',
        category: 'Project',
        project_id: projectId,
      });
      setCommentInput(prev => ({ ...prev, [projectId]: '' }));
      fetchFeedbacks(projectId);
    } catch (err) {
      alert('You must be logged in to comment.');
    }
  };

  const handleViewAllComments = (projectId) => {
    setModalProjectId(projectId);
    setShowCommentsModal(true);
    setModalCommentInput('');
  };

  const handleCloseCommentsModal = () => {
    setShowCommentsModal(false);
    setModalProjectId(null);
    setModalCommentInput('');
  };

  const handleAddModalComment = async (e) => {
    e.preventDefault();
    if (!modalCommentInput.trim() || !modalProjectId) return;
    try {
      await axios.post('/feedbacks', {
        message: modalCommentInput,
        subject: 'Comment',
        category: 'Project',
        project_id: modalProjectId,
      });
      setModalCommentInput('');
      fetchFeedbacks(modalProjectId);
    } catch (err) {
      alert('You must be logged in to comment.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <TrophyIcon className="w-4 h-4" />;
      case 'In Progress':
        return <RocketLaunchIcon className="w-4 h-4" />;
      case 'Planned':
        return <ClockIcon className="w-4 h-4" />;
      default:
        return <DocumentTextIcon className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'from-green-500 to-emerald-500';
      case 'In Progress':
        return 'from-yellow-500 to-orange-500';
      case 'Planned':
        return 'from-blue-500 to-indigo-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <>
      <Navbares />
      <Sidebares />
      <main className={mainClasses}>
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-green-200 to-teal-200 rounded-full opacity-15 animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-pink-200 to-rose-200 rounded-full opacity-10 animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>
        
        <div className="w-full max-w-[98%] mx-auto space-y-10 relative z-10 px-2 lg:px-4">
          
          {/* Enhanced Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-xl mb-4">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
            </div>
            <div className="flex items-center justify-center gap-4">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent tracking-tight">
                Community Projects
              </h1>
              <button
                onClick={() => window.location.reload()}
                className="p-2 bg-green-100 hover:bg-green-200 rounded-full transition-colors duration-200"
                title="Refresh Projects"
              >
                <svg 
                  className="w-5 h-5 text-green-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Discover and engage with ongoing barangay development initiatives and community projects
            </p>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Total Projects</p>
                  <p className="text-3xl font-bold text-gray-900">{projects.length}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                  <DocumentTextIcon className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">In Progress</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {projects.filter(p => p.status === 'In Progress').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                  <RocketLaunchIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Completed</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {projects.filter(p => p.status === 'Completed').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center">
                  <TrophyIcon className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Projects Feed */}
          <div className="space-y-8">
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg font-medium">Loading community projects...</p>
                <p className="text-gray-400 mt-1">Please wait while we fetch the latest updates</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-lg">
                <div className="flex items-center">
                  <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DocumentTextIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg font-medium mb-2">No projects available</p>
                <p className="text-gray-400">Check back later for new community initiatives</p>
              </div>
            ) : (
              projects.map((project, index) => (
                <div
                  key={project.id}
                  className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                >
                  {/* Project Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {project.name}
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <UserGroupIcon className="w-4 h-4 text-gray-400" />
                          <span>{project.owner}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-gray-400" />
                          <span>{formatDate(project.deadline)}</span>
                        </div>
                      </div>
                    </div>
                    {/* Status Badge */}
                    <div className={`px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r ${getStatusColor(project.status)} text-white flex items-center gap-2`}>
                      {getStatusIcon(project.status)}
                      {project.status}
                    </div>
                  </div>

                  {/* Project Photo */}
                  {project.photo && (
                    <div className="flex justify-center mb-6">
                      <img
                        src={`http://localhost:8000/${project.photo}`}
                        alt={project.name}
                        className="rounded-xl w-full max-w-2xl max-h-64 object-cover shadow-lg border border-gray-200"
                        style={{ aspectRatio: '16/9' }}
                      />
                    </div>
                  )}

                  {/* Interaction Buttons */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      {/* Like Button */}
                      <button
                        onClick={() => handleReact(project.id, 'like')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                          userReactions[project.id] === 'like'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-600'
                        }`}
                      >
                        <HandThumbUpIcon className="w-4 h-4" />
                        <span>Like</span>
                        {reactionCounts[project.id]?.like > 0 && (
                          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full ml-1">
                            {reactionCounts[project.id].like}
                          </span>
                        )}
                      </button>

                      {/* Dislike Button */}
                      <button
                        onClick={() => handleReact(project.id, 'dislike')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                          userReactions[project.id] === 'dislike'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-gray-100 hover:bg-red-100 text-gray-700 hover:text-red-600'
                        }`}
                      >
                        <HandThumbDownIcon className="w-4 h-4" />
                        <span>Dislike</span>
                        {reactionCounts[project.id]?.dislike > 0 && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full ml-1">
                            {reactionCounts[project.id].dislike}
                          </span>
                        )}
                      </button>
                    </div>

                    {/* Comments Count */}
                    <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                      <ChatBubbleLeftRightIcon className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700 font-medium">{feedbacks[project.id]?.length || 0} Comments</span>
                    </div>
                  </div>

                  {/* Comments Section */}
                  <div className="space-y-4 mb-6 bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-gray-800">Community Comments</span>
                      <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                        {(feedbacks[project.id]?.length || 0)} total
                      </span>
                    </div>
                    {(feedbacks[project.id] || []).length === 0 ? (
                      <div className="text-center py-6">
                        <ChatBubbleLeftRightIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-gray-400">No comments yet. Be the first to share your thoughts!</p>
                      </div>
                    ) : (
                      (feedbacks[project.id] || []).slice(0, 3).map((fb, idx, arr) => (
                        <div key={fb.id} className="bg-white rounded-lg p-4 border border-gray-100">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center font-semibold text-gray-600 text-sm">
                              {fb.user?.name?.[0] || "R"}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-semibold text-gray-900 mb-1">{fb.user?.name || "Resident"}</div>
                              <div className="text-gray-700 text-sm mb-2">{fb.message}</div>
                              <div className="text-xs text-gray-400 flex items-center gap-1">
                                <CalendarIcon className="w-3 h-3" />
                                {new Date(fb.created_at).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    {(feedbacks[project.id]?.length || 0) > 3 && (
                      <button
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mt-3 mx-auto px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-all duration-200"
                        onClick={() => handleViewAllComments(project.id)}
                      >
                        <ChatBubbleLeftRightIcon className="w-4 h-4" />
                        View all comments
                      </button>
                    )}
                  </div>

                  {/* Add Comment Box */}
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <label htmlFor={`comment-input-${project.id}`} className="block text-sm font-semibold text-gray-700 mb-3">Share Your Thoughts</label>
                    <form onSubmit={e => handleAddFeedback(e, project.id)} className="space-y-3">
                      <textarea
                        id={`comment-input-${project.id}`}
                        value={commentInput[project.id] || ''}
                        onChange={e => setCommentInput({ ...commentInput, [project.id]: e.target.value })}
                        placeholder="Write your comment about this project..."
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                        required
                      />
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                        >
                          <ChatBubbleLeftRightIcon className="w-4 h-4" />
                          Post Comment
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Comments Modal */}
      {showCommentsModal && modalProjectId && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
          onClick={handleCloseCommentsModal}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <ChatBubbleLeftRightIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Project Comments</h2>
                    <p className="text-green-100 text-sm">
                      {projects.find(p => p.id === modalProjectId)?.name || 'Project'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseCommentsModal}
                  className="text-white hover:text-green-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-300 rounded-full p-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Comments List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {(feedbacks[modalProjectId] || []).length === 0 ? (
                  <div className="text-center py-12">
                    <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 text-lg font-semibold mb-2">No comments yet</p>
                    <p className="text-gray-400">Be the first to share your thoughts about this project!</p>
                  </div>
                ) : (
                  (feedbacks[modalProjectId] || []).map((fb) => (
                    <div key={fb.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center font-semibold text-gray-600 text-sm">
                          {fb.user?.name?.[0] || "R"}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-semibold text-gray-900">{fb.user?.name || "Resident"}</div>
                            <div className="text-xs text-gray-400 flex items-center gap-1">
                              <CalendarIcon className="w-3 h-3" />
                              {new Date(fb.created_at).toLocaleString()}
                            </div>
                          </div>
                          <div className="text-gray-700 text-sm">{fb.message}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Section */}
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <form onSubmit={handleAddModalComment} className="space-y-3">
                  <label htmlFor="modal-comment-input" className="block text-sm font-semibold text-gray-700">
                    Add Your Comment
                  </label>
                  <textarea
                    id="modal-comment-input"
                    value={modalCommentInput}
                    onChange={(e) => setModalCommentInput(e.target.value)}
                    placeholder="Share your thoughts about this project..."
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                    required
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleCloseCommentsModal}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                    >
                      <ChatBubbleLeftRightIcon className="w-4 h-4" />
                      Post Comment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Project;
