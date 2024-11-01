// user.routes.js
import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { deleteUserProfile, followUnfollowUser, getSuggestedUsers, getUserProfile, searchUsers, updateUser } from '../controllers/user.controller.js';

const router = express.Router();

router.get('/profile/:username', protectRoute, getUserProfile);
router.get('/suggested', protectRoute, getSuggestedUsers);
router.post('/follow/:id', protectRoute, followUnfollowUser);
router.post('/update', protectRoute, updateUser);
router.get('/search', protectRoute, searchUsers);
router.delete('/delete/:id', protectRoute, deleteUserProfile);

export default router;