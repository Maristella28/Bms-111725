/**
 * Utility functions for validating business information
 */

/**
 * Check if business information is complete for Business Permit requests
 * Business info is considered complete if:
 * - business_info is filled and not "N/A" or empty
 * - business_type is filled and not "N/A" or empty
 * - business_location is filled and not "N/A" or empty
 * 
 * @param {Object} profile - User profile object
 * @returns {Object} - { isValid: boolean, missingFields: string[], message: string }
 */
export const validateBusinessInfo = (profile) => {
  if (!profile || typeof profile !== 'object') {
    return {
      isValid: false,
      missingFields: ['Business Name', 'Business Type', 'Business Location'],
      message: 'Profile information not available. Please complete your profile first.'
    };
  }

  // Check if employment status is set to 'na' (Not Applicable)
  // If so, business info cannot be completed and Business Permit cannot be requested
  const employmentStatus = profile.employment_status;
  const occupationType = profile.occupation_type;
  const salaryIncome = profile.salary_income;
  
  // If employment is marked as "Not Applicable", business permit cannot be requested
  if (employmentStatus === 'na' || 
      (occupationType === 'Not Applicable' && salaryIncome === 'N/A')) {
    return {
      isValid: false,
      missingFields: ['Business Name', 'Business Type', 'Business Location'],
      message: 'Business Permit cannot be requested when employment status is set to "Not Applicable". Please update your employment information in your profile.',
      isEmploymentNotApplicable: true
    };
  }

  const missingFields = [];
  const fields = {
    business_info: 'Business Name',
    business_type: 'Business Type',
    business_location: 'Business Location'
  };

  // Check each business field
  Object.entries(fields).forEach(([field, label]) => {
    const value = profile[field];
    // Check if value is null, undefined, empty string, or "N/A"
    if (!value || 
        (typeof value === 'string' && (value.trim() === '' || value.trim().toUpperCase() === 'N/A')) ||
        value === 'N/A' || 
        value === 'n/a') {
      missingFields.push(label);
    }
  });

  return {
    isValid: missingFields.length === 0,
    missingFields,
    message: missingFields.length > 0
      ? `Please complete the following business information fields: ${missingFields.join(', ')}`
      : 'Business information is complete.'
  };
};

/**
 * Check if business information fields are empty or set to N/A
 * @param {Object} profile - User profile object
 * @returns {boolean} - true if business info is incomplete
 */
export const isBusinessInfoIncomplete = (profile) => {
  const validation = validateBusinessInfo(profile);
  return !validation.isValid;
};

/**
 * Get business information completion status
 * @param {Object} profile - User profile object
 * @returns {Object} - Completion status with details
 */
export const getBusinessInfoStatus = (profile) => {
  const validation = validateBusinessInfo(profile);
  
  const business_info = profile?.business_info || '';
  const business_type = profile?.business_type || '';
  const business_location = profile?.business_location || '';
  
  const filledFields = [
    business_info && business_info.trim() !== '' && business_info.trim().toUpperCase() !== 'N/A' ? 'Business Name' : null,
    business_type && business_type.trim() !== '' && business_type.trim().toUpperCase() !== 'N/A' ? 'Business Type' : null,
    business_location && business_location.trim() !== '' && business_location.trim().toUpperCase() !== 'N/A' ? 'Business Location' : null,
  ].filter(Boolean);

  return {
    ...validation,
    filledFields,
    completionPercentage: Math.round((filledFields.length / 3) * 100),
    totalFields: 3,
    completedFields: filledFields.length
  };
};

