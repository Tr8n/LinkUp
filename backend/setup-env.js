const fs = require('fs');
const path = require('path');

const envContent = `PORT=5000
MONGO_URI=mongodb://localhost:27017/LinkManagement
JWT_SECRET=yourSecretKey123456789
`;

const envPath = path.join(__dirname, '.env');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
  console.log('📝 Environment variables set:');
  console.log('   - PORT: 5000');
  console.log('   - MONGO_URI: mongodb://localhost:27017/LinkManagement');
  console.log('   - JWT_SECRET: yourSecretKey123456789');
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
} 