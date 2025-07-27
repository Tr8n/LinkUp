const Link = require('../models/link');
const aiService = require('../services/aiService');

// Create a new link with AI analysis
const createLink = async (req, res) => {
  try {
    const { name, url, description, category, colorTag, tags, isFavorite } = req.body;
    const userId = req.user._id;

    if (!name || !url) {
      return res.status(400).json({ message: 'Name and URL are required' });
    }

    // Check for duplicates first
    const existingLinks = await Link.find({ userId });
    const duplicateCheck = await aiService.checkDuplicates(url, existingLinks);

    if (duplicateCheck.isDuplicate) {
      return res.status(409).json({
        message: 'This link appears to be a duplicate',
        duplicateInfo: {
          isDuplicate: true,
          similarity: duplicateCheck.similarity,
          similarLink: duplicateCheck.similarLink
        }
      });
    }

    // Start AI analysis in background
    let aiAnalysis = {
      analysisStatus: 'pending',
      lastAnalyzed: new Date()
    };

    // Create the link first
    const link = new Link({
      name,
      url,
      description: description || '',
      category: category || 'other',
      colorTag: colorTag || 'blue',
      tags: tags || [],
      isFavorite: isFavorite || false,
      userId,
      duplicateInfo: {
        isDuplicate: false,
        similarityScore: duplicateCheck.similarity,
        similarLinkId: duplicateCheck.similarLink?._id
      },
      aiAnalysis
    });

    const savedLink = await link.save();

    // Perform AI analysis in background
    performAIAnalysis(savedLink._id, url).catch(error => {
      console.error('AI Analysis failed:', error);
    });

    res.status(201).json(savedLink);
  } catch (error) {
    res.status(500).json({ message: 'Error creating link', error: error.message });
  }
};

// Perform AI analysis on a link
const performAIAnalysis = async (linkId, url) => {
  try {
    // Update status to processing
    await Link.findByIdAndUpdate(linkId, {
      'aiAnalysis.analysisStatus': 'pending'
    });

    // Extract content using AI service
    const extractedData = await aiService.extractContent(url);
    
    // Generate summary
    const summary = aiService.generateSummary(extractedData.content);
    
    // Analyze sentiment
    const sentiment = aiService.analyzeSentiment(extractedData.content);

    // Update link with AI analysis results
    const updatedLink = await Link.findByIdAndUpdate(linkId, {
      aiAnalysis: {
        extractedTitle: extractedData.title,
        extractedDescription: extractedData.description,
        extractedImage: extractedData.image,
        extractedLogo: extractedData.logo,
        wordCount: extractedData.wordCount,
        readTime: extractedData.readTime,
        complexity: extractedData.complexity,
        contentType: extractedData.contentType,
        keywords: extractedData.keywords,
        summary: summary,
        sentiment: sentiment,
        headings: extractedData.headings,
        links: extractedData.links,
        lastAnalyzed: new Date(),
        analysisStatus: 'completed'
      }
    }, { new: true });

    console.log(`AI Analysis completed for link: ${linkId}`);
    return updatedLink;
  } catch (error) {
    console.error('AI Analysis failed:', error);
    
    // Update status to failed
    await Link.findByIdAndUpdate(linkId, {
      'aiAnalysis.analysisStatus': 'failed',
      'aiAnalysis.lastAnalyzed': new Date()
    });
    
    throw error;
  }
};

// Get all links with filtering and AI-enhanced search
const getLinks = async (req, res) => {
  try {
    const userId = req.user._id;
    const { category, search, sortBy = 'createdAt', sortOrder = 'desc', favorite, contentType, complexity } = req.query;

    let query = { userId };

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by favorite
    if (favorite === 'true') {
      query.isFavorite = true;
    }

    // Filter by content type
    if (contentType && contentType !== 'all') {
      query['aiAnalysis.contentType'] = contentType;
    }

    // Filter by complexity
    if (complexity) {
      const complexityRanges = {
        easy: { $lt: 0.3 },
        medium: { $gte: 0.3, $lt: 0.7 },
        complex: { $gte: 0.7 }
      };
      if (complexityRanges[complexity]) {
        query['aiAnalysis.complexity'] = complexityRanges[complexity];
      }
    }

    // Enhanced search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } },
        { 'aiAnalysis.keywords': { $in: [searchRegex] } },
        { 'aiAnalysis.summary': searchRegex },
        { 'aiAnalysis.extractedTitle': searchRegex },
        { 'aiAnalysis.extractedDescription': searchRegex }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const links = await Link.find(query).sort(sortOptions);
    res.json(links);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching links', error: error.message });
  }
};

// Get link categories for sidebar with AI-enhanced stats
const getLinkCategories = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const categories = await Link.aggregate([
      { $match: { userId: userId } },
      { $group: { 
        _id: '$category', 
        count: { $sum: 1 },
        totalReadTime: { $sum: '$aiAnalysis.readTime' },
        avgComplexity: { $avg: '$aiAnalysis.complexity' },
        links: { $push: { name: '$name', _id: '$_id', colorTag: '$colorTag' } }
      }},
      { $sort: { count: -1 } }
    ]);

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

// Get enhanced statistics with AI insights
const getStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Link.aggregate([
      { $match: { userId: userId } },
      { $group: {
        _id: null,
        totalLinks: { $sum: 1 },
        favoriteLinks: { $sum: { $cond: ['$isFavorite', 1, 0] } },
        categories: { $addToSet: '$category' },
        totalReadTime: { $sum: '$aiAnalysis.readTime' },
        avgComplexity: { $avg: '$aiAnalysis.complexity' },
        totalWordCount: { $sum: '$aiAnalysis.wordCount' }
      }}
    ]);

    const categoryStats = await Link.aggregate([
      { $match: { userId: userId } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const contentTypeStats = await Link.aggregate([
      { $match: { userId: userId } },
      { $group: { _id: '$aiAnalysis.contentType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const complexityStats = await Link.aggregate([
      { $match: { userId: userId } },
      { 
        $group: { 
          _id: {
            $cond: [
              { $lt: ['$aiAnalysis.complexity', 0.3] },
              'easy',
              {
                $cond: [
                  { $lt: ['$aiAnalysis.complexity', 0.7] },
                  'medium',
                  'complex'
                ]
              }
            ]
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      totalLinks: stats[0]?.totalLinks || 0,
      favoriteLinks: stats[0]?.favoriteLinks || 0,
      uniqueCategories: stats[0]?.categories?.length || 0,
      totalReadTime: stats[0]?.totalReadTime || 0,
      avgComplexity: stats[0]?.avgComplexity || 0,
      totalWordCount: stats[0]?.totalWordCount || 0,
      categoryStats,
      contentTypeStats,
      complexityStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};

// Get a single link by ID
const getLinkById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const link = await Link.findOne({ _id: id, userId });
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    res.json(link);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching link', error: error.message });
  }
};

// Update a link by ID
const updateLink = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { name, url, description, category, colorTag, tags, isFavorite } = req.body;

    if (!name || !url) {
      return res.status(400).json({ message: 'Name and URL are required' });
    }

    const link = await Link.findOneAndUpdate(
      { _id: id, userId },
      { 
        name, 
        url, 
        description, 
        category, 
        colorTag, 
        tags, 
        isFavorite,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    // Re-analyze if URL changed
    if (link.url !== url) {
      performAIAnalysis(link._id, url).catch(error => {
        console.error('Re-analysis failed:', error);
      });
    }

    res.json(link);
  } catch (error) {
    res.status(500).json({ message: 'Error updating link', error: error.message });
  }
};

// Re-analyze a link with AI
const reanalyzeLink = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const link = await Link.findOne({ _id: id, userId });
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    // Start re-analysis
    performAIAnalysis(link._id, link.url).catch(error => {
      console.error('Re-analysis failed:', error);
    });

    res.json({ message: 'Re-analysis started' });
  } catch (error) {
    res.status(500).json({ message: 'Error starting re-analysis', error: error.message });
  }
};

// Toggle favorite status
const toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const link = await Link.findOne({ _id: id, userId });
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    link.isFavorite = !link.isFavorite;
    link.updatedAt = Date.now();
    const updatedLink = await link.save();

    res.json(updatedLink);
  } catch (error) {
    res.status(500).json({ message: 'Error toggling favorite', error: error.message });
  }
};

// Delete a link by ID
const deleteLink = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const link = await Link.findOneAndDelete({ _id: id, userId });
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    res.json({ message: 'Link deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting link', error: error.message });
  }
};

module.exports = {
  createLink,
  getLinks,
  getLinkCategories,
  getStats,
  getLinkById,
  updateLink,
  reanalyzeLink,
  toggleFavorite,
  deleteLink
};