const mongoose = require('mongoose');

const MONGO_URI = "mongodb+srv://jjoker3438_db_user:PkpqR6hzerocD0my@cluster0.txovw1q.mongodb.net/LinkUp?retryWrites=true&w=majority&appName=Cluster0/link"

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is not set. Did you forget to add it in Render?");
  process.exit(1);
}
  
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));
