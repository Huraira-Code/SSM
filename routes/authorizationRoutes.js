const express = require('express');
const { 
  createAuthorization, 
  getCustomerAuthorizations, 
  verifyAuthorization,
  updateAuthorization, // Added
  deleteAuthorization  // Added
} = require('../controllers/AuthorizationController');

const router = express.Router();

// @desc    Create a new authorization slip
// @route   POST /api/authorizations
router.post('/', createAuthorization);

// @desc    Get all authorizations for a specific customer
// @route   GET /api/authorizations/customer/:customerId
router.get('/customer/:customerId', getCustomerAuthorizations);

// @desc    Verify authorization slip before proceeding
// @route   POST /api/authorizations/verify
router.post("/verify", verifyAuthorization);

// @desc    Update an existing authorization slip
// @route   PUT /api/authorizations/:id
router.put('/:id', updateAuthorization);

// @desc    Delete an authorization slip
// @route   DELETE /api/authorizations/:id
router.delete('/:id', deleteAuthorization);

module.exports = router;