
const express = require('express');
const { getVisitors, addVisitor, updateVisitor, deleteVisitor, getVisitor } = require('../controllers/visitorController');
const { protect, authorize} = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').get(protect,authorize ('admin'), getVisitors).post(protect, addVisitor);
router.route('/:id').patch(protect, updateVisitor).delete(protect, authorize ('admin'), deleteVisitor);;
router.route('/:visitorId').get(protect, authorize ('admin'), getVisitor)

module.exports = router;