import express from 'express';

const router = express.Router();

// Placeholder endpoint so backend can start even before vacancy APIs are implemented.
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    data: []
  });
});

export default router;