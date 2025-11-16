import React, { useState, useEffect, useMemo } from 'react';
import { UserIcon, SparklesIcon } from '@heroicons/react/24/outline';
import axiosInstance from '../../../../utils/axiosConfig';
import { toast } from 'react-toastify';

// Avatar component
const AvatarImg = ({ avatarPath }) => {
  const getAvatarUrl = (path) =>
    path && typeof path === 'string' && path.trim() !== '' && path.trim().toLowerCase() !== 'avatar' && path.trim().toLowerCase() !== 'avatars/'
      ? `http://localhost:8000/storage/${path}`
      : null;

  const avatarUrl = getAvatarUrl(avatarPath);

  return (
    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="Avatar"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center" style={{ display: avatarUrl ? 'none' : 'flex' }}>
        <UserIcon className="w-5 h-5 text-gray-500" />
      </div>
    </div>
  );
};

// Badge component
const Badge = ({ text, color, icon }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
    {icon && <span className="text-xs">{icon}</span>}
    {text}
  </span>
);

// Utility functions
const getCivilStatusColor = (status) => {
  const colors = {
    'Single': 'bg-blue-100 text-blue-800',
    'Married': 'bg-green-100 text-green-800',
    'Widowed': 'bg-gray-100 text-gray-800',
    'Divorced': 'bg-red-100 text-red-800',
    'Separated': 'bg-yellow-100 text-yellow-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getGenderColor = (gender) => {
  const colors = {
    'Male': 'bg-blue-100 text-blue-800',
    'Female': 'bg-pink-100 text-pink-800'
  };
  return colors[gender] || 'bg-gray-100 text-gray-800';
};

const getVoterStatusColor = (status) => {
  const colors = {
    'Yes': 'bg-green-100 text-green-800',
    'No': 'bg-red-100 text-red-800',
    'Registered': 'bg-blue-100 text-blue-800',
    'Not Registered': 'bg-gray-100 text-gray-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getCivilStatusIcon = (status) => {
  const icons = {
    'Single': '👤',
    'Married': '💑',
    'Widowed': '🕊️',
    'Divorced': '💔',
    'Separated': '⚡'
  };
  return icons[status] || '👤';
};

const getGenderIcon = (gender) => {
  const icons = {
    'Male': '👨',
    'Female': '👩'
  };
  return icons[gender] || '👤';
};

const getVoterStatusIcon = (status) => {
  const icons = {
    'Yes': '✅',
    'No': '❌',
    'Registered': '📝',
    'Not Registered': '📋'
  };
  return icons[status] || '❓';
};

const formatResidentName = (resident) => {
  const parts = [resident.first_name, resident.middle_name, resident.last_name, resident.suffix]
    .filter(part => part && part.trim() !== '');
  return parts.join(' ');
};

const DisabledResidentsTable = ({ showRecentlyDeleted, onRefresh }) => {
  const [recentlyDeletedResidents, setRecentlyDeletedResidents] = useState([]);
  const [recentlyDeletedLoading, setRecentlyDeletedLoading] = useState(false);
  const [deletedCurrentPage, setDeletedCurrentPage] = useState(1);
  const [deletedItemsPerPage, setDeletedItemsPerPage] = useState(10);

  const fetchRecentlyDeletedResidents = async () => {
    setRecentlyDeletedLoading(true);
    try {
      const response = await axiosInstance.get('/api/admin/residents-deleted');
      setRecentlyDeletedResidents(response.data.residents || []);
    } catch (error) {
      console.error('Error fetching recently deleted residents:', error);
      toast.error('Failed to fetch recently deleted residents');
    } finally {
      setRecentlyDeletedLoading(false);
    }
  };

  const handleRestore = async (residentId) => {
    try {
      await axiosInstance.post(`/api/residents/${residentId}/restore`);
      toast.success('Resident restored successfully');
      fetchRecentlyDeletedResidents();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error restoring resident:', error);
      toast.error('Failed to restore resident');
    }
  };

  const handleDeletedPageChange = (page) => {
    setDeletedCurrentPage(page);
  };

  const handleDeletedItemsPerPageChange = (items) => {
    setDeletedItemsPerPage(items);
    setDeletedCurrentPage(1);
  };

  const getPaginatedDeletedResidents = () => {
    const startIndex = (deletedCurrentPage - 1) * deletedItemsPerPage;
    const endIndex = startIndex + deletedItemsPerPage;
    return recentlyDeletedResidents.slice(startIndex, endIndex);
  };

  const deletedTotalPages = useMemo(() => {
    const total = Math.ceil(recentlyDeletedResidents.length / deletedItemsPerPage);
    
    if (deletedCurrentPage > total && total > 0) {
      setDeletedCurrentPage(total);
    }
    
    return total;
  }, [recentlyDeletedResidents, deletedItemsPerPage, deletedCurrentPage]);

  useEffect(() => {
    if (showRecentlyDeleted) {
      fetchRecentlyDeletedResidents();
    }
  }, [showRecentlyDeleted]);

  if (!showRecentlyDeleted) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mt-8 transition-all duration-300 hover:shadow-2xl">
      <div className="bg-gradient-to-r from-red-600 to-orange-600 px-6 py-4">
        <h3 className="text-white font-semibold text-lg flex items-center gap-2">
          <UserIcon className="w-5 h-5" />
          Recently Disabled Residents
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">Profile</th>
              <th className="px-4 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">Resident ID</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">Name</th>
              <th className="px-4 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">Age</th>
              <th className="px-4 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">Nationality</th>
              <th className="px-4 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">Status</th>
              <th className="px-4 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">Gender</th>
              <th className="px-4 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">Voter</th>
              <th className="px-4 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">Voter's ID</th>
              <th className="px-4 py-4 text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-100">
            {recentlyDeletedLoading ? (
              <tr>
                <td colSpan="10" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium">Loading recently disabled residents...</p>
                  </div>
                </td>
              </tr>
            ) : recentlyDeletedResidents.length === 0 ? (
              <tr>
                <td colSpan="10" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <UserIcon className="w-12 h-12 text-gray-300" />
                    <p className="text-gray-500 font-medium">No recently disabled residents found</p>
                  </div>
                </td>
              </tr>
            ) : (
              getPaginatedDeletedResidents().map((r, index) => (
                <tr key={`deleted-${r.id}-${index}`} className="hover:bg-red-50 transition-all duration-200 border-b border-gray-100 hover:border-red-200">
                  <td className="px-6 py-4"><AvatarImg avatarPath={r.avatar} /></td>
                  <td className="px-4 py-4">
                    <span className="font-mono text-red-600 bg-red-50 px-2 py-1 rounded text-xs">
                      {r.residents_id}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">
                      {formatResidentName(r)}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                      {r.age} years
                    </span>
                  </td>
                  <td className="px-4 py-4 text-gray-700">{r.nationality || "N/A"}</td>
                  <td className="px-4 py-4">
                    <Badge text={r.civil_status} color={getCivilStatusColor(r.civil_status)} icon={getCivilStatusIcon(r.civil_status)} />
                  </td>
                  <td className="px-4 py-4">
                    <Badge text={r.sex} color={getGenderColor(r.sex)} icon={getGenderIcon(r.sex)} />
                  </td>
                  <td className="px-4 py-4">
                    <Badge text={r.voter_status} color={getVoterStatusColor(r.voter_status)} icon={getVoterStatusIcon(r.voter_status)} />
                  </td>
                  <td className="px-4 py-4 text-gray-700">{r.voters_id_number || "N/A"}</td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => handleRestore(r.id)}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md flex items-center gap-2 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                    >
                      <SparklesIcon className="w-4 h-4" />
                      Restore
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination for Deleted Records */}
      {deletedTotalPages > 1 && (
        <div className="flex justify-center mt-8 px-6 pb-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between gap-4">
              {/* Page Info */}
              <div className="text-sm text-gray-600">
                Page {deletedCurrentPage} of {deletedTotalPages}
              </div>
              
              {/* Pagination Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeletedPageChange(Math.max(1, deletedCurrentPage - 1))}
                  disabled={deletedCurrentPage <= 1}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, deletedTotalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(deletedTotalPages - 4, deletedCurrentPage - 2)) + i;
                    if (pageNum > deletedTotalPages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handleDeletedPageChange(pageNum)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                          deletedCurrentPage === pageNum
                            ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handleDeletedPageChange(Math.min(deletedTotalPages, deletedCurrentPage + 1))}
                  disabled={deletedCurrentPage >= deletedTotalPages}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 flex items-center gap-2"
                >
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisabledResidentsTable;
