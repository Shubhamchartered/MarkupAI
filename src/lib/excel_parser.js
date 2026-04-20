/* ═══════════════════════════════════════════════════════════════
   excel_parser.js — Excel Sheet 2 Parser for IT Credentials
   Uses SheetJS (xlsx) to read .xlsx files, extracts Sheet 2
   for Income Tax taxpayer credentials (PAN/TAN based)
   ═══════════════════════════════════════════════════════════════ */

import * as XLSX from 'xlsx';

/**
 * Validates PAN format: 5 letters + 4 digits + 1 letter
 */
export function validatePAN(pan) {
  if (!pan || typeof pan !== 'string') return false;
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.toUpperCase().trim());
}

/**
 * Validates TAN format: 4 letters + 5 digits + 1 letter
 */
export function validateTAN(tan) {
  if (!tan || typeof tan !== 'string') return false;
  return /^[A-Z]{4}[0-9]{5}[A-Z]$/.test(tan.toUpperCase().trim());
}

/**
 * Parse an Excel file and extract data from Sheet 2
 * Expected columns in Sheet 2: userName, userId (PAN/TAN), password
 * Optional columns: email, phone, type, ay
 *
 * @param {File} file - The uploaded .xlsx file
 * @returns {Promise<{success: boolean, data: Array, errors: Array, sheetName: string}>}
 */
export async function parseExcelSheet2(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Get Sheet 2 (index 1) or fallback to the second sheet name
        const sheetNames = workbook.SheetNames;
        if (sheetNames.length < 2) {
          resolve({
            success: false,
            data: [],
            errors: ['Excel file does not contain Sheet 2. Found only: ' + sheetNames.join(', ')],
            sheetName: sheetNames[0] || 'N/A',
          });
          return;
        }

        const sheet2Name = sheetNames[1];
        const worksheet = workbook.Sheets[sheet2Name];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (jsonData.length === 0) {
          resolve({
            success: false,
            data: [],
            errors: ['Sheet 2 ("' + sheet2Name + '") is empty.'],
            sheetName: sheet2Name,
          });
          return;
        }

        // Normalize column names (case-insensitive matching)
        const errors = [];
        const parsed = jsonData.map((row, idx) => {
          const normalized = {};
          Object.keys(row).forEach(key => {
            const k = key.toLowerCase().trim().replace(/\s+/g, '');
            if (k.includes('username') || k.includes('name') || k === 'user') {
              normalized.userName = String(row[key]).trim();
            } else if (k.includes('userid') || k === 'pan' || k === 'tan' || k === 'id') {
              normalized.userId = String(row[key]).trim().toUpperCase();
            } else if (k.includes('password') || k === 'pwd' || k === 'pass') {
              normalized.password = String(row[key]).trim();
            } else if (k.includes('email') || k === 'mail') {
              normalized.email = String(row[key]).trim();
            } else if (k.includes('phone') || k === 'mobile' || k === 'contact') {
              normalized.phone = String(row[key]).trim();
            } else if (k.includes('type') || k === 'category') {
              normalized.type = String(row[key]).trim();
            } else if (k === 'ay' || k.includes('assessmentyear')) {
              normalized.ay = String(row[key]).trim();
            }
          });

          // Validation
          if (!normalized.userName) {
            errors.push(`Row ${idx + 2}: Missing user name`);
          }
          if (!normalized.userId) {
            errors.push(`Row ${idx + 2}: Missing user ID (PAN/TAN)`);
          } else {
            const isPAN = validatePAN(normalized.userId);
            const isTAN = validateTAN(normalized.userId);
            if (!isPAN && !isTAN) {
              errors.push(`Row ${idx + 2}: Invalid PAN/TAN format — "${normalized.userId}"`);
            }
            normalized.idType = isPAN ? 'PAN' : isTAN ? 'TAN' : 'Unknown';
          }

          return {
            userName: normalized.userName || '',
            userId: normalized.userId || '',
            password: normalized.password || '',
            email: normalized.email || '',
            phone: normalized.phone || '',
            type: normalized.type || 'Individual',
            ay: normalized.ay || '',
            idType: normalized.idType || 'Unknown',
          };
        });

        resolve({
          success: errors.length === 0,
          data: parsed,
          errors,
          sheetName: sheet2Name,
          totalRows: jsonData.length,
        });
      } catch (err) {
        resolve({
          success: false,
          data: [],
          errors: ['Failed to parse Excel file: ' + err.message],
          sheetName: 'N/A',
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        data: [],
        errors: ['Failed to read file.'],
        sheetName: 'N/A',
      });
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parse Sheet 1 data as well (for GST clients)
 */
export async function parseExcelSheet1(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet1 = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet1, { defval: '' });
        resolve({ success: true, data: jsonData, sheetName: workbook.SheetNames[0] });
      } catch (err) {
        resolve({ success: false, data: [], errors: [err.message] });
      }
    };
    reader.readAsArrayBuffer(file);
  });
}
