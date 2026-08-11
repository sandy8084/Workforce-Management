const express = require('express');
const router = express.Router();
const { verifyToken, allowRoles } = require('../middleware/authMiddleware');
const {
  getAllAssets, getAssetById, createAsset, updateAsset, deleteAsset, getMyAssets, getAllAssignments, getStockSummary
} = require('../controllers/assetController');

// Only ITADMIN can manage assets
router.get('/me', verifyToken, getMyAssets);
router.get('/', verifyToken, allowRoles('ITADMIN'), getAllAssets);
router.get('/assignments/all', verifyToken, allowRoles('ITADMIN'), getAllAssignments);
router.get('/stock/summary', verifyToken, allowRoles('ITADMIN'), getStockSummary);
router.get('/:tag', verifyToken, allowRoles('ITADMIN'), getAssetById);
router.post('/', verifyToken, allowRoles('ITADMIN'), createAsset);
router.put('/:tag', verifyToken, allowRoles('ITADMIN'), updateAsset);
router.delete('/:tag', verifyToken, allowRoles('ITADMIN'), deleteAsset);

module.exports = router;