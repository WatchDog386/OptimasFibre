import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { requireUuidParam } from '../middleware/errorHandler.js';
import { listUsers, createUser, updateUser, deleteUser } from '../controllers/userController.js';

const router = express.Router();

router.use(protect, admin);
router.param('id', requireUuidParam('User'));

router.get('/', listUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
