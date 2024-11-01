import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { 
  deleteNotification, 
  deleteNotifications, 
  getNotifications,
  getUnreadCount,
  markAllAsRead
} from "../controllers/notifications.controller.js";

const router = express.Router();

router.get("/", protectRoute, getNotifications);
router.get("/unread-count", protectRoute, getUnreadCount);
router.post("/mark-read", protectRoute, markAllAsRead); 
router.delete("/", protectRoute, deleteNotifications);
router.delete("/:id", protectRoute, deleteNotification);

export default router;