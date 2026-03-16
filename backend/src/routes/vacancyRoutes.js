import express from 'express';
import { uploadDocumentArray } from '../middleware/uploadMiddleware.js';
import { submitApplication } from '../controllers/vacancyController.js';

const router = express.Router();

router.post('/apply', uploadDocumentArray('documents', 5), submitApplication);

export default router;