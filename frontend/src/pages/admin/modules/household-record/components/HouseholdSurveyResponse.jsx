import React, { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  HomeIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  DocumentTextIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/solid';
import api from '../../../../../utils/axiosConfig';

const HouseholdSurveyResponse = ({ surveyToken, onSubmitSuccess }) => {
  const [survey, setSurvey] = useState(null);
  const [responses, setResponses] = useState({});
  const [additionalInfo, setAdditionalInfo] = useState({
    relocations: [],
    deceased: [],
    newMembers: [],
    addressChange: null,
    contactUpdates: {},
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSurvey();
  }, [surveyToken]);

  const fetchSurvey = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/public/household-survey/${surveyToken}`);
      setSurvey(response.data.data);
      
      // Initialize responses object
      const initialResponses = {};
      response.data.data.questions.forEach((_, idx) => {
        initialResponses[idx] = {
          answer: '',
          details: '',
        };
      });
      setResponses(initialResponses);
    } catch (err) {
      console.error('Failed to fetch survey:', err);
      setError(err.response?.data?.message || 'Survey not found or has expired');
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (questionIdx, field, value) => {
    setResponses(prev => ({
      ...prev,
      [questionIdx]: {
        ...prev[questionIdx],
        [field]: value,
      },
    }));
  };

  const addRelocation = () => {
    setAdditionalInfo(prev => ({
      ...prev,
      relocations: [
        ...prev.relocations,
        { memberName: '', newAddress: '', moveDate: '', reason: '' },
      ],
    }));
  };

  const removeRelocation = (idx) => {
    setAdditionalInfo(prev => ({
      ...prev,
      relocations: prev.relocations.filter((_, i) => i !== idx),
    }));
  };

  const updateRelocation = (idx, field, value) => {
    setAdditionalInfo(prev => ({
      ...prev,
      relocations: prev.relocations.map((rel, i) =>
        i === idx ? { ...rel, [field]: value } : rel
      ),
    }));
  };

  const addDeceased = () => {
    setAdditionalInfo(prev => ({
      ...prev,
      deceased: [
        ...prev.deceased,
        { memberName: '', dateOfDeath: '', cause: '', certificateNumber: '' },
      ],
    }));
  };

  const removeDeceased = (idx) => {
    setAdditionalInfo(prev => ({
      ...prev,
      deceased: prev.deceased.filter((_, i) => i !== idx),
    }));
  };

  const updateDeceased = (idx, field, value) => {
    setAdditionalInfo(prev => ({
      ...prev,
      deceased: prev.deceased.map((dec, i) =>
        i === idx ? { ...dec, [field]: value } : dec
      ),
    }));
  };

  const addNewMember = () => {
    setAdditionalInfo(prev => ({
      ...prev,
      newMembers: [
        ...prev.newMembers,
        { name: '', relationship: '', birthDate: '', reason: '' },
      ],
    }));
  };

  const removeNewMember = (idx) => {
    setAdditionalInfo(prev => ({
      ...prev,
      newMembers: prev.newMembers.filter((_, i) => i !== idx),
    }));
  };

  const updateNewMember = (idx, field, value) => {
    setAdditionalInfo(prev => ({
      ...prev,
      newMembers: prev.newMembers.map((member, i) =>
        i === idx ? { ...member, [field]: value } : member
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        survey_token: surveyToken,
        responses,
        additional_info: additionalInfo,
        completed_at: new Date().toISOString(),
      };

      await api.post('/public/household-survey/submit', payload);
      setSuccess(true);
      
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (err) {
      console.error('Failed to submit survey:', err);
      setError(err.response?.data?.message || 'Failed to submit survey. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <DocumentTextIcon className="w-16 h-16 text-blue-600 animate-pulse mx-auto mb-4" />
          <div className="text-gray-600 text-lg">Loading survey...</div>
        </div>
      </div>
    );
  }

  if (error && !survey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <XCircleIcon className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Survey Unavailable</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <CheckCircleIcon className="w-20 h-20 text-green-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            Your survey response has been submitted successfully. We appreciate your cooperation in keeping our records up-to-date.
          </p>
          <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
            If you need to make any corrections, please contact your barangay office directly.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white bg-opacity-20 p-4 rounded-xl">
              <DocumentTextIcon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Household Verification Survey</h1>
              <p className="text-blue-100">Please help us keep your household records accurate</p>
            </div>
          </div>
          
          {/* Household Info */}
          <div className="bg-white bg-opacity-10 rounded-xl p-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <HomeIcon className="w-4 h-4" />
                <span>Household: {survey?.household_no}</span>
              </div>
              <div className="flex items-center gap-2">
                <UserGroupIcon className="w-4 h-4" />
                <span>Head: {survey?.head_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                <span>Expires: {new Date(survey?.expires_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Survey Questions */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Survey Questions</h2>
            <div className="space-y-4">
              {survey?.questions.map((question, idx) => (
                <div key={idx} className="border border-gray-200 rounded-xl p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {idx + 1}. {question}
                  </label>
                  <div className="space-y-2">
                    <select
                      value={responses[idx]?.answer || ''}
                      onChange={(e) => handleResponseChange(idx, 'answer', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select answer...</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                      <option value="not_applicable">Not Applicable</option>
                    </select>
                    {responses[idx]?.answer === 'yes' && (
                      <textarea
                        value={responses[idx]?.details || ''}
                        onChange={(e) => handleResponseChange(idx, 'details', e.target.value)}
                        placeholder="Please provide additional details..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={2}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Relocations Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <HomeIcon className="w-5 h-5 text-blue-600" />
                Member Relocations
              </h2>
              <button
                type="button"
                onClick={addRelocation}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition flex items-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                Add Relocation
              </button>
            </div>
            {additionalInfo.relocations.length === 0 ? (
              <div className="text-center text-gray-500 py-6">
                No relocations to report
              </div>
            ) : (
              <div className="space-y-4">
                {additionalInfo.relocations.map((relocation, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-700">Relocation {idx + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeRelocation(idx)}
                        className="p-2 hover:bg-red-50 rounded-lg transition"
                      >
                        <TrashIcon className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={relocation.memberName}
                        onChange={(e) => updateRelocation(idx, 'memberName', e.target.value)}
                        placeholder="Member name"
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                        required
                      />
                      <input
                        type="text"
                        value={relocation.newAddress}
                        onChange={(e) => updateRelocation(idx, 'newAddress', e.target.value)}
                        placeholder="New address"
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                        required
                      />
                      <input
                        type="date"
                        value={relocation.moveDate}
                        onChange={(e) => updateRelocation(idx, 'moveDate', e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                        required
                      />
                      <input
                        type="text"
                        value={relocation.reason}
                        onChange={(e) => updateRelocation(idx, 'reason', e.target.value)}
                        placeholder="Reason for relocation"
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Deceased Members Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                Deceased Family Members
              </h2>
              <button
                type="button"
                onClick={addDeceased}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition flex items-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                Add Deceased
              </button>
            </div>
            {additionalInfo.deceased.length === 0 ? (
              <div className="text-center text-gray-500 py-6">
                No deceased members to report
              </div>
            ) : (
              <div className="space-y-4">
                {additionalInfo.deceased.map((deceased, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-700">Deceased Member {idx + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeDeceased(idx)}
                        className="p-2 hover:bg-red-50 rounded-lg transition"
                      >
                        <TrashIcon className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={deceased.memberName}
                        onChange={(e) => updateDeceased(idx, 'memberName', e.target.value)}
                        placeholder="Member name"
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                        required
                      />
                      <input
                        type="date"
                        value={deceased.dateOfDeath}
                        onChange={(e) => updateDeceased(idx, 'dateOfDeath', e.target.value)}
                        placeholder="Date of death"
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                        required
                      />
                      <input
                        type="text"
                        value={deceased.cause}
                        onChange={(e) => updateDeceased(idx, 'cause', e.target.value)}
                        placeholder="Cause (optional)"
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        value={deceased.certificateNumber}
                        onChange={(e) => updateDeceased(idx, 'certificateNumber', e.target.value)}
                        placeholder="Death certificate number (if available)"
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* New Members Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <UserGroupIcon className="w-5 h-5 text-green-600" />
                New Household Members
              </h2>
              <button
                type="button"
                onClick={addNewMember}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition flex items-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                Add Member
              </button>
            </div>
            {additionalInfo.newMembers.length === 0 ? (
              <div className="text-center text-gray-500 py-6">
                No new members to report
              </div>
            ) : (
              <div className="space-y-4">
                {additionalInfo.newMembers.map((member, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-700">New Member {idx + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeNewMember(idx)}
                        className="p-2 hover:bg-red-50 rounded-lg transition"
                      >
                        <TrashIcon className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => updateNewMember(idx, 'name', e.target.value)}
                        placeholder="Full name"
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                        required
                      />
                      <input
                        type="text"
                        value={member.relationship}
                        onChange={(e) => updateNewMember(idx, 'relationship', e.target.value)}
                        placeholder="Relationship to household head"
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                        required
                      />
                      <input
                        type="date"
                        value={member.birthDate}
                        onChange={(e) => updateNewMember(idx, 'birthDate', e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                        required
                      />
                      <input
                        type="text"
                        value={member.reason}
                        onChange={(e) => updateNewMember(idx, 'reason', e.target.value)}
                        placeholder="Reason (birth, marriage, etc.)"
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <XCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          {/* Submit Button */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <button
              type="submit"
              disabled={submitting}
              className={`w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg transition flex items-center justify-center gap-2 ${
                submitting ? 'opacity-50 cursor-not-allowed' : 'hover:from-blue-700 hover:to-indigo-700'
              }`}
            >
              <CheckCircleIcon className="w-6 h-6" />
              {submitting ? 'Submitting...' : 'Submit Survey'}
            </button>
            <p className="text-center text-sm text-gray-600 mt-3">
              By submitting this survey, you confirm that all information provided is accurate.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HouseholdSurveyResponse;

