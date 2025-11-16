import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const SocialModals = ({ 
  showModal, 
  addBeneficiaryMode, 
  handleModalClose, 
  beneficiaryFormData, 
  handleInputChange, 
  handleSubmit, 
  programs, 
  showGlossary, 
  setShowGlossary, 
  showProgramModal, 
  setShowProgramModal, 
  programFormData, 
  handleProgramInputChange, 
  handleProgramSubmit, 
  handleEditProgramClick, 
  editingProgram 
}) => {
  return (
    <>
      {/* Beneficiary Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-2xl max-h-[95vh] overflow-y-auto relative">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-3xl p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  {addBeneficiaryMode ? '+ Add Beneficiary' : 'Edit Beneficiary'}
                </h2>
                <button
                  onClick={handleModalClose}
                  className="text-white hover:text-red-200 transition-colors duration-200 p-2 hover:bg-white/10 rounded-full"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={beneficiaryFormData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={beneficiaryFormData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={beneficiaryFormData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                    placeholder="Enter email"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={beneficiaryFormData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  name="address"
                  value={beneficiaryFormData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                  placeholder="Enter address"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">Program</label>
                  <select
                    name="programId"
                    value={beneficiaryFormData.programId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                  >
                    <option value="">Select a program</option>
                    {programs.map(program => (
                      <option key={program.id} value={program.id}>{program.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={beneficiaryFormData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 text-base"
                >
                  {addBeneficiaryMode ? 'Add Beneficiary' : 'Update Beneficiary'}
                </button>
                <button
                  onClick={handleModalClose}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 text-base"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Glossary Modal */}
      {showGlossary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-3xl p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Help & Glossary</h2>
                <button
                  onClick={() => setShowGlossary(false)}
                  className="text-white hover:text-red-200 transition-colors duration-200 p-2 hover:bg-white/10 rounded-full"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-800 border-b-2 border-blue-200 pb-2">Key Terms</h3>
                  <div className="space-y-3">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-800 text-base">Beneficiary</h4>
                      <p className="text-gray-600 text-sm">A person or family receiving assistance from a government program.</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800 text-base">Program Status</h4>
                      <p className="text-gray-600 text-sm">Current state of a program: Active, Draft, or Completed.</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-800 text-base">Health Score</h4>
                      <p className="text-gray-600 text-sm">Overall performance rating based on multiple metrics.</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-800 border-b-2 border-green-200 pb-2">Quick Actions</h3>
                  <div className="space-y-3">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800 text-base">Add Program</h4>
                      <p className="text-gray-600 text-sm">Click the "Add Program" button to create new assistance programs.</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-yellow-800 text-base">Manage Beneficiaries</h4>
                      <p className="text-gray-600 text-sm">Use the beneficiary management section to add or edit recipients.</p>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-indigo-800 text-base">View Analytics</h4>
                      <p className="text-gray-600 text-sm">Check the charts and statistics for program performance insights.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Program Modal */}
      {showProgramModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-2xl max-h-[95vh] overflow-y-auto relative">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-3xl p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  {editingProgram ? 'Edit Program' : '+ Add Program'}
                </h2>
                <button
                  onClick={() => setShowProgramModal(false)}
                  className="text-white hover:text-red-200 transition-colors duration-200 p-2 hover:bg-white/10 rounded-full"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Debug Info - Remove in production */}
              {editingProgram && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-semibold text-yellow-800 mb-2">Debug Info (Remove in production):</h4>
                  <pre className="text-xs text-yellow-700 overflow-auto max-h-32">
                    {JSON.stringify({ editingProgram, programFormData }, null, 2)}
                  </pre>
                </div>
              )}
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">Program Name</label>
                <input
                  type="text"
                  name="name"
                  value={programFormData.name || ''}
                  onChange={handleProgramInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  placeholder="Enter program name"
                />
              </div>
              
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={programFormData.description || ''}
                  onChange={handleProgramInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  placeholder="Enter program description"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={programFormData.startDate || ''}
                    onChange={handleProgramInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={programFormData.endDate || ''}
                    onChange={handleProgramInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">Budget</label>
                  <input
                    type="number"
                    name="budget"
                    value={programFormData.budget || ''}
                    onChange={handleProgramInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    placeholder="Enter budget amount"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={programFormData.status || 'active'}
                    onChange={handleProgramInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">Max Beneficiaries</label>
                  <input
                    type="number"
                    name="maxBeneficiaries"
                    value={programFormData.maxBeneficiaries || ''}
                    onChange={handleProgramInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    placeholder="Enter maximum beneficiaries"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">Payout Date</label>
                  <input
                    type="datetime-local"
                    name="payoutDate"
                    value={programFormData.payoutDate || ''}
                    onChange={handleProgramInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">Beneficiary Type</label>
                  <select
                    name="beneficiaryType"
                    value={programFormData.beneficiaryType || ''}
                    onChange={handleProgramInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  >
                    <option value="">Select Beneficiary Type</option>
                    <option value="students">Students</option>
                    <option value="seniors">Senior Citizens</option>
                    <option value="families">Families</option>
                    <option value="individuals">Individuals</option>
                  </select>
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">Assistance Type</label>
                  <select
                    name="assistanceType"
                    value={programFormData.assistanceType || ''}
                    onChange={handleProgramInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  >
                    <option value="">Select Assistance Type</option>
                    <option value="financial">Financial</option>
                    <option value="medical">Medical</option>
                    <option value="educational">Educational</option>
                    <option value="food">Food Assistance</option>
                  </select>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={handleProgramSubmit}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-base"
                >
                  {editingProgram ? 'Update Program' : 'Add Program'}
                </button>
                <button
                  onClick={() => setShowProgramModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 text-base"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SocialModals;
