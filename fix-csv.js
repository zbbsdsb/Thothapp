// Fix CSV by removing follow-up questions for uncollected data types
const fs = require('fs');
const csv = fs.readFileSync('store-assets/data_safety_sample.csv', 'utf8');
const lines = csv.split('\n');

// Data types that Thoth DOES collect (identified by having 'true' in column 3 of the data type selection row)
const collectedDataTypes = new Set([
  'PSL_NAME',
  'PSL_EMAIL', 
  'PSL_APPROX_LOCATION',
  'PSL_AUDIO',
  'PSL_USER_GENERATED_CONTENT'
]);

// Keep lines that:
// 1. Don't have a data type prefix in column 1, OR
// 2. Have a data type prefix that IS in collectedDataTypes, OR  
// 3. Are data type selection rows (not follow-up questions)
const keepLines = [];
const toKeep = new Set();

// First pass: identify which data types are actually collected
lines.forEach((line) => {
  if (!line.trim()) return;
  const cols = line.split(',');
  const questionId = cols[0];
  
  // Check if this is a data type selection row (PSL_DATA_TYPES_PERSONAL, etc.)
  // and has 'true' in column 3 (meaning this data type IS collected)
  if (questionId.startsWith('PSL_DATA_TYPES_')) {
    const dataLabel = cols[1]; // e.g., "PSL_NAME"
    if (cols[2] === 'true') {
      toKeep.add(dataLabel);
    }
  }
});

console.log('Data types to keep:', Array.from(toKeep));

// Second pass: keep only relevant lines
lines.forEach((line) => {
  if (!line.trim()) {
    keepLines.push(line);
    return;
  }
  
  const cols = line.split(',');
  const questionId = cols[0];
  
  // Keep data type selection rows
  if (questionId.startsWith('PSL_DATA_TYPES_')) {
    keepLines.push(line);
    return;
  }
  
  // For follow-up questions (PSL_DATA_USAGE_RESPONSES:...), check if the data type is collected
  const match = questionId.match(/^PSL_DATA_USAGE_RESPONSES:(PSL_[A-Z_]+):/);
  if (match) {
    const dataType = match[1];
    if (toKeep.has(dataType)) {
      keepLines.push(line);
    }
    // Skip this line if data type is not collected
    return;
  }
  
  // Keep other lines (account deletion, encryption, etc.)
  keepLines.push(line);
});

const result = keepLines.join('\n');
fs.writeFileSync('store-assets/data_safety_sample.csv', result, 'utf8');
console.log('CSV fixed! Removed follow-up questions for uncollected data types.');
console.log('Original lines:', lines.length);
console.log('Kept lines:', keepLines.length);
