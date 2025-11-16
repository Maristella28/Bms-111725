import React, { useState, useEffect } from 'react';
import axios from '../../../../utils/axiosConfig';

const initialForm = {
  type: '',
  hotline: '',
  description: '',
  status: 'Active',
  contact_person: '',
  email: '',
  procedure: '',
};

const EmergencyHotlinesTable = () => {
  const [hotlines, setHotlines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(initialForm);

  const fetchHotlines = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/emergency-hotlines');
      setHotlines(res.data);
    } catch (err) {
      setError('Failed to fetch hotlines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotlines();
  }, []);

  const openAddModal = () => {
    setEditId(null);
    setForm(initialForm);
    setError('');
    setSuccessMessage('');
    setShowModal(true);
  };

  const openEditModal = (hotline) => {
    setEditId(hotline.id);
    setForm({
      ...hotline,
      procedure: Array.isArray(hotline.procedure) ? hotline.procedure.join('\n') : (hotline.procedure || ''),
    });
    setError('');
    setSuccessMessage('');
    setShowModal(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const payload = {
        ...form,
        procedure: form.procedure ? form.procedure.split('\n').map((s) => s.trim()).filter(Boolean) : [],
        last_updated: new Date().toISOString().split('T')[0],
      };
      if (editId) {
        const response = await axios.put(`/admin/emergency-hotlines/${editId}`, payload);
        setSuccessMessage('✅ Emergency hotline updated successfully!');
        setTimeout(() => {
          setShowModal(false);
          setSuccessMessage('');
          fetchHotlines();
        }, 1500);
      } else {
        const response = await axios.post('/admin/emergency-hotlines', payload);
        setSuccessMessage('✅ Emergency hotline added successfully!');
        setTimeout(() => {
      setShowModal(false);
          setSuccessMessage('');
      fetchHotlines();
        }, 1500);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Failed to save hotline. Please check all required fields and try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hotline?')) return;
    setLoading(true);
    setError('');
    try {
      await axios.delete(`/admin/emergency-hotlines/${id}`);
      fetchHotlines();
    } catch (err) {
      setError('Failed to delete hotline');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-red-700">Emergency Hotlines</h2>
      </div>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left border rounded-lg overflow-hidden bg-white shadow">
          <thead className="bg-red-100 text-black text-xs uppercase">
            <tr>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Hotline</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Contact Person</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Last Updated</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-red-50">
            {hotlines.map((h) => (
              <tr key={h.id} className="hover:bg-red-50/70 transition">
                <td className="px-4 py-3 font-semibold text-red-700">{h.type}</td>
                <td className="px-4 py-3 font-mono text-red-800">{h.hotline}</td>
                <td className="px-4 py-3 max-w-xs truncate" title={h.description}>{h.description}</td>
                <td className="px-4 py-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${h.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{h.status}</span>
                </td>
                <td className="px-4 py-3">{h.contact_person}</td>
                <td className="px-4 py-3">{h.email}</td>
                <td className="px-4 py-3">{h.last_updated}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => openEditModal(h)} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Edit</button>
                  <button onClick={() => handleDelete(h.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-lg space-y-4"
          >
            <h2 className="text-2xl font-bold mb-4 text-emerald-700 flex items-center gap-2">
              {editId ? '✏️ Edit' : '➕ Add'} Emergency Hotline
            </h2>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {successMessage}
              </div>
            )}
            <label className="block text-sm font-semibold text-gray-700">Type <span className="text-red-500">*</span></label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              required
              className="w-full border-2 border-gray-200 focus:ring-4 focus:ring-green-100 focus:border-green-500 rounded-xl px-4 py-3 text-base"
            >
              <option value="">Select Type</option>
              <option value="Fire">Fire</option>
              <option value="Flood">Flood</option>
              <option value="Medical Emergency">Medical Emergency</option>
              <option value="Police">Police</option>
              <option value="Ambulance">Ambulance</option>
              <option value="Rescue">Rescue</option>
              <option value="Earthquake">Earthquake</option>
              <option value="Typhoon">Typhoon</option>
              <option value="Disaster Response">Disaster Response</option>
              <option value="Emergency Management">Emergency Management</option>
              <option value="Other">Other</option>
            </select>
            <label className="block text-sm font-semibold text-gray-700">Hotline Number <span className="text-red-500">*</span></label>
            <input
              name="hotline"
              value={form.hotline}
              onChange={handleChange}
              required
              placeholder="Hotline Number"
              className="w-full border-2 border-gray-200 focus:ring-4 focus:ring-green-100 focus:border-green-500 rounded-xl px-4 py-3 text-base"
            />
            <label className="block text-sm font-semibold text-gray-700">Description <span className="text-red-500">*</span></label>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              placeholder="Description"
              className="w-full border-2 border-gray-200 focus:ring-4 focus:ring-green-100 focus:border-green-500 rounded-xl px-4 py-3 text-base"
            />
            <label className="block text-sm font-semibold text-gray-700">Status <span className="text-red-500">*</span></label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              required
              className="w-full border-2 border-gray-200 focus:ring-4 focus:ring-green-100 focus:border-green-500 rounded-xl px-4 py-3 text-base"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <label className="block text-sm font-semibold text-gray-700">Contact Person</label>
            <input
              name="contact_person"
              value={form.contact_person || ''}
              onChange={handleChange}
              placeholder="Contact Person"
              className="w-full border-2 border-gray-200 focus:ring-4 focus:ring-green-100 focus:border-green-500 rounded-xl px-4 py-3 text-base"
            />
            <label className="block text-sm font-semibold text-gray-700">Email</label>
            <input
              name="email"
              type="email"
              value={form.email || ''}
              onChange={handleChange}
              placeholder="Email"
              className="w-full border-2 border-gray-200 focus:ring-4 focus:ring-green-100 focus:border-green-500 rounded-xl px-4 py-3 text-base"
            />
            <label className="block text-sm font-semibold text-gray-700">Procedure</label>
            <textarea
              name="procedure"
              value={form.procedure || ''}
              onChange={handleChange}
              placeholder="Step-by-step procedure (one step per line)"
              className="w-full border-2 border-gray-200 focus:ring-4 focus:ring-green-100 focus:border-green-500 rounded-xl px-4 py-3 text-base"
              rows={4}
            />
            <div className="flex gap-4 mt-6">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 disabled:opacity-50"
              >
                {loading ? 'Saving...' : editId ? 'Update' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setError('');
                  setSuccessMessage('');
                  setForm(initialForm);
                }}
                className="bg-gray-300 px-6 py-3 rounded-xl font-bold hover:bg-gray-400 transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default EmergencyHotlinesTable; 