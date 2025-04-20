/**
 * Form validation utilities
 */

/**
 * Validates an email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  /**
   * Validates a phone number
   * @param {string} phone - Phone number to validate
   * @returns {boolean} True if phone number is valid
   */
  export const isValidPhone = (phone) => {
    // Basic validation for 10-digit number
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  };
  
  /**
   * Validates a password
   * @param {string} password - Password to validate
   * @returns {Object} Validation result and message
   */
  export const validatePassword = (password) => {
    if (!password) {
      return { isValid: false, message: 'Password is required' };
    }
    
    if (password.length < 6) {
      return { 
        isValid: false, 
        message: 'Password must be at least 6 characters' 
      };
    }
    
    // For more complex password requirements:
    // const hasUpperCase = /[A-Z]/.test(password);
    // const hasLowerCase = /[a-z]/.test(password);
    // const hasNumber = /\d/.test(password);
    // const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    // if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
    //   return { 
    //     isValid: false, 
    //     message: 'Password must include uppercase, lowercase, number and special character' 
    //   };
    // }
    
    return { isValid: true, message: '' };
  };
  
  /**
   * Checks if required fields are filled
   * @param {Object} formData - Form data object
   * @param {Array<string>} requiredFields - Array of required field names
   * @returns {Object} Object with error messages for missing fields
   */
  export const validateRequiredFields = (formData, requiredFields) => {
    const errors = {};
    
    requiredFields.forEach(field => {
      if (!formData[field] || (typeof formData[field] === 'string' && !formData[field].trim())) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
      }
    });
    
    return errors;
  };
  
  /**
   * Validates form data against provided rules
   * @param {Object} formData - Form data to validate
   * @param {Object} validationRules - Validation rules object
   * @returns {Object} Validation errors object
   */
  export const validateForm = (formData, validationRules) => {
    const errors = {};
    
    Object.entries(validationRules).forEach(([field, rules]) => {
      const value = formData[field];
      
      // Check if field is required
      if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
        errors[field] = rules.message || `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
        return;
      }
      
      // Skip other validations if field is empty and not required
      if (!value && !rules.required) {
        return;
      }
      
      // Check pattern if provided
      if (rules.pattern && !rules.pattern.test(value)) {
        errors[field] = rules.patternMessage || `Invalid ${field}`;
      }
      
      // Check min length
      if (rules.minLength && value.length < rules.minLength) {
        errors[field] = rules.minLengthMessage || `${field} must be at least ${rules.minLength} characters`;
      }
      
      // Check max length
      if (rules.maxLength && value.length > rules.maxLength) {
        errors[field] = rules.maxLengthMessage || `${field} must be less than ${rules.maxLength} characters`;
      }
      
      // Check min value
      if (rules.min !== undefined && Number(value) < rules.min) {
        errors[field] = rules.minMessage || `${field} must be at least ${rules.min}`;
      }
      
      // Check max value
      if (rules.max !== undefined && Number(value) > rules.max) {
        errors[field] = rules.maxMessage || `${field} must be less than ${rules.max}`;
      }
      
      // Custom validation
      if (rules.validate && typeof rules.validate === 'function') {
        const customError = rules.validate(value, formData);
        if (customError) {
          errors[field] = customError;
        }
      }
    });
    
    return errors;
  };