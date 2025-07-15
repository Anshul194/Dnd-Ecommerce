// Utility to parse FormData (parseNestedFormData.js)
export function parseNestedFormData(formData) {
  const data = {};
  
  for (const [key, value] of formData.entries()) {
    // Handle array notation like terms[0][value]
    if (key.includes('[') && key.includes(']')) {
      const matches = key.match(/^(\w+)\[(\d+)\]\[(\w+)\]$/);
      if (matches) {
        const [, arrayName, index, fieldName] = matches;
        
        if (!data[arrayName]) {
          data[arrayName] = [];
        }
        
        if (!data[arrayName][index]) {
          data[arrayName][index] = {};
        }
        
        // Handle file uploads (they come as File objects)
        if (value instanceof File) {
          data[arrayName][index][fieldName] = value.name || '';
        } else {
          data[arrayName][index][fieldName] = value;
        }
      } else {
        // Handle other bracket notation if needed
        data[key] = value;
      }
    } 
    // Handle JSON string in terms field
    else if (key === 'terms') {
      try {
        data[key] = JSON.parse(value);
      } catch (e) {
        data[key] = [];
      }
    } 
    // Handle regular fields
    else {
      // Handle file uploads
      if (value instanceof File) {
        data[key] = value.name || '';
      } else {
        data[key] = value;
      }
    }
  }
  
  return data;
}