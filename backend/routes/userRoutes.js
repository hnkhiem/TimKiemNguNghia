const express = require('express');
const router = express.Router();
const {
  registerUser,
  getUserById,
  loginUser,
  UpdateInformation,
  forgotPassword,
  verifyCode,
  resetPassword
} = require('../controllers/userController');

const {
  addActivity,
  getActivitiesByUser
} = require('../controllers/activityController');


// Auth
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/verify-code', verifyCode);
router.post('/reset-password', resetPassword);

// User Info
router.get('/:id', getUserById);
router.put('/:id', UpdateInformation);

// Activity
router.post('/activity', addActivity);
router.get('/:user_id/activity', getActivitiesByUser);

module.exports = router;
