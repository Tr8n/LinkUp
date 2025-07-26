const Link = require('../models/link');

// Create a new link
const createLink = async (req, res) => {
  try {
    const { name, url, tags } = req.body;
    const userId = req.user._id;
    
    if (!name || !url) {
      return res.status(400).json({ message: 'Name and URL are required' });
    }

    const link = new Link({ name, url, tags, userId });
    await link.save();
    res.status(201).json(link);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create link', error: err.message });
  }
};

// Get all links for the authenticated user
const getLinks = async (req, res) => {
  try {
    const userId = req.user._id;
    const links = await Link.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(links);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch links', error: err.message });
  }
};

// Get a single link by ID (only if owned by user)
const getLinkById = async (req, res) => {
  try {
    const userId = req.user._id;
    const link = await Link.findOne({ _id: req.params.id, userId });
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }
    res.status(200).json(link);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch link', error: err.message });
  }
};

// Update a link by ID (only if owned by user)
const updateLink = async (req, res) => {
  try {
    const { name, url, tags } = req.body;
    const userId = req.user._id;
    
    if (!name || !url) {
      return res.status(400).json({ message: 'Name and URL are required' });
    }

    const link = await Link.findOneAndUpdate(
      { _id: req.params.id, userId },
      { name, url, tags },
      { new: true }
    );
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }
    res.status(200).json(link);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update link', error: err.message });
  }
};

// Delete a link by ID (only if owned by user)
const deleteLink = async (req, res) => {
  try {
    const userId = req.user._id;
    const link = await Link.findOneAndDelete({ _id: req.params.id, userId });
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }
    res.status(200).json({ message: 'Link deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete link', error: err.message });
  }
};

module.exports = {
  createLink,
  getLinks,
  getLinkById,
  updateLink,
  deleteLink
};