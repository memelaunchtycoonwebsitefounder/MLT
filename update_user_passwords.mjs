import bcrypt from 'bcrypt';

async function generatePasswordHashes() {
  const testPassword = 'testpass123';
  const hash = await bcrypt.hash(testPassword, 10);
  
  console.log('Generated password hash for "testpass123":');
  console.log(hash);
  console.log('');
  console.log('SQL to update users:');
  console.log(`-- Update ALL restored users with password "testpass123"`);
  console.log(`UPDATE users SET password_hash = '${hash}' WHERE id IN (5, 6, 7, 8);`);
  console.log('');
  console.log('Execute this in wrangler:');
  console.log(`npx wrangler d1 execute memelaunch-db --local --command="UPDATE users SET password_hash = '${hash}' WHERE id IN (5, 6, 7, 8);"`);
}

generatePasswordHashes();
