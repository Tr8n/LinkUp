const express = require('express');
const router = express.Router();
const linkController = require('../controllers/linkController');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication middleware to all link routes
router.use(authenticateToken);

// Create a new link
router.post('/', linkController.createLink);

// Get all links with filtering
router.get('/', linkController.getLinks);

// Get link categories for sidebar (MUST come before /:id route)
router.get('/categories', linkController.getLinkCategories);

// Get statistics (MUST come before /:id route)
router.get('/stats', linkController.getStats);

// Get a single link by ID
router.get('/:id', linkController.getLinkById);

// Update a link by ID
router.put('/:id', linkController.updateLink);

// Toggle favorite status
router.patch('/:id/favorite', linkController.toggleFavorite);

// Delete a link by ID
router.delete('/:id', linkController.deleteLink);

module.exports = router;