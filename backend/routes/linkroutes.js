const express = require('express');
const router = express.Router();
const linkController = require('../controllers/linkController');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication middleware to all link routes
router.use(authenticateToken);

// Create a new link
router.post('/', linkController.createLink);

// Get all links
router.get('/', linkController.getLinks);

// Get a single link by ID
router.get('/:id', linkController.getLinkById);

// Update a link by ID
router.put('/:id', linkController.updateLink);

// Delete a link by ID
router.delete('/:id', linkController.deleteLink);

module.exports = router;