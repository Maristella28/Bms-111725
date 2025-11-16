import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import api from '../../utils/axiosConfig';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  EyeIcon,
  XMarkIcon,
  FunnelIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  UserIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  ExclamationCircleIcon,
  PlayIcon,
  QuestionMarkCircleIcon,
  LightBulbIcon,
  BookOpenIcon,
} from "@heroicons/react/24/solid";

// Import help components
import HouseholdHelpGuide from "./modules/household-record/components/HouseholdHelpGuide";
import HouseholdQuickStartGuide from "./modules/household-record/components/HouseholdQuickStartGuide";
import HouseholdFAQ from "./modules/household-record/components/HouseholdFAQ";
import HouseholdHelpTooltip, { 
  HouseholdQuickHelpButton, 
  HouseholdHelpIcon, 
  HouseholdFeatureExplanation,
  householdFeatureExplanations 
} from "./modules/household-record/components/HouseholdHelpTooltip";

// Import Survey Trigger Button
import HouseholdSurveyTriggerButton from "./modules/household-record/components/HouseholdSurveyTriggerButton";

const StatCard = ({ label, value, icon, iconBg, gradient, delay = 0 }) => (
  <div 
    className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 flex justify-between items-center group"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex-1 min-w-0">
      <div className="text-xs sm:text-sm font-medium text-gray-600 truncate">{label}</div>
      <div className={`text-lg sm:text-2xl lg:text-3xl font-bold ${gradient || 'text-green-600 group-hover:text-emerald-600 transition'}`}>{value}</div>
    </div>
    <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}>
      {icon}
    </div>
  </div>
);

const badge = (text, color, icon = null) => (
  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${color}`}>
    {icon && icon}
    {text}
  </span>
);

const getDocumentTypeColor = (type) => {
  switch (type) {
    case 'Brgy Clearance':
      return 'bg-blue-100 text-blue-800';
    case 'Cedula':
      return 'bg-green-100 text-green-800';
    case 'Brgy Indigency':
      return 'bg-purple-100 text-purple-800';
    case 'Brgy Residency':
      return 'bg-orange-100 text-orange-800';
    case 'Brgy Business Permit':
      return 'bg-pink-100 text-pink-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getDocumentTypeIcon = (type) => {
  switch (type) {
    case 'Brgy Clearance':
      return <UserIcon className="w-3 h-3" />;
    case 'Cedula':
      return <UserIcon className="w-3 h-3" />;
    case 'Brgy Indigency':
      return <UserIcon className="w-3 h-3" />;
    case 'Brgy Residency':
      return <UserIcon className="w-3 h-3" />;
    case 'Brgy Business Permit':
      return <UserIcon className="w-3 h-3" />;
    default:
      return <UserIcon className="w-3 h-3" />;
  }
};

// No predefined records — fetch from backend on mount

const HouseholdRecords = () => {
  const navigate = useNavigate();
  const [recordsState, setRecordsState] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [residents, setResidents] = useState([]);
  const [residentSearch, setResidentSearch] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [householdMembers, setHouseholdMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [memberToAdd, setMemberToAdd] = useState('');
  const [memberSearchInView, setMemberSearchInView] = useState('');
  
  // Help system state
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showFeatureExplanation, setShowFeatureExplanation] = useState(false);
  const [currentFeatureExplanation, setCurrentFeatureExplanation] = useState(null);

  // debounce search input (300ms)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // update filteredRecords when debouncedSearch or recordsState changes
  useEffect(() => {
    const q = debouncedSearch.toLowerCase();
    setFilteredRecords(
      recordsState.filter((record) => {
        const name = (record && record.name) ? String(record.name).toLowerCase() : '';
        const householdId = (record && record.householdId) ? String(record.householdId).toLowerCase() : '';
        const docType = (record && record.documentType) ? String(record.documentType).toLowerCase() : '';
        return name.includes(q) || householdId.includes(q) || docType.includes(q);
      })
    );
  }, [debouncedSearch, recordsState]);

  // fetch households from backend on mount
  useEffect(() => {
    let mounted = true;
    const fetchHouseholds = async () => {
      setLoading(true);
      try {
        const res = await api.get('/admin/households');
        if (!mounted) return;
        // normalize to frontend shape and tolerate different API shapes
        const raw = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
            ? res.data
            : Array.isArray(res.data?.households)
              ? res.data.households
              : [];
        const list = raw.map(h => {
          const head = h.head_resident || h.head || null;
          const name = head ? `${head.first_name || head.firstName || ''} ${head.last_name || head.lastName || ''}`.trim() : (h.head_resident_name || h.head_name || h.name || '');
          
          // ALWAYS use members_count from database - backend now recalculates this from actual members
          // This ensures the displayed size always matches the actual database value
          const householdSize = h.members_count !== undefined && h.members_count !== null 
            ? Number(h.members_count) 
            : (h.membersCount !== undefined ? Number(h.membersCount) : 0);
          
          return {
            id: h.id,
            householdId: h.household_no || h.householdId || h.householdNo || '',
            address: h.address || h.current_address || '',
            // Use database members_count - this is the source of truth
            householdSize: householdSize,
            head_resident_id: h.head_resident_id || h.headResidentId || null,
            name: name || '',
            householdHead: name || '',
            contactNumber: head ? (head.mobilenumber || head.mobile_number || head.contact_number || '') : (h.contactNumber || h.mobilenumber || ''),
            email: head ? (head.email || '') : (h.email || ''),
            nationalId: head ? (head.national_id || head.nationalId || '') : (h.nationalId || h.national_id || ''),
            age: head ? (head.age || '') : (h.age || ''),
            civilStatus: head ? (head.civil_status || head.civilStatus || '') : (h.civilStatus || h.civil_status || ''),
            gender: head ? (head.gender || head.sex || '') : (h.gender || h.sex || ''),
            documentType: h.document_type || h.documentType || '',
          };
        });
        setRecordsState(list);
        setLastRefresh(new Date());
        setToastMessage({
          type: 'success',
          message: `✅ Loaded ${list.length} household records successfully`,
          duration: 2000
        });
      } catch (err) {
        console.warn('Could not fetch households', err?.response?.data || err.message);
        setToastMessage({
          type: 'error',
          message: '❌ Failed to load household records',
          duration: 3000
        });
      } finally {
        setLoading(false);
      }
    };
    fetchHouseholds();
    return () => { mounted = false; };
  }, []);

  // Auto-update household size when members are added/removed
  useEffect(() => {
    if (showModal && editData.id && selectedMembers.length >= 0) {
      // Calculate actual household size from selected members
      const headId = editData.head_resident_id ? Number(editData.head_resident_id) : null;
      const normalizedMembers = selectedMembers
        .map(id => Number(id))
        .filter(id => id && !isNaN(id) && id > 0);
      
      let finalMembers = normalizedMembers;
      if (headId && !normalizedMembers.includes(headId)) {
        finalMembers = [...normalizedMembers, headId];
      }
      finalMembers = [...new Set(finalMembers)];
      
      const actualSize = finalMembers.length;
      const currentSize = typeof editData.householdSize === 'number' 
        ? editData.householdSize 
        : Number(editData.householdSize) || 0;
      
      // Update household size if it doesn't match the actual member count
      // Only update if there's a meaningful difference to avoid unnecessary updates
      if (actualSize > 0 && actualSize !== currentSize) {
        setEditData(prev => ({
          ...prev,
          householdSize: actualSize
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMembers, editData.head_resident_id]);

  // validation: need either selected resident to promote or a provided name, plus householdSize >= 1
  // Note: householdSize must be at least 1 because the Head of Household counts as one member
  useEffect(() => {
    const hasName = editData.name && String(editData.name).trim().length > 0;
    const hasResident = !!editData.head_resident_id;
    const size = typeof editData.householdSize === 'number' ? editData.householdSize : Number(editData.householdSize) || 0;
    // Household size must be at least 1 (the head themselves)
    const sizeOk = size >= 1;
    setIsFormValid(Boolean((hasResident || hasName) && sizeOk));
  }, [editData]);

  // Debug: Monitor address changes in editData
  useEffect(() => {
    if (editData.head_resident_id && editData.address) {
      console.log('🟡 Address in editData:', {
        head_resident_id: editData.head_resident_id,
        address: editData.address,
        addressLength: editData.address.length,
      });
    }
  }, [editData.address, editData.head_resident_id]);

  const handleShowDetails = async (record) => {
    if (selectedRecord?.id === record.id) {
      setSelectedRecord(null);
      setHouseholdMembers([]);
    } else {
      setSelectedRecord(record);
      // Fetch all members of this household
      const householdNo = record.householdId || record.household_no;
      
      // Primary method: Fetch from household API which includes all_members (direct query)
      if (record.id) {
        try {
          const res = await api.get(`/admin/households/${record.id}`);
          const household = res.data?.household || res.data;
          
          if (household) {
            // Prioritize all_members (direct query result) over residents relationship
            // all_members should contain ALL residents with matching household_no
            const apiMembers = household.all_members || household.residents || [];
            
            // Convert to array and ensure we have valid members
            const allMembers = Array.isArray(apiMembers) ? apiMembers.filter(m => m && m.id) : [];
            
            // Remove duplicates based on id
            const uniqueMembers = [];
            const seenIds = new Set();
            allMembers.forEach(m => {
              if (m && m.id && !seenIds.has(m.id)) {
                seenIds.add(m.id);
                uniqueMembers.push(m);
              }
            });
            
            // Ensure head is first
            const headId = record.head_resident_id;
            const sortedMembers = uniqueMembers.sort((a, b) => {
              if (a.id === headId) return -1;
              if (b.id === headId) return 1;
              return 0;
            });
            
            const actualMemberCount = sortedMembers.length;
            const expectedCount = record.householdSize || 0;
            
            console.log('📋 Household API members:', {
              household_id: record.id,
              household_no: household.household_no,
              relationship_residents: household.residents?.length || 0,
              all_members: household.all_members?.length || 0,
              unique_members: actualMemberCount,
              expected_count: expectedCount,
              actual_count: actualMemberCount,
              needs_update: actualMemberCount !== expectedCount,
              members: sortedMembers.map(m => ({
                id: m.id,
                name: `${m.first_name || m.firstName || ''} ${m.last_name || m.lastName || ''}`.trim(),
                household_no: m.household_no,
                is_head: m.id === headId,
              })),
            });
            
            setHouseholdMembers(sortedMembers);
            
            // Auto-update household size if it doesn't match actual member count
            if (actualMemberCount > 0 && actualMemberCount !== expectedCount) {
              console.log('🔄 Auto-updating household size:', {
                household_id: record.id,
                old_size: expectedCount,
                new_size: actualMemberCount,
              });
              
              // Update selectedRecord with correct size
              setSelectedRecord(prev => ({
                ...prev,
                householdSize: actualMemberCount
              }));
              
              // Update recordsState to reflect correct size
              setRecordsState(prev => prev.map(r => 
                r.id === record.id 
                  ? { ...r, householdSize: actualMemberCount }
                  : r
              ));
              
              // Update backend to sync the household size
              setTimeout(async () => {
                try {
                  await api.put(`/admin/households/${record.id}`, {
                    members_count: actualMemberCount,
                    // Don't change other fields, just update the count
                    address: record.address,
                    head_resident_id: record.head_resident_id,
                  });
                  console.log('✅ Household size synced in backend:', actualMemberCount);
                } catch (err) {
                  console.warn('Could not sync household size in backend', err);
                }
              }, 300);
            }
          } else {
            setHouseholdMembers([]);
          }
        } catch (err) {
          console.warn('Could not fetch household from API', err);
          // Fallback: Fetch all residents and filter by household_no
          if (householdNo) {
            try {
              const residentsRes = await api.get('/admin/residents');
              const allResidents = residentsRes.data?.residents || residentsRes.data?.data || residentsRes.data || [];
              const members = Array.isArray(allResidents) 
                ? allResidents.filter(r => {
                    const rHouseholdNo = r.household_no || (r.profile && r.profile.household_no);
                    // Compare as strings to handle different formats
                    return String(rHouseholdNo) === String(householdNo);
                  })
                : [];
              
              console.log('🔍 Fallback: Fetched household members from residents:', {
                householdNo,
                totalResidents: allResidents.length,
                membersFound: members.length,
                members: members.map(m => ({
                  id: m.id,
                  name: `${m.first_name || ''} ${m.last_name || ''}`,
                  household_no: m.household_no || (m.profile && m.profile.household_no),
                }))
              });
              
              // Sort: head first, then others
              const headId = record.head_resident_id;
              const sortedMembers = members.sort((a, b) => {
                if (a.id === headId) return -1;
                if (b.id === headId) return 1;
                return 0;
              });
              
              const actualMemberCount = sortedMembers.length;
              const expectedCount = record.householdSize || 0;
              
              setHouseholdMembers(sortedMembers);
              
              // Auto-update household size if it doesn't match actual member count
              if (actualMemberCount > 0 && actualMemberCount !== expectedCount) {
                setSelectedRecord(prev => ({
                  ...prev,
                  householdSize: actualMemberCount
                }));
                setRecordsState(prev => prev.map(r => 
                  r.id === record.id 
                    ? { ...r, householdSize: actualMemberCount }
                    : r
                ));
                
                // Update backend to sync the household size
                setTimeout(async () => {
                  try {
                    await api.put(`/admin/households/${record.id}`, {
                      members_count: actualMemberCount,
                      address: record.address,
                      head_resident_id: record.head_resident_id,
                    });
                  } catch (err) {
                    console.warn('Could not sync household size in backend', err);
                  }
                }, 300);
              }
            } catch (err2) {
              console.warn('Could not fetch residents', err2);
              setHouseholdMembers([]);
            }
          } else {
            setHouseholdMembers([]);
          }
        }
      } else if (householdNo) {
        // If no household ID, try to fetch by household_no from residents
        try {
          const residentsRes = await api.get('/admin/residents');
          const allResidents = residentsRes.data?.residents || residentsRes.data?.data || residentsRes.data || [];
          const members = Array.isArray(allResidents) 
            ? allResidents.filter(r => {
                const rHouseholdNo = r.household_no || (r.profile && r.profile.household_no);
                return String(rHouseholdNo) === String(householdNo);
              })
            : [];
          
          const headId = record.head_resident_id;
          const sortedMembers = members.sort((a, b) => {
            if (a.id === headId) return -1;
            if (b.id === headId) return 1;
            return 0;
          });
          
          const actualMemberCount = sortedMembers.length;
          const expectedCount = record.householdSize || 0;
          
          setHouseholdMembers(sortedMembers);
          
          // Auto-update household size if it doesn't match actual member count
          if (actualMemberCount > 0 && actualMemberCount !== expectedCount && record.id) {
            setSelectedRecord(prev => ({
              ...prev,
              householdSize: actualMemberCount
            }));
            setRecordsState(prev => prev.map(r => 
              r.id === record.id 
                ? { ...r, householdSize: actualMemberCount }
                : r
            ));
            
            // Update backend to sync the household size
            setTimeout(async () => {
              try {
                await api.put(`/admin/households/${record.id}`, {
                  members_count: actualMemberCount,
                  address: record.address,
                  head_resident_id: record.head_resident_id,
                });
              } catch (err) {
                console.warn('Could not sync household size in backend', err);
              }
            }, 300);
          }
        } catch (err) {
          console.warn('Could not fetch residents', err);
          setHouseholdMembers([]);
        }
      } else {
        setHouseholdMembers([]);
      }
    }
  };

  const handleEdit = async (record) => {
    // work with a shallow copy so editing doesn't mutate the list until saved
    setEditData({ ...record });
    fetchResidents();
    
    // Fetch current members for this household - always fetch fresh data
    if (record.id) {
      try {
        // Add timestamp to prevent caching stale data
        const res = await api.get(`/admin/households/${record.id}?t=${Date.now()}`);
        const household = res.data?.household || res.data;
        if (household) {
          // Use all_members first (direct query), then fallback to residents relationship
          const apiMembers = household.all_members || household.residents || [];
          const memberIds = Array.isArray(apiMembers) 
            ? apiMembers.filter(m => m && m.id).map(m => Number(m.id))
            : [];
          
          // Ensure head is included if they exist (head should always be a member)
          const headId = record.head_resident_id ? Number(record.head_resident_id) : null;
          if (headId && !memberIds.includes(headId)) {
            memberIds.push(headId);
          }
          
          // Remove duplicates and ensure we only have valid IDs
          const uniqueMemberIds = [...new Set(memberIds)].filter(id => id && !isNaN(id));
          
          console.log('📋 Fetched members for edit:', {
            household_id: record.id,
            api_members_count: apiMembers.length,
            member_ids: uniqueMemberIds,
            head_id: headId,
          });
          
          setSelectedMembers(uniqueMemberIds);
        } else {
          // If no household found, at least include head if available
          setSelectedMembers(record.head_resident_id ? [Number(record.head_resident_id)] : []);
        }
      } catch (err) {
        console.warn('Could not fetch household members for edit', err);
        // At least include head if available
        setSelectedMembers(record.head_resident_id ? [Number(record.head_resident_id)] : []);
      }
    } else {
      setSelectedMembers(record.head_resident_id ? [Number(record.head_resident_id)] : []);
    }
    
    setShowModal(true);
  };

  const handleCreateHousehold = () => {
    navigate('/admin/create-household');
  };

  const fetchResidents = async () => {
    try {
      const res = await api.get('/admin/residents');
      const list = res.data.data ? res.data.data : (Array.isArray(res.data) ? res.data : (res.data.residents || []));
      
      console.log('🔍 Fetched residents data:', {
        responseStructure: Object.keys(res.data),
        firstResident: list[0],
        firstResidentKeys: list[0] ? Object.keys(list[0]) : null,
        firstResidentProfile: list[0]?.profile,
      });
      
      const mapped = list.map((r, index) => {
        // Extract address from multiple possible locations in the API response
        // The API returns Resident model with profile relationship loaded
        // Profile data might be nested or merged, so check all locations
        
        // First, check if profile is an object with nested data
        const profileAddress = r.profile ? (
          r.profile.current_address || 
          r.profile.address || 
          r.profile.full_address ||
          ''
        ) : '';
        
        // Then check direct resident fields
        const residentAddress = r.current_address || 
                               r.address || 
                               r.full_address ||
                               '';
        
        // Combine both - prioritize resident address, fallback to profile
        const address = residentAddress || profileAddress || '';
        
        // Debug logging for first few residents
        if (index < 3) {
          console.log(`📍 Address extraction for resident ${index + 1} (${r.first_name || r.firstName || 'Unknown'}):`, {
            'r.id': r.id,
            'r.current_address': r.current_address || 'NOT FOUND',
            'r.address': r.address || 'NOT FOUND',
            'r.full_address': r.full_address || 'NOT FOUND',
            'r.profile': r.profile ? (typeof r.profile === 'object' ? 'object exists' : r.profile) : 'null',
            'r.profile?.current_address': r.profile?.current_address || 'NOT FOUND',
            'r.profile?.address': r.profile?.address || 'NOT FOUND',
            'r.profile?.full_address': r.profile?.full_address || 'NOT FOUND',
            'profileAddress': profileAddress || 'NOT FOUND',
            'residentAddress': residentAddress || 'NOT FOUND',
            'final_extracted_address': address || 'NOT FOUND',
            'all_r_keys': Object.keys(r),
            'profile_keys': r.profile ? Object.keys(r.profile) : [],
          });
        }
        
        return {
          id: r.id,
          // external resident identifier (resident_id column) used for display
          resident_id: r.resident_id || r.residentId || r.resident_no || '',
          first_name: r.first_name || r.firstName || r.name || '',
          last_name: r.last_name || r.lastName || '',
          household_no: r.household_no || (r.profile && r.profile.household_no) || null,
          // prefer `mobilenumber` if the API uses that field name; fall back to other variants
          contactNumber: r.mobile_number || r.mobile_number || r.contact_number || r.contactNumber || r.phone || '',
          email: r.email || r.contactEmail || '',
          // demographic fields
          age: r.age || r.years_old || (r.profile && r.profile.age) || '',
          civilStatus: r.civil_status || r.civilStatus || (r.profile && r.profile.civil_status) || '',
          gender: r.gender || r.sex || (r.profile && r.profile.gender) || '',
          // address field - comprehensive extraction from all possible locations
          address: address,
        };
      });
      
      console.log('✅ Mapped residents with addresses:', mapped.slice(0, 3).map(r => ({
        name: `${r.first_name} ${r.last_name}`,
        address: r.address || 'NO ADDRESS',
      })));
      
      setResidents(mapped);
      // If modal was opened for an existing household that already has a head_resident_id,
      // prefill the display code and contact/email fields so the modal shows the values.
      if (editData && editData.head_resident_id) {
        const found = mapped.find(m => m.id === Number(editData.head_resident_id));
        if (found) {
          setEditData((prev) => ({
            ...prev,
            head_resident_code: found.resident_id || prev.head_resident_code || '',
            contactNumber: prev.contactNumber || found.contactNumber || '',
            email: prev.email || found.email || '',
            address: prev.address || found.address || '',
          }));
        }
      }
    } catch (err) {
      console.warn('Could not fetch residents', err?.response?.data || err.message);
      setResidents([]);
    }
  };

  // fetch residents on mount so we can resolve head_resident_id to a display name
  useEffect(() => {
    fetchResidents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // when residents or households change, enrich households with resident info if missing
  useEffect(() => {
    if (!residents || residents.length === 0 || !recordsState || recordsState.length === 0) return;
    let updated = false;
    const enriched = recordsState.map(r => {
      if ((!r.name || r.name === '') && r.head_resident_id) {
        const found = residents.find(x => Number(x.id) === Number(r.head_resident_id));
        if (found) {
          updated = true;
          return {
            ...r,
            name: `${found.first_name || ''} ${found.last_name || ''}`.trim(),
            householdHead: `${found.first_name || ''} ${found.last_name || ''}`.trim(),
            contactNumber: r.contactNumber || found.contactNumber || '',
                email: r.email || found.email || '',
                age: r.age || found.age || '',
                civilStatus: r.civilStatus || found.civilStatus || '',
                gender: r.gender || r.sex || found.gender || found.sex || '',
          };
        }
      }
      return r;
    });
    if (updated) setRecordsState(enriched);
  }, [residents, recordsState]);

  const handleResidentSelect = async (e) => {
    const val = e.target.value;
    if (!val) {
      // cleared selection
      setEditData({ ...editData, head_resident_id: null, name: '', contactNumber: '', email: '', address: '' });
      return;
    }
    const id = Number(val);
    const resident = residents.find(r => r.id === id);
    if (!resident) {
      setEditData({ ...editData, head_resident_id: id });
      return;
    }
    
    // Check if this resident is already a head of household in another household
    const isAlreadyHead = recordsState.some(record => 
      record.head_resident_id === resident.id && record.id !== editData.id
    );
    
    if (isAlreadyHead) {
      setToastMessage({
        type: 'error',
        message: `⚠️ This resident is already a Head of Household in another household. Please select a different resident.`,
        duration: 4000
      });
      // Reset selection
      setEditData({ ...editData, head_resident_id: null, name: '', contactNumber: '', email: '', address: '' });
      return;
    }
    
    // Check if this resident is already a member of another household
    if (resident.household_no && resident.household_no.trim() !== '') {
      const isAlreadyMember = recordsState.some(record => 
        record.householdId === resident.household_no && record.id !== editData.id
      );
      if (isAlreadyMember) {
        setToastMessage({
          type: 'error',
          message: `⚠️ This resident is already a member of another household. Please select a different resident.`,
          duration: 4000
        });
        // Reset selection
        setEditData({ ...editData, head_resident_id: null, name: '', contactNumber: '', email: '', address: '' });
        return;
      }
    }
    
    // Automatically fill address from resident's record
    let residentAddress = resident.address || '';
    
    // If address is not found in the mapped resident, try to fetch from profile endpoint
    if (!residentAddress && resident.id) {
      console.log('⚠️ Address not found in mapped resident, attempting to fetch from profile...');
      try {
        // Try to get the resident's profile which should have the address
        // Use the resident's user_id if available, or try the profile endpoint
        const profileRes = await api.get(`/profile/${resident.id}`).catch(() => null);
        if (profileRes?.data) {
          const profileData = profileRes.data.profile || profileRes.data.user?.profile || profileRes.data;
          const extractedAddress = profileData.current_address || 
                                  profileData.address || 
                                  profileData.full_address || '';
          
          if (extractedAddress) {
            residentAddress = extractedAddress;
            console.log('✅ Found address from profile endpoint:', residentAddress);
          }
        }
      } catch (err) {
        console.warn('Could not fetch profile details:', err);
      }
    }
    
    // Ensure household size is at least 1 (the head themselves)
    const currentSize = editData.householdSize || 0;
    const minSize = 1; // Head of household counts as one member
    
    // Log for debugging
    console.log('🔵 Selected resident:', {
      id: resident.id,
      name: `${resident.first_name} ${resident.last_name}`,
      residentObject: resident,
      address: residentAddress,
      hasAddress: !!residentAddress,
      addressLength: residentAddress ? residentAddress.length : 0,
      allResidentsCount: residents.length,
    });
    
    // Create updated edit data with address - FORCE the address to be set
    // Use functional update to ensure React properly detects the change
    setEditData(prev => {
      const updated = {
        ...prev,
        // FK used for backend associations
        head_resident_id: resident.id,
        // external resident id (human-readable) for display only
        head_resident_code: resident.resident_id || resident.residentId || '',
        name: `${resident.first_name} ${resident.last_name}`.trim(),
        contactNumber: resident.contactNumber || prev.contactNumber || '',
        email: resident.email || prev.email || '',
        age: resident.age || prev.age || '',
        civilStatus: resident.civilStatus || prev.civilStatus || '',
        gender: resident.gender || prev.gender || '',
        // Automatically populate address from resident's record - prioritize residentAddress
        address: residentAddress || prev.address || '',
        // Ensure household size is at least 1 (includes the head)
        householdSize: (prev.householdSize || 0) < minSize ? minSize : (prev.householdSize || minSize),
      };
      
      console.log('🟢 Setting editData with address:', {
        address: updated.address,
        hasAddress: !!updated.address,
        addressValue: updated.address,
        residentAddress: residentAddress,
        prevAddress: prev.address,
      });
      
      return updated;
    });
    
    // Show success message if address was auto-filled
    if (residentAddress) {
      setToastMessage({
        type: 'success',
        message: `✅ Address automatically filled from ${resident.first_name} ${resident.last_name}'s record`,
        duration: 3000
      });
    } else {
      // Show warning if address is not available
      setToastMessage({
        type: 'error',
        message: `⚠️ Address not found for ${resident.first_name} ${resident.last_name}. Please enter manually.`,
        duration: 3000
      });
    }
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    // Re-fetch data
    const fetchHouseholds = async () => {
      try {
        const res = await api.get('/admin/households');
        const raw = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
            ? res.data
            : Array.isArray(res.data?.households)
              ? res.data.households
              : [];
        const list = raw.map(h => {
          const head = h.head_resident || h.head || null;
          const name = head ? `${head.first_name || head.firstName || ''} ${head.last_name || head.lastName || ''}`.trim() : (h.head_resident_name || h.head_name || h.name || '');
          
          // ALWAYS use members_count from database - backend now recalculates this from actual members
          const householdSize = h.members_count !== undefined && h.members_count !== null 
            ? Number(h.members_count) 
            : (h.membersCount !== undefined ? Number(h.membersCount) : 0);
          
          return {
            id: h.id,
            householdId: h.household_no || h.householdId || h.householdNo || '',
            address: h.address || h.current_address || '',
            // Use database members_count - this is the source of truth
            householdSize: householdSize,
            head_resident_id: h.head_resident_id || h.headResidentId || null,
            name: name || '',
            householdHead: name || '',
            contactNumber: head ? (head.mobilenumber || head.mobile_number || head.contact_number || '') : (h.contactNumber || h.mobilenumber || ''),
            email: head ? (head.email || '') : (h.email || ''),
            nationalId: head ? (head.national_id || head.nationalId || '') : (h.nationalId || h.national_id || ''),
            age: head ? (head.age || '') : (h.age || ''),
            civilStatus: head ? (head.civil_status || head.civilStatus || '') : (h.civilStatus || h.civil_status || ''),
            gender: head ? (head.gender || head.sex || '') : (h.gender || h.sex || ''),
            documentType: h.document_type || h.documentType || '',
          };
        });
        setRecordsState(list);
        setLastRefresh(new Date());
        setToastMessage({
          type: 'success',
          message: `🔄 Refreshed ${list.length} household records`,
          duration: 2000
        });
      } catch (err) {
        console.warn('Could not refresh households', err?.response?.data || err.message);
        setToastMessage({
          type: 'error',
          message: '❌ Failed to refresh household records',
          duration: 3000
        });
      } finally {
        setIsRefreshing(false);
      }
    };
    fetchHouseholds();
  };

  const handleSave = async () => {
    if (!isFormValid) return;
    setIsSaving(true);

    // If editData has an id -> update, otherwise create new
    if (editData.id) {
      try {
        // Ensure all member IDs are numbers and valid
        const normalizedMembers = selectedMembers
          .map(id => Number(id))
          .filter(id => id && !isNaN(id) && id > 0);
        
        // Ensure head is always included in members array (if head exists)
        const headId = editData.head_resident_id ? Number(editData.head_resident_id) : null;
        let finalMembers = normalizedMembers;
        
        if (headId && !normalizedMembers.includes(headId)) {
          finalMembers = [...normalizedMembers, headId];
        }
        
        // Remove duplicates
        finalMembers = [...new Set(finalMembers)];
        
        // Calculate actual household size from final members array
        // This ensures household size always matches the number of selected members
        const actualHouseholdSize = finalMembers.length;
        
        console.log('💾 Saving household with members:', {
          household_id: editData.id,
          selected_members: selectedMembers,
          normalized_members: normalizedMembers,
          head_id: headId,
          final_members: finalMembers,
          actual_household_size: actualHouseholdSize,
          form_household_size: editData.householdSize,
        });
        
        // Build payload with proper null handling (no empty strings)
        const payload = {
          address: editData.address && editData.address.trim() ? editData.address.trim() : null,
          // Use actual count from members array, not form input
          // This ensures household size matches the actual number of members
          members_count: actualHouseholdSize > 0 ? actualHouseholdSize : (editData.householdSize ? Number(editData.householdSize) : 1),
          head_resident_id: editData.head_resident_id ? Number(editData.head_resident_id) : null,
        };
        
        // Always send members array - this tells backend which members should remain
        // Backend will clear household_no for members not in this array
        // Include all selected members (head is already included in finalMembers)
        payload.members = finalMembers.length > 0 ? finalMembers : [];
        
        // Only include mobilenumber if it exists and is not empty
        if (editData.contactNumber && editData.contactNumber.trim()) {
          payload.mobilenumber = editData.contactNumber.trim();
        }
        
        console.log('📤 Sending payload to backend:', payload);
        
        // Use a longer timeout for household updates (60 seconds)
        const res = await api.put(`/admin/households/${editData.id}`, payload, {
          timeout: 60000 // 60 seconds for household updates
        });
        const updated = res.data.household;
        
        console.log('✅ Backend response:', {
          updated_household: updated,
          members_count_from_backend: updated.members_count,
          actual_household_size_calculated: actualHouseholdSize,
          final_members_array: finalMembers,
          final_members_count: finalMembers.length,
        });
        
        // Update recordsState immediately with response data
        // Find the head resident from existing residents list to get name
        const headResident = residents.find(r => r.id === updated.head_resident_id);
        const headName = headResident 
          ? `${headResident.first_name || ''} ${headResident.last_name || ''}`.trim()
          : (updated.head_resident_name || updated.head_name || '');
        
        // Use the actual household size we calculated (most reliable)
        // This ensures the table shows the correct count immediately
        const finalHouseholdSize = actualHouseholdSize > 0 
          ? actualHouseholdSize 
          : (updated.members_count > 0 ? updated.members_count : finalMembers.length);
        
        // Update recordsState with the correct household size
        setRecordsState((prev) => {
          const oldRecord = prev.find(r => r.id === updated.id);
          console.log('📊 Updating household size in table:', {
            household_id: updated.id,
            old_size: oldRecord?.householdSize,
            new_size: finalHouseholdSize,
            source: actualHouseholdSize > 0 ? 'calculated' : 'backend',
            final_members_count: finalMembers.length,
          });
          
          return prev.map((r) => (r.id === updated.id ? {
            ...r,
            householdId: updated.household_no || r.householdId,
            address: updated.address || r.address,
            // ALWAYS use the calculated size - it's the most accurate
            householdSize: finalHouseholdSize,
            head_resident_id: updated.head_resident_id || r.head_resident_id,
            name: headName || r.name,
            householdHead: headName || r.householdHead,
            contactNumber: headResident?.contactNumber || updated.mobilenumber || r.contactNumber,
            email: headResident?.email || updated.email || r.email,
          } : r));
        });
        
        // Refresh household members in background if viewing this household (non-blocking)
        if (selectedRecord?.id === editData.id) {
          // Use setTimeout to make this non-blocking
          setTimeout(async () => {
            try {
              const res = await api.get(`/admin/households/${updated.id}?t=${Date.now()}`);
              const household = res.data?.household || res.data;
              if (household) {
                const apiMembers = household.all_members || household.residents || [];
                const allMembers = Array.isArray(apiMembers) ? apiMembers.filter(m => m && m.id) : [];
                
                // Ensure head is first
                const headId = updated.head_resident_id;
                const sortedMembers = allMembers.sort((a, b) => {
                  if (a.id === headId) return -1;
                  if (b.id === headId) return 1;
                  return 0;
                });
                
                setHouseholdMembers(sortedMembers);
              }
            } catch (err) {
              console.warn('Could not refresh household members', err);
            }
          }, 100);
          
          setSelectedRecord((s) => ({ ...s, ...editData }));
        }
        
        // Refresh the entire household list in background to ensure accuracy
        setTimeout(async () => {
          try {
            const refreshRes = await api.get('/admin/households?t=' + Date.now());
            const raw = Array.isArray(refreshRes.data?.data)
              ? refreshRes.data.data
              : Array.isArray(refreshRes.data)
                ? refreshRes.data
                : Array.isArray(refreshRes.data?.households)
                  ? refreshRes.data.households
                  : [];
            const refreshedList = raw.map(h => {
              const head = h.head_resident || h.head || null;
              const name = head ? `${head.first_name || head.firstName || ''} ${head.last_name || head.lastName || ''}`.trim() : (h.head_resident_name || h.head_name || h.name || '');
              
              // ALWAYS use members_count from database - backend now recalculates this from actual members
              const householdSize = h.members_count !== undefined && h.members_count !== null 
                ? Number(h.members_count) 
                : (h.membersCount !== undefined ? Number(h.membersCount) : 0);
              
              return {
                id: h.id,
                householdId: h.household_no || h.householdId || h.householdNo || '',
                address: h.address || h.current_address || '',
                // Use database members_count - this is the source of truth
                householdSize: householdSize,
                head_resident_id: h.head_resident_id || h.headResidentId || null,
                name: name || '',
                householdHead: name || '',
                contactNumber: head ? (head.mobilenumber || head.mobile_number || head.contact_number || '') : (h.contactNumber || h.mobilenumber || ''),
                email: head ? (head.email || '') : (h.email || ''),
                nationalId: head ? (head.national_id || head.nationalId || '') : (h.nationalId || h.national_id || ''),
                age: head ? (head.age || '') : (h.age || ''),
                civilStatus: head ? (head.civil_status || head.civilStatus || '') : (h.civilStatus || h.civil_status || ''),
                gender: head ? (head.gender || head.sex || '') : (h.gender || h.sex || ''),
                documentType: h.document_type || h.documentType || '',
              };
            });
            
            // Always update with refreshed data to ensure accuracy
            const refreshedHousehold = refreshedList.find(h => h.id === updated.id);
            console.log('🔄 Refreshing household list from backend:', {
              calculated_size: finalHouseholdSize,
              backend_size: refreshedHousehold?.householdSize,
              match: refreshedHousehold?.householdSize === finalHouseholdSize,
            });
            
            // Update the entire list with fresh data from backend
            setRecordsState(refreshedList);
            setLastRefresh(new Date());
          } catch (refreshErr) {
            console.warn('Could not refresh household list', refreshErr);
          }
        }, 500);
        
        setToastMessage({
          type: 'success',
          message: '✅ Household record updated successfully',
          duration: 2000
        });
      } catch (err) {
        console.error('Failed to update household', {
          error: err,
          response: err?.response,
          data: err?.response?.data,
          status: err?.response?.status,
        });
        
        // Extract error message from Laravel validation errors
        let errorMessage = 'Failed to update household record';
        
        if (err?.response?.data) {
          const errorData = err?.response?.data;
          
          // Check for Laravel validation errors
          if (errorData.errors && typeof errorData.errors === 'object') {
            const validationErrors = Object.values(errorData.errors).flat();
            errorMessage = validationErrors.length > 0 
              ? validationErrors.join(', ') 
              : errorMessage;
          }
          // Check for custom error message
          else if (errorData.message) {
            errorMessage = errorData.message;
          }
          // Check for error string
          else if (typeof errorData === 'string') {
            errorMessage = errorData;
          }
        } else if (err?.message) {
          errorMessage = err.message;
        }
        
        // Handle timeout errors specifically
        if (err?.code === 'ECONNABORTED' || err?.message?.includes('timeout')) {
          errorMessage = 'Request timed out. The operation may still be processing. Please refresh the page to check if the update was successful.';
        }
        
        // Determine if it's a warning or error
        const isWarning = err?.response?.data?.error === 'duplicate_head' || 
                         err?.response?.data?.error === 'duplicate_member';
        
        setToastMessage({
          type: 'error',
          message: isWarning ? `⚠️ ${errorMessage}` : `❌ ${errorMessage}`,
          duration: 6000 // Longer duration for timeout errors
        });
      }
    } else {
      try {
        const payload = {
          household_no: editData.householdId || `HH-${Date.now().toString().slice(-6)}`,
          address: editData.address || null,
          head_resident_id: editData.head_resident_id || null,
          members_count: editData.householdSize || 1,
          // include contact number using backend field name (mobilenumber)
          mobilenumber: editData.contactNumber || null,
        };
        const res = await api.post('/admin/households', payload);
        const created = res.data.household;
        const newRecord = {
          id: created.id,
          householdId: created.household_no,
          address: created.address,
          householdSize: created.members_count,
          head_resident_id: created.head_resident_id,
        };
        setRecordsState((prev) => [newRecord, ...prev]);
        setToastMessage({
          type: 'success',
          message: '✅ New household record created successfully',
          duration: 2000
        });
      } catch (err) {
        console.warn('Failed to create household', err?.response?.data || err.message);
        setToastMessage({
          type: 'error',
          message: '❌ Failed to create household record',
          duration: 3000
        });
      }
    }

    setIsSaving(false);
    setShowModal(false);
    setEditData({});
    setSelectedMembers([]);
    setMemberSearch('');
  };

  const getStatusCount = (status) => {
    return recordsState.filter((record) => record.documentType === status).length;
  };

  // derived stats from recordsState
  const totalHouseholds = recordsState.length;
  const totalMembers = recordsState.reduce((sum, r) => sum + (Number(r.householdSize) || 0), 0);

  // filter residents by search term (name, resident id, or household no)
  // Also exclude residents who are already heads of household or members (unless editing the same household)
  const filteredResidents = residents.filter((r) => {
    const q = residentSearch.trim().toLowerCase();
    
    // Check if resident is already a head of household in another household
    const isAlreadyHead = recordsState.some(record => 
      record.head_resident_id === r.id && record.id !== editData.id
    );
    
    // Exclude residents who are already heads (unless we're editing the same household)
    if (isAlreadyHead) return false;
    
    // Check if resident is already a member of another household
    if (r.household_no && r.household_no.trim() !== '') {
      const isAlreadyMember = recordsState.some(record => 
        record.householdId === r.household_no && record.id !== editData.id
      );
      if (isAlreadyMember) return false;
    }
    
    // Apply search filter
    if (!q) return true;
    const fullName = `${r.first_name || ''} ${r.last_name || ''}`.toLowerCase();
    const rid = (r.resident_id || '').toLowerCase();
    const hh = (r.household_no || '').toLowerCase();
    return fullName.includes(q) || rid.includes(q) || hh.includes(q);
  });

  // Toast Notification Component
  const ToastNotification = ({ message, type, onClose }) => (
    <div className={`fixed top-24 right-6 z-50 max-w-md rounded-xl shadow-2xl border-2 p-4 transition-all duration-500 transform ${
      message ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    } ${
      type === 'success'
        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800'
        : type === 'loading'
        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-800'
        : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-800'
    }`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {type === 'success' && <CheckCircleIcon className="w-5 h-5 text-green-600" />}
          {type === 'loading' && <ArrowPathIcon className="w-5 h-5 text-blue-600 animate-spin" />}
          {type === 'error' && <ExclamationCircleIcon className="w-5 h-5 text-red-600" />}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm">{message}</div>
        </div>
        {type !== 'loading' && (
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Navbar />
      <Sidebar />
      
      {/* Toast Notification */}
      {toastMessage && (
        <ToastNotification
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}
      
      <main className="bg-gradient-to-br from-green-50 to-emerald-50 min-h-screen ml-0 lg:ml-64 pt-20 lg:pt-36 px-4 pb-16 font-sans">
        <div className="w-full max-w-[98%] mx-auto space-y-8 px-2 lg:px-4">
          {/* Enhanced Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-xl mb-4">
              <HomeIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent tracking-tight px-4">
              Household Records Management
            </h1>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed px-4">
              Comprehensive management system for household records and family unit tracking with real-time updates.
            </p>
            
            {/* Help System Buttons */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-6 sm:mt-8 px-4">
              <button
                onClick={() => setShowHelpGuide(true)}
                className="inline-flex items-center gap-1 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 hover:text-green-700 transition-colors duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <BookOpenIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Help Guide</span>
                <span className="sm:hidden">Help</span>
              </button>
              <button
                onClick={() => setShowQuickStart(true)}
                className="inline-flex items-center gap-1 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <PlayIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Quick Start</span>
                <span className="sm:hidden">Start</span>
              </button>
              <button
                onClick={() => setShowFAQ(true)}
                className="inline-flex items-center gap-1 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 hover:text-purple-700 transition-colors duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <QuestionMarkCircleIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                FAQ
              </button>
            </div>
          </div>

          {/* Enhanced Analytics Dashboard */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 mb-6 sm:mb-8 w-full">
            {/* Key Performance Indicators */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-green-600 font-medium">Total Households</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-700">{totalHouseholds}</p>
                    <p className="text-xs text-green-500 mt-1">Registered families</p>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <HomeIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-2 w-full bg-green-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (totalHouseholds / 100) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-blue-600 font-medium">Total Members</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-700">{totalMembers}</p>
                    <p className="text-xs text-blue-500 mt-1">All residents</p>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <UserGroupIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (totalMembers / 500) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-purple-600 font-medium">Avg. Household Size</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-700">
                      {totalHouseholds > 0 ? Math.round(totalMembers / totalHouseholds * 10) / 10 : 0}
                    </p>
                    <p className="text-xs text-purple-500 mt-1">Members per household</p>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-2 w-full bg-purple-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, totalHouseholds > 0 ? (totalMembers / totalHouseholds / 5) * 100 : 0)}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-orange-600 font-medium">Coverage Rate</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-700">
                      {totalHouseholds > 0 ? Math.round((totalHouseholds / 200) * 100) : 0}%
                    </p>
                    <p className="text-xs text-orange-500 mt-1">Of target households</p>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-600 font-bold text-sm sm:text-base lg:text-lg">📊</span>
                  </div>
                </div>
                <div className="mt-2 w-full bg-orange-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, totalHouseholds > 0 ? (totalHouseholds / 200) * 100 : 0)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Search and Add Section */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 mb-6 sm:mb-8 w-full">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4 sm:gap-6">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full lg:w-auto">
                <button 
                  onClick={handleCreateHousehold} 
                  className="group/btn bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
                >
                  <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="truncate">Create Household</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-center w-full lg:max-w-2xl">
                <div className="relative flex-grow w-full sm:w-auto">
                  <input
                    type="text"
                    className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent rounded-xl text-xs sm:text-sm shadow-sm transition-all duration-300"
                    placeholder="Search by name, household ID, or address..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <MagnifyingGlassIcon className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 sm:left-4 top-2.5 sm:top-3.5 text-gray-400" />
                </div>
                
                <div className="flex gap-2 w-full sm:w-auto">
                  <button 
                    onClick={() => setSearch('')}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold shadow-lg transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 flex-1 sm:flex-none"
                    title="Clear search"
                  >
                    <XMarkIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Clear</span>
                  </button>
                  <button className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold shadow-lg transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 flex-1 sm:flex-none">
                    <FunnelIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Filter</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Table */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden w-full">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
              <div className="flex justify-between items-center">
                <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                  <HomeIcon className="w-5 h-5" />
                  Household Records ({filteredRecords.length})
                </h3>
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto w-full">
              <table className="w-full text-sm min-w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-gray-50 border-b-2 border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold text-slate-700 uppercase tracking-wider text-xs hidden sm:table-cell min-w-[150px]">Household ID</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-700 uppercase tracking-wider text-xs min-w-[200px]">Head of Household</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-700 uppercase tracking-wider text-xs hidden md:table-cell min-w-[100px]">Age</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-700 uppercase tracking-wider text-xs hidden lg:table-cell min-w-[140px]">Civil Status</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-700 uppercase tracking-wider text-xs hidden md:table-cell min-w-[120px]">Gender</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-700 uppercase tracking-wider text-xs min-w-[140px]">Household Size</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-700 uppercase tracking-wider text-xs min-w-[200px]">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200/60">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <ArrowPathIcon className="w-8 h-8 text-green-600 animate-spin" />
                          <p className="text-gray-600 font-medium">Loading household records...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-6">
                          <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center shadow-lg">
                            <HomeIcon className="w-12 h-12 text-slate-400" />
                          </div>
                          <div className="space-y-2">
                            <p className="text-slate-600 font-bold text-xl">No household records found</p>
                            <p className="text-slate-500 text-lg">Try adjusting your search criteria or create a new household</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record, index) => (
                      <React.Fragment key={record.id}>
                        <tr 
                          className="hover:bg-gradient-to-r hover:from-green-50/80 hover:to-emerald-50/80 transition-all duration-300 group"
                        >
                          <td className="px-6 py-4 hidden sm:table-cell">
                            <span className="font-mono text-green-700 bg-gradient-to-r from-green-100 to-emerald-100 px-3 py-1 rounded-lg text-sm font-bold shadow-sm border border-green-200">
                              {record.householdId}
                            </span>
                          </td>
                          <td
                            onClick={() => handleShowDetails(record)}
                            className="px-6 py-4 cursor-pointer group-hover:text-green-700 transition-all duration-300"
                          >
                            <div className="font-bold text-slate-900 group-hover:scale-105 transition-transform duration-300">
                              {record.name || '—'}
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 hidden md:table-cell">
                            <span className="bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 px-3 py-1 rounded-lg text-sm font-bold shadow-sm">
                              {record.age ? `${record.age} years` : '—'}
                            </span>
                          </td>
                          <td className="px-6 py-4 hidden lg:table-cell">
                            <span className="text-slate-700 font-semibold group-hover:text-green-700 transition-colors duration-300">
                              {record.civilStatus || '—'}
                            </span>
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell">
                            <span className="text-slate-700 font-semibold group-hover:text-green-700 transition-colors duration-300">
                              {record.gender || record.sex || '—'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-bold shadow-sm">
                              {record.householdSize} members
                            </span>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="flex gap-2 flex-wrap">
                              <button
                                onClick={() => handleShowDetails(record)}
                                className="group/btn bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                              >
                                <EyeIcon className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-300" />
                                <span className="hidden sm:inline">View</span>
                              </button>
                              <button
                                onClick={() => handleEdit(record)}
                                className="group/btn bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                              >
                                <PencilIcon className="w-4 h-4 group-hover/btn:rotate-12 transition-transform duration-300" />
                                <span className="hidden sm:inline">Edit</span>
                              </button>
                              
                              {/* Survey Trigger Button */}
                              <HouseholdSurveyTriggerButton 
                                household={{
                                  id: record.id,
                                  household_no: record.householdId,
                                  head_full_name: record.householdHead,
                                  address: record.address,
                                  members_count: record.householdSize,
                                  mobilenumber: record.contactNumber,
                                  email: record.email
                                }}
                                variant="icon"
                                onSuccess={(survey) => {
                                  console.log('Survey sent!', survey);
                                  // Optional: Show a success notification here
                                }}
                              />
                            </div>
                          </td>
                        </tr>

                        {selectedRecord?.id === record.id && (
                          <tr className="bg-gradient-to-r from-green-50/90 to-emerald-50/90 backdrop-blur-sm">
                            <td colSpan="7" className="px-6 py-8">
                              <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-green-200/60">
                                <div className="flex flex-col lg:flex-row gap-8 items-start">
                                  {/* Household Information Card */}
                                  <div className="flex-1 space-y-6">
                                    <div className="bg-gradient-to-br from-green-100/80 to-emerald-100/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-green-200/60 shadow-lg">
                                      <h4 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                                          <HomeIcon className="w-5 h-5 text-white" />
                                        </div>
                                        Household Information
                                      </h4>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div className="space-y-1">
                                          <span className="font-bold text-slate-600 uppercase tracking-wider text-xs">Household ID</span>
                                          <div className="text-slate-900 font-mono text-base bg-white/60 px-3 py-2 rounded-lg border border-green-200">{selectedRecord.householdId || '—'}</div>
                                        </div>
                                        <div className="space-y-1">
                                          <span className="font-bold text-slate-600 uppercase tracking-wider text-xs">Household Size</span>
                                          <div className="text-slate-900 font-bold text-base bg-white/60 px-3 py-2 rounded-lg border border-green-200">{selectedRecord.householdSize ? `${selectedRecord.householdSize} members` : '—'}</div>
                                        </div>
                                        <div className="space-y-1">
                                          <span className="font-bold text-slate-600 uppercase tracking-wider text-xs">Household Head</span>
                                          <div className="text-slate-900 font-semibold text-base bg-white/60 px-3 py-2 rounded-lg border border-green-200">{selectedRecord.householdHead || '—'}</div>
                                        </div>
                                        <div className="space-y-1">
                                          <span className="font-bold text-slate-600 uppercase tracking-wider text-xs">Address</span>
                                          <div className="text-slate-900 font-semibold text-base bg-white/60 px-3 py-2 rounded-lg border border-green-200">{selectedRecord.address || '—'}</div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Member Information Card */}
                                    <div className="bg-gradient-to-br from-blue-100/80 to-indigo-100/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-blue-200/60 shadow-lg">
                                      <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-xl font-bold text-blue-900 flex items-center gap-3">
                                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                                            <UserGroupIcon className="w-5 h-5 text-white" />
                                          </div>
                                          Member Information
                                          <span className="text-sm font-normal text-blue-700">
                                            ({householdMembers.length} {householdMembers.length === 1 ? 'member' : 'members'})
                                          </span>
                                          {selectedRecord.householdSize && householdMembers.length < selectedRecord.householdSize && (
                                            <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded">
                                              Expected: {selectedRecord.householdSize} members
                                            </span>
                                          )}
                                        </h4>
                                        <div className="flex gap-2">
                                          {selectedRecord.householdSize && householdMembers.length < selectedRecord.householdSize && (
                                            <>
                                              <button
                                                onClick={() => setShowAddMemberModal(true)}
                                                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg shadow-md transition-all duration-300 flex items-center gap-2"
                                              >
                                                <PlusIcon className="w-4 h-4" />
                                                Add Member
                                              </button>
                                              <button
                                                onClick={async () => {
                                                  try {
                                                    const res = await api.post(`/admin/households/${selectedRecord.id}/sync-members`);
                                                    setToastMessage({
                                                      type: 'success',
                                                      message: `✅ ${res.data.message || 'Members synced successfully'}`,
                                                      duration: 3000
                                                    });
                                                    // Refresh members
                                                    handleShowDetails(selectedRecord);
                                                  } catch (err) {
                                                    setToastMessage({
                                                      type: 'error',
                                                      message: '❌ Failed to sync members',
                                                      duration: 3000
                                                    });
                                                  }
                                                }}
                                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-md transition-all duration-300 flex items-center gap-2"
                                              >
                                                <ArrowPathIcon className="w-4 h-4" />
                                                Sync Members
                                              </button>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                      
                                      {selectedRecord.householdSize && householdMembers.length < selectedRecord.householdSize && (
                                        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                          <p className="text-sm text-orange-800 flex items-center gap-2">
                                            <ExclamationTriangleIcon className="w-4 h-4" />
                                            <span>
                                              <strong>Warning:</strong> Only {householdMembers.length} of {selectedRecord.householdSize} members found. 
                                              Click "Add Member" to add missing members, or "Sync Members" to update existing ones.
                                            </span>
                                          </p>
                                        </div>
                                      )}
                                      
                                      {/* Add Member Interface */}
                                      {showAddMemberModal && (
                                        <div className="mb-4 p-4 bg-white rounded-xl border-2 border-green-300 shadow-lg">
                                          <div className="flex items-center justify-between mb-3">
                                            <h5 className="font-bold text-green-800">Add Household Member</h5>
                                            <button
                                              onClick={() => {
                                                setShowAddMemberModal(false);
                                                setMemberToAdd('');
                                                setMemberSearchInView('');
                                              }}
                                              className="text-gray-400 hover:text-gray-600"
                                            >
                                              <XMarkIcon className="w-5 h-5" />
                                            </button>
                                          </div>
                                          <div className="space-y-3">
                                            <div className="relative">
                                              <input
                                                type="text"
                                                value={memberSearchInView}
                                                onChange={(e) => setMemberSearchInView(e.target.value)}
                                                placeholder="Search residents by name or ID..."
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                              />
                                              <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-2.5 text-gray-400" />
                                            </div>
                                            <select
                                              value={memberToAdd}
                                              onChange={(e) => setMemberToAdd(e.target.value)}
                                              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            >
                                              <option value="">Select a resident to add</option>
                                              {residents
                                                .filter(r => {
                                                  // Exclude head and existing members
                                                  if (r.id === selectedRecord.head_resident_id) return false;
                                                  if (householdMembers.find(m => m.id === r.id)) return false;
                                                  
                                                  // Exclude residents who are already heads of other households
                                                  const isAlreadyHead = recordsState.some(record => 
                                                    record.head_resident_id === r.id && record.id !== selectedRecord.id
                                                  );
                                                  if (isAlreadyHead) return false;
                                                  
                                                  // Exclude residents who are already members of other households
                                                  if (r.household_no && r.household_no.trim() !== '') {
                                                    const isAlreadyMember = recordsState.some(record => 
                                                      record.householdId === r.household_no && record.id !== selectedRecord.id
                                                    );
                                                    if (isAlreadyMember) return false;
                                                  }
                                                  
                                                  // Apply search filter
                                                  const q = memberSearchInView.trim().toLowerCase();
                                                  if (!q) return true;
                                                  const fullName = `${r.first_name || ''} ${r.last_name || ''}`.toLowerCase();
                                                  const rid = (r.resident_id || '').toLowerCase();
                                                  return fullName.includes(q) || rid.includes(q);
                                                })
                                                .map(r => (
                                                  <option key={r.id} value={r.id}>
                                                    {`${r.first_name} ${r.last_name} ${r.resident_id ? ` — ${r.resident_id}` : ''}`}
                                                  </option>
                                                ))}
                                            </select>
                                            <div className="flex gap-2">
                                              <button
                                                onClick={async () => {
                                                  if (!memberToAdd) {
                                                    setToastMessage({
                                                      type: 'error',
                                                      message: 'Please select a resident to add',
                                                      duration: 2000
                                                    });
                                                    return;
                                                  }
                                                  
                                                  const memberId = Number(memberToAdd);
                                                  const currentMemberIds = householdMembers.map(m => m.id);
                                                  
                                                  // Get the resident being added
                                                  const residentToAdd = residents.find(r => r.id === memberId);
                                                  if (!residentToAdd) {
                                                    setToastMessage({
                                                      type: 'error',
                                                      message: 'Selected resident not found',
                                                      duration: 2000
                                                    });
                                                    return;
                                                  }
                                                  
                                                  // Check if resident is already a head of another household
                                                  const isAlreadyHead = recordsState.some(record => 
                                                    record.head_resident_id === memberId && record.id !== selectedRecord.id
                                                  );
                                                  if (isAlreadyHead) {
                                                    setToastMessage({
                                                      type: 'error',
                                                      message: '⚠️ This resident is already a Head of Household in another household. Cannot add as member.',
                                                      duration: 4000
                                                    });
                                                    return;
                                                  }
                                                  
                                                  // Check if resident is already a member of another household
                                                  if (residentToAdd.household_no && residentToAdd.household_no.trim() !== '') {
                                                    const isAlreadyMember = recordsState.some(record => 
                                                      record.householdId === residentToAdd.household_no && record.id !== selectedRecord.id
                                                    );
                                                    if (isAlreadyMember) {
                                                      setToastMessage({
                                                        type: 'error',
                                                        message: '⚠️ This resident is already a member of another household. Cannot add again.',
                                                        duration: 4000
                                                      });
                                                      return;
                                                    }
                                                  }
                                                  
                                                  // Check if adding would exceed household size
                                                  const totalAfterAdd = currentMemberIds.length + 1;
                                                  if (selectedRecord.householdSize && totalAfterAdd > selectedRecord.householdSize) {
                                                    setToastMessage({
                                                      type: 'error',
                                                      message: `Cannot add more members. Household size is ${selectedRecord.householdSize}.`,
                                                      duration: 3000
                                                    });
                                                    return;
                                                  }
                                                  
                                                  try {
                                                    // Update the household with the new member
                                                    const allMemberIds = [...currentMemberIds, memberId];
                                                    // Include head if exists
                                                    if (selectedRecord.head_resident_id && !allMemberIds.includes(selectedRecord.head_resident_id)) {
                                                      allMemberIds.push(selectedRecord.head_resident_id);
                                                    }
                                                    
                                                    const payload = {
                                                      members: allMemberIds,
                                                      members_count: selectedRecord.householdSize || allMemberIds.length,
                                                    };
                                                    
                                                    await api.put(`/admin/households/${selectedRecord.id}`, payload);
                                                    
                                                    setToastMessage({
                                                      type: 'success',
                                                      message: '✅ Member added successfully',
                                                      duration: 2000
                                                    });
                                                    
                                                    // Refresh members
                                                    handleShowDetails(selectedRecord);
                                                    
                                                    // Close modal
                                                    setShowAddMemberModal(false);
                                                    setMemberToAdd('');
                                                    setMemberSearchInView('');
                                                  } catch (err) {
                                                    console.warn('Failed to add member', err);
                                                    setToastMessage({
                                                      type: 'error',
                                                      message: '❌ Failed to add member. Please try again.',
                                                      duration: 3000
                                                    });
                                                  }
                                                }}
                                                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg text-sm transition-all duration-300 flex items-center justify-center gap-2"
                                              >
                                                <PlusIcon className="w-4 h-4" />
                                                Add & Save
                                              </button>
                                              <button
                                                onClick={() => {
                                                  setShowAddMemberModal(false);
                                                  setMemberToAdd('');
                                                  setMemberSearchInView('');
                                                }}
                                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg text-sm transition-all duration-300"
                                              >
                                                Cancel
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {householdMembers.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                          <UserGroupIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                          <p className="font-semibold mb-2">No members found for this household</p>
                                          <p className="text-sm">Members may need their household_no updated in the database</p>
                                        </div>
                                      ) : (
                                        <div className="space-y-4">
                                          {householdMembers.map((member, index) => {
                                            const isHead = member.id === selectedRecord.head_resident_id;
                                            const memberSex = member.sex || member.gender || (member.profile && (member.profile.sex || member.profile.gender)) || '—';
                                            const memberAge = member.age || (member.profile && member.profile.age) || '';
                                            
                                            return (
                                              <div 
                                                key={member.id || index} 
                                                className={`bg-white/80 backdrop-blur-sm rounded-xl p-4 border-2 ${
                                                  isHead 
                                                    ? 'border-green-300 bg-gradient-to-br from-green-50/80 to-emerald-50/80' 
                                                    : 'border-blue-200'
                                                } shadow-sm`}
                                              >
                                                {isHead && (
                                                  <div className="flex items-center gap-2 mb-3">
                                                    <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded">Head of Household</span>
                                                  </div>
                                                )}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                  <div className="space-y-1">
                                                    <span className="font-bold text-slate-600 uppercase tracking-wider text-xs">Full Name</span>
                                                    <div className="text-slate-900 font-bold text-base bg-white/60 px-3 py-2 rounded-lg border border-blue-200">
                                                      {member.first_name && member.last_name 
                                                        ? `${member.first_name} ${member.middle_name ? member.middle_name + ' ' : ''}${member.last_name}${member.name_suffix ? ' ' + member.name_suffix : ''}`.trim()
                                                        : member.name || '—'}
                                                    </div>
                                                  </div>
                                                  <div className="space-y-1">
                                                    <span className="font-bold text-slate-600 uppercase tracking-wider text-xs">Age</span>
                                                    <div className="text-slate-900 font-bold text-base bg-white/60 px-3 py-2 rounded-lg border border-blue-200">
                                                      {memberAge ? `${memberAge} years` : '—'}
                                                    </div>
                                                  </div>
                                                  <div className="space-y-1">
                                                    <span className="font-bold text-slate-600 uppercase tracking-wider text-xs">Civil Status</span>
                                                    <div className="text-slate-900 font-semibold text-base bg-white/60 px-3 py-2 rounded-lg border border-blue-200">
                                                      {member.civil_status || member.civilStatus || (member.profile && member.profile.civil_status) || '—'}
                                                    </div>
                                                  </div>
                                                  <div className="space-y-1">
                                                    <span className="font-bold text-slate-600 uppercase tracking-wider text-xs">Sex</span>
                                                    <div className="text-slate-900 font-semibold text-base bg-white/60 px-3 py-2 rounded-lg border border-blue-200">
                                                      {memberSex}
                                                    </div>
                                                  </div>
                                                  <div className="space-y-1">
                                                    <span className="font-bold text-slate-600 uppercase tracking-wider text-xs">Contact Number</span>
                                                    <div className="text-slate-900 font-semibold text-base bg-white/60 px-3 py-2 rounded-lg border border-blue-200">
                                                      {member.mobile_number || member.mobile_number || member.contact_number || member.contactNumber || '—'}
                                                    </div>
                                                  </div>
                                                  <div className="space-y-1">
                                                    <span className="font-bold text-slate-600 uppercase tracking-wider text-xs">Email</span>
                                                    <div className="text-slate-900 font-semibold text-base bg-white/60 px-3 py-2 rounded-lg border border-blue-200">
                                                      {member.email || '—'}
                                                    </div>
                                                  </div>
                                                  {member.resident_id && (
                                                    <div className="space-y-1 md:col-span-2">
                                                      <span className="font-bold text-slate-600 uppercase tracking-wider text-xs">Resident ID</span>
                                                      <div className="text-slate-900 font-mono text-base bg-white/60 px-3 py-2 rounded-lg border border-blue-200">
                                                        {member.resident_id}
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Enhanced Edit Modal */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-t-2xl p-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <PlusIcon className="w-6 h-6 text-white" />
                      </div>
                      {editData.id ? 'Edit Household Record' : 'Create New Household'}
                    </h2>
                    <button
                      onClick={() => { setShowModal(false); setEditData({}); }}
                      className="text-white hover:text-red-200 transition-all duration-300 transform hover:scale-110 hover:rotate-90 bg-white/10 hover:bg-red-500/20 rounded-xl p-2 backdrop-blur-sm"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-green-600" />
                          Select Resident to Promote
                        </label>
                        <div className="space-y-3">
                          <div className="relative">
                            <input
                              type="text"
                              value={residentSearch}
                              onChange={(e) => setResidentSearch(e.target.value)}
                              placeholder="Search residents by name, id, or household..."
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm"
                            />
                            <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-3 text-gray-400" />
                          </div>
                          <select
                            value={editData.head_resident_id || ''}
                            onChange={handleResidentSelect}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm"
                          >
                            <option value="">Choose a resident (optional)</option>
                            {filteredResidents.length === 0 ? (
                              <option value="" disabled>No available residents (all are already heads of household)</option>
                            ) : (
                              filteredResidents.map(r => (
                                <option key={r.id} value={r.id}>{`${r.first_name} ${r.last_name} ${r.household_no ? ` — ${r.household_no}` : ''}`}</option>
                              ))
                            )}
                          </select>
                          {filteredResidents.length === 0 && residents.length > 0 && (
                            <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                              <ExclamationTriangleIcon className="w-3 h-3" />
                              All residents are already heads of household. Create a new resident first.
                            </p>
                          )}
                        </div>

                        {editData.head_resident_id && (
                          <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Resident ID</label>
                            <input
                              type="text"
                              value={editData.head_resident_code || editData.head_resident_id}
                              readOnly
                              className="w-full px-4 py-3 border border-green-200 rounded-lg text-sm bg-white/60 text-gray-700 cursor-not-allowed font-mono"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                          <HomeIcon className="w-4 h-4 text-emerald-600" />
                          Household Size
                          <span className="text-xs font-normal text-gray-500">(includes Head of Household)</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={editData.householdSize || ''}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            // Ensure minimum size is 1 (the head counts as one member)
                            const minSize = editData.head_resident_id ? 1 : 1;
                            setEditData({ ...editData, householdSize: value >= minSize ? value : minSize });
                          }}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm"
                          placeholder="Enter household size (min: 1)"
                        />
                        {editData.head_resident_id && (
                          <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                            <InformationCircleIcon className="w-3 h-3" />
                            The Head of Household counts as 1 member. Minimum size is 1.
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                          <MapPinIcon className="w-4 h-4 text-green-600" />
                          Address
                          {editData.head_resident_id && (
                            <span className="text-xs font-normal text-green-600">(Auto-filled from resident)</span>
                          )}
                        </label>
                        <input
                          type="text"
                          value={editData.address || ''}
                          onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                          className={`w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 shadow-sm ${
                            editData.head_resident_id && editData.address 
                              ? 'border-green-300 bg-green-50/50' 
                              : 'border-gray-200 bg-white'
                          }`}
                          placeholder="House number, street, barangay"
                        />
                        {editData.head_resident_id && editData.address && (
                          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                            <CheckCircleIcon className="w-3 h-3" />
                            Address automatically populated from resident's profile
                          </p>
                        )}
                        {editData.head_resident_id && !editData.address && (
                          <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                            <ExclamationTriangleIcon className="w-3 h-3" />
                            Address not found in resident's record. Please enter manually.
                          </p>
                        )}
                      </div>
                        
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                          <PhoneIcon className="w-4 h-4 text-blue-600" />
                          Contact Number
                          {editData.head_resident_id && editData.contactNumber && (
                            <span className="text-xs font-normal text-green-600 flex items-center gap-1">
                              <span>✓</span>
                              <span>Auto-filled from resident's profile</span>
                            </span>
                          )}
                        </label>
                        <input
                          type="text"
                          value={editData.contactNumber || ''}
                          onChange={(e) => {
                            // Only allow editing if no head resident is selected
                            if (!editData.head_resident_id) {
                              setEditData({ ...editData, contactNumber: e.target.value });
                            }
                          }}
                          readOnly={!!editData.head_resident_id}
                          className={`w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 shadow-sm ${
                            editData.head_resident_id && editData.contactNumber 
                              ? 'border-green-300 bg-green-50/50 cursor-not-allowed' 
                              : editData.head_resident_id
                              ? 'border-gray-200 bg-gray-100 cursor-not-allowed'
                              : 'border-gray-200 bg-white'
                          }`}
                          placeholder="Enter contact number"
                        />
                        {editData.head_resident_id && editData.contactNumber && (
                          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                            <CheckCircleIcon className="w-3 h-3" />
                            Contact number automatically populated from resident's profile (read-only)
                          </p>
                        )}
                        {editData.head_resident_id && !editData.contactNumber && (
                          <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                            <ExclamationTriangleIcon className="w-3 h-3" />
                            Contact number not found in resident's record. Please update the resident's profile first.
                          </p>
                        )}
                      </div>
                        
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                          <EnvelopeIcon className="w-4 h-4 text-purple-600" />
                          Email
                        </label>
                        <input
                          type="email"
                          value={editData.email || ''}
                          onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm"
                          placeholder="Enter email"
                        />
                      </div>
                      
                      {/* Member Selection */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                          <UserGroupIcon className="w-4 h-4 text-indigo-600" />
                          Household Members
                          <span className="text-xs font-normal text-gray-500">
                            ({selectedMembers.length} {selectedMembers.length === 1 ? 'member' : 'members'} selected)
                          </span>
                        </label>
                        <div className="space-y-3">
                          <div className="relative">
                            <input
                              type="text"
                              value={memberSearch}
                              onChange={(e) => setMemberSearch(e.target.value)}
                              placeholder="Search residents to add as members..."
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm"
                            />
                            <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-3 text-gray-400" />
                          </div>
                          <select
                            value=""
                            onChange={(e) => {
                              const memberId = Number(e.target.value);
                              if (memberId && !isNaN(memberId)) {
                                // Check if member is already selected using consistent type comparison
                                const isAlreadySelected = selectedMembers.some(id => Number(id) === memberId);
                                if (!isAlreadySelected) {
                                  setSelectedMembers([...selectedMembers, memberId]);
                                  setMemberSearch('');
                                }
                              }
                            }}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm"
                          >
                            <option value="">Select a resident to add as member</option>
                            {residents
                              .filter(r => {
                                const rId = Number(r.id);
                                const headId = editData.head_resident_id ? Number(editData.head_resident_id) : null;
                                
                                // Exclude head and already selected members (using consistent type comparison)
                                if (headId && rId === headId) return false;
                                const isSelected = selectedMembers.some(id => Number(id) === rId);
                                if (isSelected) return false;
                                
                                // Exclude residents who are already heads of other households
                                const isAlreadyHead = recordsState.some(record => {
                                  const recordHeadId = record.head_resident_id ? Number(record.head_resident_id) : null;
                                  return recordHeadId === rId && Number(record.id) !== Number(editData.id);
                                });
                                if (isAlreadyHead) return false;
                                
                                // Exclude residents who are already members of other households
                                if (r.household_no && r.household_no.trim() !== '') {
                                  const isAlreadyMember = recordsState.some(record => 
                                    record.householdId === r.household_no && Number(record.id) !== Number(editData.id)
                                  );
                                  if (isAlreadyMember) return false;
                                }
                                
                                // Apply search filter
                                const q = memberSearch.trim().toLowerCase();
                                if (!q) return true;
                                const fullName = `${r.first_name || ''} ${r.last_name || ''}`.toLowerCase();
                                const rid = (r.resident_id || '').toLowerCase();
                                return fullName.includes(q) || rid.includes(q);
                              })
                              .map(r => (
                                <option key={r.id} value={r.id}>
                                  {`${r.first_name} ${r.last_name} ${r.resident_id ? ` — ${r.resident_id}` : ''}`}
                                </option>
                              ))}
                          </select>
                          
                          {/* Display selected members */}
                          {selectedMembers.length > 0 && (
                            <div className="space-y-2 mt-3">
                              <p className="text-xs font-semibold text-gray-600">Selected Members:</p>
                              {selectedMembers.map(memberId => {
                                // Ensure consistent type comparison
                                const normalizedMemberId = Number(memberId);
                                const member = residents.find(r => Number(r.id) === normalizedMemberId);
                                if (!member) return null;
                                return (
                                  <div key={memberId} className="flex items-center justify-between gap-3 border border-gray-200 rounded-lg p-2 bg-gray-50">
                                    <div>
                                      <span className="font-medium text-sm">
                                        {member.first_name} {member.last_name}
                                      </span>
                                      {member.resident_id && (
                                        <span className="text-xs text-gray-500 ml-2">— {member.resident_id}</span>
                                      )}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        // Ensure consistent type comparison when removing
                                        setSelectedMembers(selectedMembers.filter(id => Number(id) !== normalizedMemberId));
                                      }}
                                      className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 transition-colors"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          
                          <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                            <InformationCircleIcon className="w-3 h-3" />
                            Selected members will have their household_no updated to match this household when you save.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => { 
                        setShowModal(false); 
                        setEditData({}); 
                        setSelectedMembers([]);
                        setMemberSearch('');
                      }}
                      className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold text-sm transition-all duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={!isFormValid || isSaving}
                      className={`px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${(!isFormValid || isSaving) ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {isSaving ? (
                        <>
                          <ArrowPathIcon className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Help System Modals */}
      <HouseholdHelpGuide 
        isOpen={showHelpGuide} 
        onClose={() => setShowHelpGuide(false)} 
      />
      
      <HouseholdQuickStartGuide 
        isOpen={showQuickStart} 
        onClose={() => setShowQuickStart(false)}
        onComplete={() => {
          setToastMessage({
            type: 'success',
            message: 'Quick Start Guide completed! You\'re ready to use the household system.',
            duration: 3000
          });
        }}
      />
      
      <HouseholdFAQ 
        isOpen={showFAQ} 
        onClose={() => setShowFAQ(false)} 
      />
    </>
  );
};

export default HouseholdRecords;
