const xlsx = require('xlsx');

try {
  const workbook = xlsx.readFile('Income Tax DB.xlsx');
  
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet);
  
  console.log(`Sheet Name: ${sheetName}`);
  console.log(`Columns: ${Object.keys(data[0] || {}).join(', ')}`);
  console.log(`Row count: ${data.length}`);
  console.log('--- First 3 rows ---');
  console.log(data.slice(0, 3));
} catch (err) {
  console.error(err);
}
