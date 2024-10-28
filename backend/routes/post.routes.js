import express from  'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { adaptEditPost, adaptNextPost, createPost, deleteAdaptEdit, deleteAdaptNext, deletePost, getAdaptEdit, getAdaptNext, getAllPost, getFollowingPosts, getUserPosts, likeUnlikeAdaptEdit, likeUnlikeAdaptNext, likeUnlikePost } from '../controllers/post.controller.js';

const router = express.Router();

router.get("/all", protectRoute, getAllPost);
router.get("/following", protectRoute, getFollowingPosts);
router.get("/user/:username", protectRoute, getUserPosts);
router.get("/adaptEdits/:id", protectRoute, getAdaptEdit);
router.get("/adaptNexts/:id", protectRoute, getAdaptNext);
router.post("/create", protectRoute, createPost);
router.post("/like/:id", protectRoute, likeUnlikePost);
router.post("/adaptEdit/:id", protectRoute, adaptEditPost);
router.post("/adaptNext/:id", protectRoute, adaptNextPost);
router.delete("/:id", protectRoute, deletePost);
router.delete("/deleteAe/:id", protectRoute, deleteAdaptEdit);
router.delete("/deleteAn/:id", protectRoute, deleteAdaptNext);
router.post("/adaptEdit/like/:id", protectRoute, likeUnlikeAdaptEdit);
router.post("/adaptNext/like/:id", protectRoute, likeUnlikeAdaptNext);

export default router