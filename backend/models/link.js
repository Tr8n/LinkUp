const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  category: {
    type: String,
    enum: ['resume', 'job', 'favorite', 'work', 'personal', 'study', 'other'],
    default: 'other'
  },
  colorTag: {
    type: String,
    enum: ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'gray'],
    default: 'blue'
  },
  tags: [{
    type: String,
    trim: true
  }],
  isFavorite: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
linkSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Link = mongoose.model('Link', linkSchema);

module.exports = Link;