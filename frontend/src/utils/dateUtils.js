/**
 * Date utility functions for KBee Manager
 */

/**
 * Format date from yyyy-mm-dd (ISO format) to dd/mm/yyyy
 * @param {string} dateString - Date in yyyy-mm-dd format or any valid date string
 * @returns {string} Formatted date in dd/mm/yyyy format
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid date
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString; // Return original on error
  }
};

/**
 * Format multiple dates in a beehive object
 * @param {object} beehive - Beehive object
 * @param {string[]} dateFields - Array of date field names to format
 * @returns {object} Beehive object with formatted dates
 */
export const formatBeehiveDates = (beehive, dateFields = ['import_date', 'split_date', 'sold_date']) => {
  if (!beehive) return beehive;
  
  const formatted = { ...beehive };
  dateFields.forEach(field => {
    if (formatted[field]) {
      formatted[field] = formatDate(formatted[field]);
    }
  });
  
  return formatted;
};

