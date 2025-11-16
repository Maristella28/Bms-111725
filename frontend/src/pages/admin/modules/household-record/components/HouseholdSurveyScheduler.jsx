import React, { useState, useEffect } from 'react';
import {
  CalendarIcon,
  ClockIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XCircleIcon,
  CheckCircleIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  BellAlertIcon,
  UserGroupIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/solid';
import api from '../../../../../utils/axiosConfig';

const HouseholdSurveyScheduler = ({ onClose }) => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    survey_type: 'comprehensive',
    notification_method: 'email',
    frequency: 'monthly',
    target_households: 'all',
    custom_message: '',
    is_active: true,
    start_date: new Date().toISOString().split('T')[0],
    time: '09:00',
    day_of_week: '1', // Monday
    day_of_month: '1',
    specific_household_ids: [],
  });

  const surveyTypes = [
    { value: 'comprehensive', label: 'Comprehensive Verification', color: 'blue' },
    { value: 'relocation', label: 'Relocation Check', color: 'green' },
    { value: 'deceased', label: 'Vital Status Update', color: 'red' },
    { value: 'contact', label: 'Contact Update', color: 'purple' },
    { value: 'quick', label: 'Quick Status Check', color: 'yellow' },
  ];

  const frequencies = [
    { value: 'daily', label: 'Daily', icon: '📅' },
    { value: 'weekly', label: 'Weekly', icon: '📆' },
    { value: 'monthly', label: 'Monthly', icon: '🗓️' },
    { value: 'quarterly', label: 'Quarterly', icon: '📊' },
    { value: 'annually', label: 'Annually', icon: '📈' },
  ];

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/household-survey-schedules');
      setSchedules(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async () => {
    try {
      const payload = {
        ...formData,
        scheduled_time: `${formData.time}:00`,
      };

      if (editingSchedule) {
        await api.put(`/admin/household-survey-schedules/${editingSchedule.id}`, payload);
      } else {
        await api.post('/admin/household-survey-schedules', payload);
      }

      fetchSchedules();
      setShowCreateModal(false);
      setEditingSchedule(null);
      resetForm();
    } catch (err) {
      console.error('Failed to save schedule:', err);
      alert(err.response?.data?.message || 'Failed to save schedule');
    }
  };

  const handleToggleStatus = async (schedule) => {
    try {
      await api.patch(`/admin/household-survey-schedules/${schedule.id}/toggle`);
      fetchSchedules();
    } catch (err) {
      console.error('Failed to toggle schedule:', err);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;
    
    try {
      await api.delete(`/admin/household-survey-schedules/${scheduleId}`);
      fetchSchedules();
    } catch (err) {
      console.error('Failed to delete schedule:', err);
    }
  };

  const handleRunNow = async (schedule) => {
    if (!confirm('Run this survey schedule now?')) return;

    try {
      await api.post(`/admin/household-survey-schedules/${schedule.id}/run`);
      alert('Survey batch has been queued for sending!');
    } catch (err) {
      console.error('Failed to run schedule:', err);
      alert(err.response?.data?.message || 'Failed to run schedule');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      survey_type: 'comprehensive',
      notification_method: 'email',
      frequency: 'monthly',
      target_households: 'all',
      custom_message: '',
      is_active: true,
      start_date: new Date().toISOString().split('T')[0],
      time: '09:00',
      day_of_week: '1',
      day_of_month: '1',
      specific_household_ids: [],
    });
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      name: schedule.name,
      survey_type: schedule.survey_type,
      notification_method: schedule.notification_method,
      frequency: schedule.frequency,
      target_households: schedule.target_households,
      custom_message: schedule.custom_message || '',
      is_active: schedule.is_active,
      start_date: schedule.start_date.split('T')[0],
      time: schedule.scheduled_time?.substring(0, 5) || '09:00',
      day_of_week: schedule.day_of_week || '1',
      day_of_month: schedule.day_of_month || '1',
      specific_household_ids: schedule.specific_household_ids || [],
    });
    setShowCreateModal(true);
  };

  const getFrequencyDisplay = (schedule) => {
    switch (schedule.frequency) {
      case 'daily':
        return 'Every day';
      case 'weekly':
        return `Every ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][schedule.day_of_week || 1]}`;
      case 'monthly':
        return `Day ${schedule.day_of_month} of every month`;
      case 'quarterly':
        return 'Every 3 months';
      case 'annually':
        return 'Once per year';
      default:
        return schedule.frequency;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 p-3 rounded-xl">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Survey Scheduler</h2>
              <p className="text-indigo-100 text-sm">Automate periodic household surveys</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
          >
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Action Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-indigo-600" />
              <span className="font-semibold text-gray-800">
                {schedules.length} Schedule{schedules.length !== 1 ? 's' : ''}
              </span>
            </div>
            <button
              onClick={() => {
                resetForm();
                setEditingSchedule(null);
                setShowCreateModal(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              New Schedule
            </button>
          </div>

          {/* Schedules List */}
          {loading ? (
            <div className="text-center py-12">
              <ArrowPathIcon className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-3" />
              <div className="text-gray-600">Loading schedules...</div>
            </div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Schedules Yet</h3>
              <p className="text-gray-600 mb-4">Create your first automated survey schedule</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Create Schedule
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className={`border-2 rounded-xl p-4 transition-all ${
                    schedule.is_active
                      ? 'border-indigo-200 bg-indigo-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  {/* Schedule Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-800">{schedule.name}</h3>
                        {schedule.is_active ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full font-medium">
                            Paused
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {surveyTypes.find(t => t.value === schedule.survey_type)?.label}
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleStatus(schedule)}
                      className={`p-2 rounded-lg transition ${
                        schedule.is_active
                          ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
                          : 'bg-green-100 hover:bg-green-200 text-green-700'
                      }`}
                      title={schedule.is_active ? 'Pause' : 'Activate'}
                    >
                      {schedule.is_active ? (
                        <PauseIcon className="w-5 h-5" />
                      ) : (
                        <PlayIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Schedule Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <ClockIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">
                        {getFrequencyDisplay(schedule)} at {schedule.scheduled_time?.substring(0, 5)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <UserGroupIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">
                        {schedule.target_households === 'all'
                          ? 'All households'
                          : `${schedule.specific_household_ids?.length || 0} specific households`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">
                        Next run: {schedule.next_run_date ? new Date(schedule.next_run_date).toLocaleDateString() : 'Not scheduled'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <BellAlertIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700 capitalize">
                        {schedule.notification_method}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-white rounded-lg">
                    <div className="text-center">
                      <div className="text-xs text-gray-600">Total Runs</div>
                      <div className="text-lg font-bold text-gray-800">{schedule.total_runs || 0}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600">Surveys Sent</div>
                      <div className="text-lg font-bold text-indigo-600">{schedule.surveys_sent || 0}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600">Last Run</div>
                      <div className="text-xs font-medium text-gray-800">
                        {schedule.last_run_date ? new Date(schedule.last_run_date).toLocaleDateString() : 'Never'}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRunNow(schedule)}
                      className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm flex items-center justify-center gap-2"
                    >
                      <PlayIcon className="w-4 h-4" />
                      Run Now
                    </button>
                    <button
                      onClick={() => handleEdit(schedule)}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                      title="Edit"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSchedule(schedule.id)}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl">
              <h3 className="text-xl font-bold">
                {editingSchedule ? 'Edit Schedule' : 'Create New Schedule'}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              {/* Schedule Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Schedule Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Monthly Household Verification"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Survey Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Survey Type *
                </label>
                <select
                  value={formData.survey_type}
                  onChange={(e) => setFormData({ ...formData, survey_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {surveyTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Frequency *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {frequencies.map(freq => (
                    <button
                      key={freq.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, frequency: freq.value })}
                      className={`p-3 rounded-lg border-2 transition text-center ${
                        formData.frequency === freq.value
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{freq.icon}</div>
                      <div className="text-sm font-medium">{freq.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Timing */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Day Selection */}
              {formData.frequency === 'weekly' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Day of Week
                  </label>
                  <select
                    value={formData.day_of_week}
                    onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="0">Sunday</option>
                    <option value="1">Monday</option>
                    <option value="2">Tuesday</option>
                    <option value="3">Wednesday</option>
                    <option value="4">Thursday</option>
                    <option value="5">Friday</option>
                    <option value="6">Saturday</option>
                  </select>
                </div>
              )}

              {formData.frequency === 'monthly' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Day of Month
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="28"
                    value={formData.day_of_month}
                    onChange={(e) => setFormData({ ...formData, day_of_month: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              )}

              {/* Target Households */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Target Households
                </label>
                <select
                  value={formData.target_households}
                  onChange={(e) => setFormData({ ...formData, target_households: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">All Households</option>
                  <option value="specific">Specific Households</option>
                </select>
              </div>

              {/* Notification Method */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notification Method
                </label>
                <select
                  value={formData.notification_method}
                  onChange={(e) => setFormData({ ...formData, notification_method: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="email">Email</option>
                </select>
              </div>

              {/* Custom Message */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Custom Message (Optional)
                </label>
                <textarea
                  value={formData.custom_message}
                  onChange={(e) => setFormData({ ...formData, custom_message: e.target.value })}
                  placeholder="Add a custom message for recipients..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none"
                  rows={3}
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Activate schedule immediately
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingSchedule(null);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSchedule}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition"
                >
                  {editingSchedule ? 'Update Schedule' : 'Create Schedule'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HouseholdSurveyScheduler;

