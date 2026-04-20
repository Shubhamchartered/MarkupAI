const fs = require('fs');
const xlsx = require('xlsx');

try {
  const workbook = xlsx.readFile('Income Tax DB.xlsx');
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet);
  
  const newData = data.map(d => {
    return {
      name: d.Name || '',
      pan: d['User ID'] || '',
      password: d.Password || '',
      tan: '',
      ay: '2025-26',
      email: '',
      phone: '',
      type: 'Company', // default
      status: 'Active',
      assignedTo: 'CA Admin',
      noticeCount: 0,
      earliestDue: null,
      address: ''
    };
  });

  const jsContent = `/* ═══════════════════════════════════════════════════════════════
   it_client_data.js — Income Tax Taxpayer Directory (Imported)
   ═══════════════════════════════════════════════════════════════ */

export const IT_CLIENT_DATA = ${JSON.stringify(newData, null, 2)};
`;

  fs.writeFileSync('src/data/it_client_data.js', jsContent, 'utf8');
  console.log(`Successfully updated it_client_data.js with ${newData.length} records.`);
} catch (err) {
  console.error(err);
}
