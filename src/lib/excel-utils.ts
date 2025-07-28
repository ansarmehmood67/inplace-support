import * as XLSX from 'xlsx';

export interface ExcelValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  preview?: ExcelRow[];
}

export interface ExcelRow {
  phone_number?: string;
  name?: string;
  surname?: string;
  [key: string]: any;
}

// Required columns for Excel upload
const REQUIRED_COLUMNS = ['phone_number', 'name', 'surname'];

// Validate Excel file structure and content
export const validateExcelFile = async (file: File): Promise<ExcelValidationResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          resolve({
            isValid: false,
            errors: ['Excel file appears to be empty or corrupted.'],
            warnings: []
          });
          return;
        }
        
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        if (jsonData.length < 2) {
          resolve({
            isValid: false,
            errors: ['Excel file must contain at least a header row and one data row.'],
            warnings: []
          });
          return;
        }
        
        // Extract headers (first row)
        const headers = jsonData[0].map((h: any) => String(h).toLowerCase().trim());
        const errors: string[] = [];
        const warnings: string[] = [];
        
        // Check required columns
        const missingColumns = REQUIRED_COLUMNS.filter(col => !headers.includes(col));
        if (missingColumns.length > 0) {
          errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
        }
        
        // Convert to objects for validation
        const rows: ExcelRow[] = [];
        for (let i = 1; i < Math.min(jsonData.length, 6); i++) { // Check first 5 data rows
          const row: ExcelRow = {};
          headers.forEach((header, index) => {
            if (jsonData[i] && jsonData[i][index] !== undefined) {
              row[header] = jsonData[i][index];
            }
          });
          rows.push(row);
        }
        
        // Validate data content
        let validPhoneNumbers = 0;
        rows.forEach((row, index) => {
          const rowNumber = index + 2; // +2 because of header and 0-based index
          
          // Check phone number format
          const phone = String(row.phone_number || '').replace(/\D/g, '');
          if (!phone || phone.length < 8) {
            warnings.push(`Row ${rowNumber}: Invalid or missing phone number`);
          } else {
            validPhoneNumbers++;
          }
          
          // Check name
          if (!row.name || String(row.name).trim().length === 0) {
            warnings.push(`Row ${rowNumber}: Missing name`);
          }
          
          // Check surname
          if (!row.surname || String(row.surname).trim().length === 0) {
            warnings.push(`Row ${rowNumber}: Missing surname`);
          }
        });
        
        // Summary warnings
        if (validPhoneNumbers === 0) {
          errors.push('No valid phone numbers found in the file.');
        }
        
        if (jsonData.length > 1000) {
          warnings.push(`Large file detected (${jsonData.length - 1} rows). Processing may take longer.`);
        }
        
        resolve({
          isValid: errors.length === 0,
          errors,
          warnings,
          preview: rows
        });
        
      } catch (error) {
        resolve({
          isValid: false,
          errors: ['Failed to read Excel file. Please ensure it\'s a valid Excel (.xlsx) or CSV file.'],
          warnings: []
        });
      }
    };
    
    reader.onerror = () => {
      resolve({
        isValid: false,
        errors: ['Failed to read file. Please try again.'],
        warnings: []
      });
    };
    
    reader.readAsArrayBuffer(file);
  });
};

// Format phone number for display
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length >= 10) {
    return `+${cleaned.slice(0, -10)} ${cleaned.slice(-10, -6)} ${cleaned.slice(-6)}`;
  }
  return phone;
};