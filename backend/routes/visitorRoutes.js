
const express = require('express');
const { getVisitors, addVisitor, updateVisitor, deleteVisitor, getVisitor } = require('../controllers/visitorController');
const { protect} = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').get(protect, getVisitors).post(protect, addVisitor);
router.route('/:id').patch(protect, updateVisitor).delete(protect, deleteVisitor);;
router.route('/:visitorId').get(protect, getVisitor)

module.exports = router;