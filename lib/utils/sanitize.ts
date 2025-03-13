/**
 * Utility functions to sanitize MongoDB documents for React Server Components
 * Prevents "Maximum call stack size exceeded" errors caused by circular references
 */

/**
 * Sanitizes a MongoDB document or any object with potential circular references
 * @param doc - MongoDB document or any object to sanitize
 * @returns A plain JavaScript object safe for serialization
 */
export function sanitizeDocument(doc: any): any {
  if (!doc) return null;
  
  // If it's already a plain object or primitive, return it
  if (typeof doc !== 'object' || doc === null) return doc;
  
  // If it's an array, sanitize each item
  if (Array.isArray(doc)) {
    return doc.map(item => sanitizeDocument(item));
  }
  
  // Convert to plain object if it's a Mongoose document
  const plainObject = doc.toObject ? doc.toObject() : { ...doc };
  
  // Create a new object to hold sanitized properties
  const sanitized: Record<string, any> = {};
  
  // Process each property
  for (const [key, value] of Object.entries(plainObject)) {
    // Convert MongoDB ObjectIds to strings
    if (key === '_id' || key === 'id') {
      sanitized[key] = typeof value?.toString === 'function' ? value.toString() : value;
      continue;
    }
    
    // Handle nested objects and arrays
    if (typeof value === 'object' && value !== null) {
      // Skip functions and handle arrays separately
      if (typeof value === 'function') continue;
      if (Array.isArray(value)) {
        sanitized[key] = value.map(item => sanitizeDocument(item));
        continue;
      }
      
      // Handle Date objects
      if (value instanceof Date) {
        sanitized[key] = value.toISOString();
        continue;
      }
      
      // Handle ObjectId references
      if (value && typeof value === 'object' && '_id' in value) {
        // If it's a simple reference with just _id, convert to string
        if (Object.keys(value).length === 1) {
          sanitized[key] = typeof value._id?.toString === 'function' ? value._id.toString() : value._id;
          continue;
        }
        
        // Otherwise sanitize the nested object
        sanitized[key] = sanitizeDocument(value);
        continue;
      }
      
      // Recursively sanitize other objects
      sanitized[key] = sanitizeDocument(value);
      continue;
    }
    
    // Copy primitive values as is
    sanitized[key] = value;
  }
  
  return sanitized;
}

/**
 * Sanitizes an array of MongoDB documents or a single document
 * @param docs - Array of MongoDB documents or a single document to sanitize
 * @returns Array of plain JavaScript objects or a single object safe for serialization
 */
export function sanitizeDocuments(docs: any): any {
  // Handle single object case
  if (!Array.isArray(docs)) {
    return sanitizeDocument(docs);
  }
  
  // Handle array case
  if (!docs || docs.length === 0) return [];
  return docs.map(doc => sanitizeDocument(doc));
}
