import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  HomeIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  UserIcon,
  UserGroupIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/solid';
import api from '../../../../utils/axiosConfig';

const CreateHousehold = () => {
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [householdSize, setHouseholdSize] = useState(1);
  const [headResidentId, setHeadResidentId] = useState('');
  const [residents, setResidents] = useState([]);
  const [headResidentCode, setHeadResidentCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [civilStatus, setCivilStatus] = useState('');
  const [gender, setGender] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [members, setMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [existingHouseholds, setExistingHouseholds] = useState([]);

  useEffect(() => {
    let mounted = true;
    const fetchResidents = async () => {
      try {
        const res = await api.get('/admin/residents');
        if (!mounted) return;
        const list = res.data?.data ? res.data.data : (Array.isArray(res.data) ? res.data : (res.data.residents || []));
        const mapped = list.map((r, index) => {
          // Extract address from multiple possible locations in the API response
          // Profile address is most likely location (Profile model has current_address)
          const profileAddress = r.profile ? (
            r.profile.current_address || 
            r.profile.address || 
            r.profile.full_address ||
            ''
          ) : '';
          
          // Resident model might also have address fields
          const residentAddress = r.current_address || 
                                 r.address || 
                                 r.full_address ||
                                 '';
          
          // Prioritize profile address (most common location), fallback to resident address
          const extractedAddress = profileAddress || residentAddress || '';
          
          // Debug logging for first few residents
          if (index < 3) {
            console.log(`📍 CreateHousehold - Address extraction for resident ${index + 1}:`, {
              id: r.id,
              name: `${r.first_name || r.firstName || ''} ${r.last_name || r.lastName || ''}`,
              'r.current_address': r.current_address || 'NOT FOUND',
              'r.address': r.address || 'NOT FOUND',
              'r.full_address': r.full_address || 'NOT FOUND',
              'r.profile': r.profile ? 'exists' : 'null',
              'r.profile?.current_address': r.profile?.current_address || 'NOT FOUND',
              'r.profile?.address': r.profile?.address || 'NOT FOUND',
              'r.profile?.full_address': r.profile?.full_address || 'NOT FOUND',
              'profileAddress': profileAddress || 'NOT FOUND',
              'residentAddress': residentAddress || 'NOT FOUND',
              'final_address': extractedAddress || 'NOT FOUND',
            });
          }
          
          return {
            id: r.id,
            resident_id: r.resident_id || r.residentId || r.resident_no || '',
            first_name: r.first_name || r.firstName || r.name || '',
            last_name: r.last_name || r.lastName || '',
            contactNumber: r.mobilenumber || r.mobile_number || r.contact_number || r.phone || '',
            email: r.email || r.contactEmail || '',
            age: r.age || r.years_old || (r.profile && r.profile.age) || '',
            civilStatus: r.civil_status || r.civilStatus || (r.profile && r.profile.civil_status) || '',
            gender: r.gender || r.sex || (r.profile && r.profile.gender) || '',
            // Add address field - prioritize profile address
            address: extractedAddress,
            // Include household_no to check if resident is already a member
            household_no: r.household_no || r.householdNo || '',
          };
        });
        
        console.log('✅ CreateHousehold - Mapped residents with addresses:', mapped.slice(0, 3).map(r => ({
          name: `${r.first_name} ${r.last_name}`,
          address: r.address || 'NO ADDRESS',
        })));
        setResidents(mapped);
      } catch (err) {
        console.warn('Could not fetch residents', err?.response?.data || err?.message);
        setResidents([]);
      }
    };
    fetchResidents();
    
    // Fetch existing households to check for duplicate head assignments
    const fetchHouseholds = async () => {
      try {
        const res = await api.get('/admin/households');
        const households = res.data?.data || res.data || [];
        const householdsArray = Array.isArray(households) ? households : [];
        console.log(' Fetched existing households for validation:', householdsArray.length, 'households');
        console.log(' Sample households:', householdsArray.slice(0, 3).map(h => ({
          id: h.id,
          household_no: h.household_no || h.householdId,
          head_resident_id: h.head_resident_id || h.headResidentId,
        })));
        setExistingHouseholds(householdsArray);
      } catch (err) {
        console.warn('Could not fetch households for validation:', err);
        setExistingHouseholds([]);
      }
    };
    fetchHouseholds();
    
    return () => { mounted = false; };
  }, []);

  const isValid = () => {
    if (!householdSize || Number(householdSize) <= 0) return false;
    // head resident is required
    if (!headResidentId) return false;
    return true;
  };

  // trim members if householdSize decreased below current total count (including head)
  useEffect(() => {
    const size = Number(householdSize) || 0;
    // Total count includes: 1 (head) + members.length
    const headCount = headResidentId ? 1 : 0;
    const totalCount = headCount + members.length;
    
    if (totalCount > size) {
      // Calculate how many members we can keep (size - 1 for head)
      const maxMembers = Math.max(0, size - headCount);
      setMembers((prev) => prev.slice(0, maxMembers));
      setError(`Household size reduced to ${size}; trimmed members to fit (Head of Household counts as 1 member)`);
    }
  }, [householdSize, headResidentId]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!isValid()) return setError('Please complete required fields.');
    setError(null);
    setIsSaving(true);
    try {
      const payload = {
        household_no: `HH-${Date.now().toString().slice(-6)}`,
        address: address || null,
        head_resident_id: headResidentId || null,
          head_resident_code: headResidentCode || null,
          head_full_name: fullName || null,
  members_count: Number(householdSize) || 1,
  // members: array of resident ids
  members: members.map(m => m.id),
  members_full: members.map(m => ({ id: m.id, resident_id: m.resident_id, name: m.name, contactNumber: m.contactNumber, email: m.email, age: m.age, civilStatus: m.civilStatus, gender: m.gender })),
        mobilenumber: contactNumber || null,
        email: email || null,
          age: age || null,
          civil_status: civilStatus || null,
          gender: gender || null,
      };
      const res = await api.post('/admin/households', payload);
      // optimistic navigation back to households list
      navigate('/admin/households');
    } catch (err) {
      console.warn('Failed to create household', err?.response?.data || err?.message);
      const errorMessage = err?.response?.data?.message || 'Failed to create household';
      setError(errorMessage);
      
      // If it's a duplicate head or member error, show a more specific message
      if (err?.response?.data?.error === 'duplicate_head' || err?.response?.data?.error === 'duplicate_member') {
        setError(`⚠️ ${errorMessage}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="bg-gradient-to-br from-green-50/80 via-emerald-50/50 to-white min-h-screen ml-0 lg:ml-64 pt-20 lg:pt-36 px-4 sm:px-6 lg:px-8 pb-16 font-sans">
      <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Back Button - Top Left */}
        <div className="flex justify-start">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-gray-50 border-2 border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 text-gray-700 font-semibold hover:text-gray-900"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Household Records
          </button>
        </div>

        {/* Enhanced Header Section */}
        <div className="text-center space-y-4 sm:space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-xl">
            <HomeIcon className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent tracking-tight px-4">
            Create New Household
          </h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed px-4">
            Register a new household and assign members to the system. Fill in the required information below.
          </p>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 lg:p-10">
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* Promote Resident Section */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 sm:p-8 border-2 border-green-200/70 shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <UserIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Promote Resident</h2>
                  <p className="text-sm text-gray-600">Select a resident to become Head of Household</p>
                </div>
                <span className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-black rounded-full shadow-md uppercase tracking-wide">Required</span>
              </div>
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder=" Search residents by name or ID..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-green-500/30 focus:border-green-500 transition-all duration-300 bg-white shadow-md hover:shadow-lg"
                  />
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
                </div>
                <div className="relative">
                  <UserIcon className="w-5 h-5 absolute left-4 top-3.5 text-green-600 z-10" />
                  <select
                    value={headResidentId}
                    onChange={async (e) => {
                      const val = e.target.value;
                      setHeadResidentId(val);
                      if (!val) {
                        // clear autofill
                        setHeadResidentCode('');
                        setFullName('');
                        setContactNumber('');
                        setEmail('');
                        setAge('');
                        setCivilStatus('');
                        setGender('');
                        setAddress('');
                        return;
                      }
                      const resident = residents.find(rr => String(rr.id) === String(val));
                      if (resident) {
                        
                        setHeadResidentCode(resident.resident_id || '');
                        setFullName(`${resident.first_name || ''} ${resident.last_name || ''}`.trim());
                        setContactNumber(resident.contactNumber || '');
                        setEmail(resident.email || '');
                        setAge(resident.age || '');
                        setCivilStatus(resident.civilStatus || '');
                        setGender(resident.gender || '');
                        
                        // Automatically fill address from resident's record
                        let residentAddress = resident.address || '';
                        
                        // If address is not found, try to fetch from profile endpoint
                        if (!residentAddress && resident.id) {
                          try {
                            console.log(' Address not found, attempting to fetch from profile...', resident.id);
                            // Try to get the resident's profile which should have the address
                            // First, try to get the resident's user_id to fetch profile
                            const residentDetailsRes = await api.get(`/admin/residents`).catch(() => null);
                            if (residentDetailsRes?.data) {
                              const allResidents = residentDetailsRes.data.residents || residentDetailsRes.data.data || residentDetailsRes.data;
                              const fullResident = Array.isArray(allResidents) 
                                ? allResidents.find(r => r.id === resident.id)
                                : null;
                              
                              if (fullResident) {
                                console.log(' Found full resident data:', {
                                  id: fullResident.id,
                                  current_address: fullResident.current_address,
                                  address: fullResident.address,
                                  full_address: fullResident.full_address,
                                  profile: fullResident.profile ? 'exists' : 'null',
                                  profile_current_address: fullResident.profile?.current_address,
                                });
                                
                                const extractedAddress = fullResident.current_address || 
                                                       fullResident.address || 
                                                       fullResident.full_address ||
                                                       (fullResident.profile && (fullResident.profile.current_address || fullResident.profile.address || fullResident.profile.full_address)) ||
                                                       '';
                                if (extractedAddress) {
                                  residentAddress = extractedAddress;
                                  console.log('✅ Extracted address:', residentAddress);
                                  // Update the resident in the array for future use
                                  const residentIndex = residents.findIndex(r => r.id === resident.id);
                                  if (residentIndex >= 0) {
                                    residents[residentIndex].address = extractedAddress;
                                  }
                                } else {
                                  console.warn('⚠️ Address still not found after checking all locations');
                                }
                              }
                            }
                          } catch (err) {
                            console.warn('Could not fetch additional resident details:', err);
                          }
                        }
                        
                        // Set the address (auto-filled or empty)
                        setAddress(residentAddress || '');
                        
                        // Ensure household size is at least 1 (the head counts as one member)
                        if (householdSize < 1) {
                          setHouseholdSize(1);
                        }
                        
                        console.log('✅ Auto-filled address for resident:', {
                          name: `${resident.first_name} ${resident.last_name}`,
                          address: residentAddress || 'NOT FOUND',
                        });
                      }
                    }}
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-green-500/30 focus:border-green-500 transition-all duration-300 bg-white shadow-md hover:shadow-lg font-medium cursor-pointer"
                  >
                  <option value=""> Choose resident to promote</option>
                  {residents
                    .filter(r => {
                      // Exclude residents who are already heads of household
                      const isAlreadyHead = existingHouseholds.some(household => 
                        household.head_resident_id === r.id || household.headResidentId === r.id
                      );
                      if (isAlreadyHead) {
                        console.log('🚫 Excluding head:', r.first_name, r.last_name, 'is already a head');
                        return false;
                      }
                      
                      // Exclude residents who are already members of another household
                      // Check if resident has household_no set
                      if (r.household_no && r.household_no.trim() !== '') {
                        // Check if this household_no belongs to any existing household
                        const isAlreadyMember = existingHouseholds.some(household => 
                          household.household_no === r.household_no || 
                          household.householdId === r.household_no ||
                          household.id && r.household_no
                        );
                        if (isAlreadyMember) {
                          console.log('🚫 Excluding member:', r.first_name, r.last_name, 'is already a member of household', r.household_no);
                          return false;
                        }
                      }
                      
                      // Apply search filter
                      const q = memberSearch.trim().toLowerCase();
                      if (!q) return true;
                      const full = `${r.first_name || ''} ${r.last_name || ''}`.toLowerCase();
                      return full.includes(q) || (r.resident_id || '').toLowerCase().includes(q);
                    })
                    .map(r => (
                      <option key={r.id} value={r.id}>
                        {`${r.first_name} ${r.last_name} ${r.household_no ? ` (HH: ${r.household_no})` : ''} ${r.resident_id ? ` — ${r.resident_id}` : ''}`}
                      </option>
                    ))}
                  {residents.length > 0 && residents.filter(r => {
                    const isAlreadyHead = existingHouseholds.some(household => 
                      household.head_resident_id === r.id
                    );
                    const isAlreadyMember = r.household_no && r.household_no.trim() !== '' && 
                      existingHouseholds.some(household => household.household_no === r.household_no);
                    return isAlreadyHead || isAlreadyMember;
                  }).length === residents.length && (
                    <option value="" disabled>--- All residents are already heads or members of households ---</option>
                  )}
                  </select>
                </div>
              </div>
            </div>

            {/* Household Size and Address Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Household Size Section */}
              <div className="md:col-span-1">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200/70 shadow-lg h-full">
                  <label className="block text-base font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <UserGroupIcon className="w-5 h-5 text-green-600" />
                    Household Size
                  </label>
                  <p className="text-xs text-gray-600 mb-3">Total number of members including the head</p>
                  <input
                    type="number"
                    min={1}
                    value={householdSize}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setHouseholdSize(value >= 1 ? value : 1);
                    }}
                    className="w-full px-5 py-4 border-2 border-green-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-green-500/30 focus:border-green-500 transition-all duration-300 bg-white shadow-md hover:shadow-lg"
                  />
                  {headResidentId && (
                    <p className="text-sm text-green-600 mt-3 flex items-center gap-2 font-semibold">
                      <InformationCircleIcon className="w-4 h-4" />
                      <span>The Head of Household counts as 1 member. Minimum size is 1.</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Address Section */}
              <div className="md:col-span-1">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200/70 shadow-lg">
                  <label className="block text-base font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <MapPinIcon className="w-5 h-5 text-green-600" />
                    Address
                    {headResidentId && address && (
                      <span className="text-xs font-normal text-green-600 flex items-center gap-1">
                        <CheckCircleIcon className="w-4 h-4" />
                        <span>Auto-filled</span>
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => {
                      if (!headResidentId) {
                        setAddress(e.target.value);
                      }
                    }}
                    readOnly={!!headResidentId}
                    placeholder=" House number, street, barangay"
                    className={`w-full px-5 py-4 border-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      headResidentId && address 
                        ? 'border-green-300 bg-green-50/70 cursor-not-allowed shadow-md' 
                        : headResidentId
                        ? 'border-gray-200 bg-gray-100 cursor-not-allowed'
                        : 'border-green-200 focus:ring-4 focus:ring-green-500/30 focus:border-green-500 bg-white shadow-md hover:shadow-lg'
                    }`}
                  />
                  {headResidentId && address && (
                    <p className="text-sm text-green-600 mt-3 flex items-center gap-2 font-semibold">
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>Auto-filled (read-only)</span>
                    </p>
                  )}
                  {headResidentId && !address && (
                    <p className="text-sm text-orange-600 mt-3 flex items-center gap-2 font-semibold">
                      <ExclamationTriangleIcon className="w-4 h-4" />
                      <span>Address not found in resident's record. Please update the resident's profile first.</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Resident summary / autofill fields - All read-only when head resident is selected */}
            {headResidentId && (
              <div className="w-full">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200/70 rounded-2xl p-6 sm:p-8 shadow-lg">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <InformationCircleIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xl sm:text-2xl font-bold text-green-900 mb-1">Resident Information</p>
                      <p className="text-sm text-green-700">Auto-filled from profile (Read-Only)</p>
                    </div>
                  </div>
                  <div className="mb-6 p-4 bg-green-100/60 rounded-xl border-2 border-green-200">
                    <p className="text-sm text-green-800 flex items-center gap-2 font-semibold">
                      <InformationCircleIcon className="w-5 h-5 flex-shrink-0" />
                      <span>These fields are auto-filled from the resident's profile and cannot be edited here. To update these details, please modify the resident's master profile.</span>
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-gradient-to-br from-gray-50 to-green-50/30 rounded-2xl p-6 border-2 border-gray-200/60 shadow-lg">
                    <div className="bg-white/90 rounded-xl p-5 border-2 border-gray-200 shadow-md hover:shadow-lg transition-shadow">
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-green-600" />
                        Resident ID
                      </label>
                      <input 
                        type="text" 
                        value={headResidentCode || headResidentId} 
                        readOnly 
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base font-mono font-bold bg-gray-50 cursor-not-allowed text-gray-800 shadow-sm" 
                      />
                    </div>
                    <div className="bg-white/90 rounded-xl p-5 border-2 border-gray-200 shadow-md hover:shadow-lg transition-shadow">
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-green-600" />
                        Full Name
                      </label>
                      <input 
                        type="text" 
                        value={fullName} 
                        readOnly 
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base font-semibold bg-gray-50 cursor-not-allowed text-gray-800 shadow-sm" 
                      />
                      {fullName && (
                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1 font-medium">
                          <CheckCircleIcon className="w-3 h-3" />
                          <span>Auto-filled</span>
                        </p>
                      )}
                    </div>
                    <div className="bg-white/90 rounded-xl p-5 border-2 border-gray-200 shadow-md hover:shadow-lg transition-shadow">
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">Age</label>
                      <input 
                        type="number" 
                        min={0} 
                        value={age} 
                        readOnly 
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base font-semibold bg-gray-50 cursor-not-allowed text-gray-800 shadow-sm" 
                      />
                      {age && (
                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1 font-medium">
                          <CheckCircleIcon className="w-3 h-3" />
                          <span>Auto-filled</span>
                        </p>
                      )}
                    </div>
                    <div className="bg-white/90 rounded-xl p-5 border-2 border-gray-200 shadow-md hover:shadow-lg transition-shadow">
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">Civil Status</label>
                      <input 
                        type="text" 
                        value={civilStatus || 'N/A'} 
                        readOnly 
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base font-semibold bg-gray-50 cursor-not-allowed text-gray-800 shadow-sm" 
                      />
                      {civilStatus && (
                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1 font-medium">
                          <CheckCircleIcon className="w-3 h-3" />
                          <span>Auto-filled</span>
                        </p>
                      )}
                    </div>
                    <div className="bg-white/90 rounded-xl p-5 border-2 border-gray-200 shadow-md hover:shadow-lg transition-shadow">
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">Sex</label>
                      <input 
                        type="text" 
                        value={gender || 'N/A'} 
                        readOnly 
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base font-semibold bg-gray-50 cursor-not-allowed text-gray-800 shadow-sm" 
                      />
                      {gender && (
                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1 font-medium">
                          <CheckCircleIcon className="w-3 h-3" />
                          <span>Auto-filled</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Members management */}
            <div className="w-full">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 sm:p-8 border-2 border-green-200/70 shadow-lg">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <UserGroupIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Household Members</h2>
                    <p className="text-sm text-gray-600">Add additional members to the household</p>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder=" Search residents to add..."
                        value={memberSearch}
                        onChange={(e) => setMemberSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-green-200 rounded-xl text-sm focus:ring-4 focus:ring-green-500/30 focus:border-green-500 transition-all duration-300 bg-white shadow-md hover:shadow-lg"
                      />
                      <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
                    </div>
                    <select
                      value={selectedMemberId}
                      onChange={(e) => setSelectedMemberId(e.target.value)}
                      className="px-4 py-3.5 border-2 border-green-200 rounded-xl text-sm w-full focus:ring-4 focus:ring-green-500/30 focus:border-green-500 transition-all duration-300 bg-white shadow-md hover:shadow-lg font-medium cursor-pointer"
                    >
                      <option value=""> Select resident to add</option>
                    {residents
                      .filter(r => {
                        // Exclude head of this household
                        if (String(r.id) === String(headResidentId)) return false;
                        
                        // Exclude if already added as a member to this household
                        if (members.find(m => String(m.id) === String(r.id))) return false;
                        
                        // Exclude residents who are already heads of household
                        const isAlreadyHead = existingHouseholds.some(household => 
                          household.head_resident_id === r.id || household.headResidentId === r.id
                        );
                        if (isAlreadyHead) {
                          console.log('🚫 Excluding head from members list:', r.first_name, r.last_name);
                          return false;
                        }
                        
                        // Exclude residents who are already members of another household
                        if (r.household_no && r.household_no.trim() !== '') {
                          const isAlreadyMember = existingHouseholds.some(household => 
                            household.household_no === r.household_no || 
                            household.householdId === r.household_no ||
                            (household.id && r.household_no)
                          );
                          if (isAlreadyMember) {
                            console.log('🚫 Excluding member from members list:', r.first_name, r.last_name, 'household_no:', r.household_no);
                            return false;
                          }
                        }
                        
                        // Apply search filter
                        const q = memberSearch.trim().toLowerCase();
                        if (!q) return true;
                        const full = `${r.first_name || ''} ${r.last_name || ''}`.toLowerCase();
                        return full.includes(q) || (r.resident_id || '').toLowerCase().includes(q);
                      })
                      .map(r => (
                        <option key={r.id} value={r.id}>
                          {`${r.first_name} ${r.last_name} ${r.household_no ? ` (HH: ${r.household_no})` : ''} ${r.resident_id ? ` — ${r.resident_id}` : ''}`}
                        </option>
                      ))}
                  </select>
                  <div className="flex md:justify-start justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        const size = Number(householdSize) || 0;
                        if (!selectedMemberId) return setError('Select a resident to add');
                        
                        // Calculate total count: 1 (head) + current members
                        const headCount = headResidentId ? 1 : 0;
                        const totalCount = headCount + members.length;
                        
                        // Check if adding one more would exceed the household size
                        if (totalCount >= size) {
                          return setError(`Household size limit reached (${size}). The Head of Household counts as 1 member.`);
                        }
                        
                        const resident = residents.find(r => String(r.id) === String(selectedMemberId));
                        if (!resident) return setError('Selected resident not found');
                        
                        // Check if resident is already a head of household
                        const isAlreadyHead = existingHouseholds.some(household => 
                          household.head_resident_id === resident.id || household.headResidentId === resident.id
                        );
                        if (isAlreadyHead) {
                          return setError(`⚠️ This resident is already a Head of Household in another household. Cannot add as member.`);
                        }
                        
                        // Check if resident is already a member of another household
                        if (resident.household_no && resident.household_no.trim() !== '') {
                          const isAlreadyMember = existingHouseholds.some(household => 
                            household.household_no === resident.household_no || 
                            household.householdId === resident.household_no ||
                            (household.id && resident.household_no)
                          );
                          if (isAlreadyMember) {
                            return setError(`⚠️ This resident is already a member of another household. Cannot add again.`);
                          }
                        }
                        
                        setMembers(prev => [...prev, {
                          id: resident.id,
                          resident_id: resident.resident_id,
                          name: `${resident.first_name || ''} ${resident.middle_name ? resident.middle_name + ' ' : ''}${resident.last_name || ''}${resident.name_suffix ? ' ' + resident.name_suffix : ''}`.trim(),
                          contactNumber: resident.mobile_number || resident.contact_number || '',
                          email: resident.email || '',
                          age: resident.age || '',
                          civilStatus: resident.civil_status || '',
                          gender: resident.sex || '',
                        }]);
                        setSelectedMemberId('');
                        setError(null);
                      }}
                      className="px-6 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl w-full md:w-auto font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <PlusIcon className="w-5 h-5" />
                      Add Member
                    </button>
                  </div>
                </div>

                  <div className="space-y-4">
                    {/* Display Head of Household if selected */}
                    {headResidentId && (
                      <div className="flex items-center justify-between gap-4 border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                            <UserIcon className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-lg text-gray-900 flex items-center gap-2 mb-1">
                              <span>{fullName || 'N/A'}</span>
                              {headResidentCode && <span className="text-xs font-mono text-gray-600 bg-white px-2 py-1 rounded-lg shadow-sm"> — {headResidentCode}</span>}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center gap-2">
                              <PhoneIcon className="w-4 h-4" />
                              <span>{contactNumber || '—'}</span>
                              <span className="text-gray-400">·</span>
                              <EnvelopeIcon className="w-4 h-4" />
                              <span>{email || '—'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-green-700 bg-green-200 px-4 py-2 rounded-full shadow-md">Head</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Display additional members */}
                    {members.length === 0 ? (
                      <div className="text-center py-12 text-gray-400 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                        <UserGroupIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm font-semibold">
                          {headResidentId ? 'No additional members added yet.' : 'No members added yet.'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Use the search above to add members</p>
                      </div>
                    ) : (
                      members.map(m => (
                        <div key={m.id} className="flex items-center justify-between gap-4 border-2 border-gray-200 bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                              <UserIcon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-base text-gray-900 mb-1">{m.name} {m.resident_id ? <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded-lg"> — {m.resident_id}</span> : null}</div>
                              <div className="text-sm text-gray-600 flex items-center gap-2">
                                <PhoneIcon className="w-4 h-4" />
                                <span>{m.contactNumber || '—'}</span>
                                <span className="text-gray-400">·</span>
                                <EnvelopeIcon className="w-4 h-4" />
                                <span>{m.email || '—'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {m.age && <div className="text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg shadow-sm">{m.age} yrs</div>}
                            <button 
                              type="button" 
                              onClick={() => setMembers(prev => prev.filter(x => String(x.id) !== String(m.id)))} 
                              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-semibold transition-all duration-300 shadow-sm hover:shadow-md"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-5 border-2 border-green-200 shadow-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-base font-bold text-gray-800">Total Household Count:</span>
                      <span className="text-2xl font-black text-green-700">
                        {(() => {
                          const headCount = headResidentId ? 1 : 0;
                          const totalCount = headCount + members.length;
                          return totalCount;
                        })()} / {householdSize}
                      </span>
                    </div>
                    {headResidentId && (
                      <p className="text-sm text-green-700 flex items-center gap-2 font-medium">
                        <InformationCircleIcon className="w-4 h-4" />
                        <span>Includes Head of Household</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200/70 shadow-lg">
                <label className="block text-base font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <PhoneIcon className="w-5 h-5 text-green-600" />
                  Contact Number
                  {headResidentId && contactNumber && (
                    <span className="text-xs font-normal text-green-600 flex items-center gap-1">
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>Auto-filled</span>
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={contactNumber}
                  onChange={(e) => {
                    if (!headResidentId) {
                      setContactNumber(e.target.value);
                    }
                  }}
                  readOnly={!!headResidentId}
                  className={`w-full px-5 py-4 border-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    headResidentId && contactNumber 
                      ? 'border-green-300 bg-green-50/70 cursor-not-allowed shadow-md' 
                      : headResidentId
                      ? 'border-gray-200 bg-gray-100 cursor-not-allowed'
                      : 'border-green-200 focus:ring-4 focus:ring-green-500/30 focus:border-green-500 bg-white shadow-md hover:shadow-lg'
                  }`}
                  placeholder="Enter contact number"
                />
                {headResidentId && contactNumber && (
                  <p className="text-sm text-green-600 mt-3 flex items-center gap-2 font-semibold">
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>Auto-filled (read-only)</span>
                  </p>
                )}
                {headResidentId && !contactNumber && (
                  <p className="text-sm text-orange-600 mt-3 flex items-center gap-2 font-semibold">
                    <ExclamationTriangleIcon className="w-4 h-4" />
                    <span>Contact number not found</span>
                  </p>
                )}
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200/70 shadow-lg">
                <label className="block text-base font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <EnvelopeIcon className="w-5 h-5 text-green-600" />
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-4 border-2 border-green-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-green-500/30 focus:border-green-500 transition-all duration-300 bg-white shadow-md hover:shadow-lg"
                  placeholder="Enter email address"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5 shadow-lg">
                <p className="text-sm font-semibold text-red-800 flex items-center gap-3">
                  <ExclamationCircleIcon className="w-6 h-6 flex-shrink-0" />
                  <span>{error}</span>
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-8 border-t-2 border-gray-200">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-8 py-3.5 text-gray-700 bg-white hover:bg-gray-50 border-2 border-gray-200 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || !isValid()}
                className={`px-8 py-3.5 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 ${
                  isSaving || !isValid() 
                    ? 'opacity-60 cursor-not-allowed transform-none' 
                    : 'hover:from-green-700 hover:via-emerald-700 hover:to-teal-700'
                }`}
              >
                {isSaving ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <PlusIcon className="w-5 h-5" />
                    Create Household
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default CreateHousehold;
