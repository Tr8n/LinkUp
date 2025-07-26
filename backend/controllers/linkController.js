const Link = require('../models/link');

// Create a new link
const createLink = async (req, res) => {
  try {
    const { name, url, description, category, colorTag, tags, isFavorite } = req.body;
    const userId = req.user._id;

    if (!name || !url) {
      return res.status(400).json({ message: 'Name and URL are required' });
    }

    const link = new Link({
      name,
      url,
      description: description || '',
      category: category || 'other',
      colorTag: colorTag || 'blue',
      tags: tags || [],
      isFavorite: isFavorite || false,
      userId
    });

    const savedLink = await link.save();
    res.status(201).json(savedLink);
  } catch (error) {
    res.status(500).json({ message: 'Error creating link', error: error.message });
  }
};

// Get all links with filtering and sorting
const getLinks = async (req, res) => {
  try {
    const userId = req.user._id;
    const { category, search, sortBy = 'createdAt', sortOrder = 'desc', favorite } = req.query;

    let query = { userId };

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by favorite
    if (favorite === 'true') {
      query.isFavorite = true;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
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

// Get link categories for sidebar
const getLinkCategories = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const categories = await Link.aggregate([
      { $match: { userId: userId } },
      { $group: { 
        _id: '$category', 
        count: { $sum: 1 },
        links: { $push: { name: '$name', _id: '$_id', colorTag: '$colorTag' } }
      }},
      { $sort: { count: -1 } }
    ]);

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
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

    res.json(link);
  } catch (error) {
    res.status(500).json({ message: 'Error updating link', error: error.message });
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

// Get statistics
const getStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Link.aggregate([
      { $match: { userId: userId } },
      { $group: {
        _id: null,
        totalLinks: { $sum: 1 },
        favoriteLinks: { $sum: { $cond: ['$isFavorite', 1, 0] } },
        categories: { $addToSet: '$category' }
      }}
    ]);

    const categoryStats = await Link.aggregate([
      { $match: { userId: userId } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      totalLinks: stats[0]?.totalLinks || 0,
      favoriteLinks: stats[0]?.favoriteLinks || 0,
      uniqueCategories: stats[0]?.categories?.length || 0,
      categoryStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};

module.exports = {
  createLink,
  getLinks,
  getLinkCategories,
  getLinkById,
  updateLink,
  toggleFavorite,
  deleteLink,
  getStats
};