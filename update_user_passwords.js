const bcrypt = require('bcrypt');

async function generatePasswordHashes() {
  const testPassword = 'testpass123';
  const hash = await bcrypt.hash(testPassword, 10);
  
  console.log('Generated password hash for "testpass123":');
  console.log(hash);
  console.log('');
  console.log('SQL to update users:');
  console.log(`-- Update QuickTest password`);
  console.log(`UPDATE users SET password_hash = '${hash}' WHERE email = 'quicktest@example.com';`);
  console.log(`-- Update NavTestUser password`);
  console.log(`UPDATE users SET password_hash = '${hash}' WHERE email = 'navtest@example.com';`);
}

generatePasswordHashes();
