const express = require('express');
const { createAuthorization, getCustomerAuthorizations, verifyAuthorization } = require('../controllers/AuthorizationController');
const router = express.Router();

// Route to create a new authorization slip
// POST /api/authorizations
router.get('/customer/:customerId', getCustomerAuthorizations);

router.post('/', createAuthorization);

// Route to get all authorizations for a specific customer
// GET /api/authorizations/customer/:customerId
router.post("/verify", verifyAuthorization);

module.exports = router;