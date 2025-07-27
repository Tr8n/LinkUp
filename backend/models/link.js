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
  
  // AI-Generated Fields
  aiAnalysis: {
    // Content extraction
    extractedTitle: String,
    extractedDescription: String,
    extractedImage: String,
    extractedLogo: String,
    
    // Content analysis
    wordCount: {
      type: Number,
      default: 0
    },
    readTime: {
      type: Number,
      default: 0
    },
    complexity: {
      type: Number,
      default: 0,
      min: 0,
      max: 1
    },
    contentType: {
      type: String,
      enum: ['news', 'tutorial', 'documentation', 'blog', 'video', 'image', 'product', 'general', 'unknown'],
      default: 'unknown'
    },
    
    // Keywords and content
    keywords: [String],
    summary: String,
    sentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral'],
      default: 'neutral'
    },
    
    // Structure analysis
    headings: [{
      level: String,
      text: String
    }],
    links: [{
      url: String,
      text: String
    }],
    
    // Metadata
    lastAnalyzed: {
      type: Date,
      default: Date.now
    },
    analysisStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    }
  },
  
  // Duplicate detection
  duplicateInfo: {
    isDuplicate: {
      type: Boolean,
      default: false
    },
    similarityScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 1
    },
    similarLinkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Link'
    }
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

// Index for better performance
linkSchema.index({ userId: 1, createdAt: -1 });
linkSchema.index({ userId: 1, category: 1 });
linkSchema.index({ userId: 1, isFavorite: 1 });
linkSchema.index({ 'aiAnalysis.keywords': 1 });
linkSchema.index({ 'aiAnalysis.contentType': 1 });

// Virtual for read time display
linkSchema.virtual('readTimeDisplay').get(function() {
  const readTime = this.aiAnalysis?.readTime || 0;
  if (readTime < 1) return 'Less than 1 min';
  if (readTime === 1) return '1 min read';
  return `${readTime} min read`;
});

// Virtual for complexity display
linkSchema.virtual('complexityDisplay').get(function() {
  const complexity = this.aiAnalysis?.complexity || 0;
  if (complexity < 0.3) return 'Easy';
  if (complexity < 0.7) return 'Medium';
  return 'Complex';
});

// Virtual for content type icon
linkSchema.virtual('contentTypeIcon').get(function() {
  const contentType = this.aiAnalysis?.contentType || 'unknown';
  const icons = {
    news: '📰',
    tutorial: '📚',
    documentation: '📖',
    blog: '✍️',
    video: '🎥',
    image: '🖼️',
    product: '🛍️',
    general: '🔗',
    unknown: '❓'
  };
  return icons[contentType] || icons.unknown;
});

// Ensure virtuals are included in JSON output
linkSchema.set('toJSON', { virtuals: true });
linkSchema.set('toObject', { virtuals: true });

const Link = mongoose.model('Link', linkSchema);

module.exports = Link;