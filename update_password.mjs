import bcrypt from 'bcryptjs';

async function generateHash() {
  const password = 'Test123!';
  const hash = await bcrypt.hash(password, 10);
  console.log('Password:', password);
  console.log('Hash:', hash);
  
  // 測試驗證
  const isValid = await bcrypt.compare(password, hash);
  console.log('Verification:', isValid ? '✅ Match' : '❌ No match');
}

generateHash();
