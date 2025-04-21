import express from "express";
import {
  login,
  register,
  getCurrentUser,
  updateUserProfile,
  uploadProfilePicture,
  deleteProfilePicture,
  getUserSubscription,
  // These functions don't exist yet, so commenting them out:
  // resetPassword,
  // forgotPassword,
  // validateResetToken,
  // favoriteTemplate,
  // getFavoriteTemplates,
} from "../controllers/authController";
import { auth } from "../middleware/auth";
import upload, { handleMulterError } from "../middleware/upload";

const router = express.Router();

// Unprotected routes
router.post("/login", login as express.RequestHandler);
router.post("/register", register as express.RequestHandler);
// These routes don't have handlers yet, so commenting them out:
// router.post('/forgot-password', forgotPassword as express.RequestHandler);
// router.post('/reset-password/:token', resetPassword as express.RequestHandler);
// router.get('/validate-reset-token/:token', validateResetToken as express.RequestHandler);

// Protected routes
router.use(auth as express.RequestHandler);
router.get("/me", getCurrentUser as express.RequestHandler);
router.put("/profile", updateUserProfile as express.RequestHandler);
router.post(
  "/profile/upload-image",
  upload.single("profilePicture"),
  handleMulterError,
  uploadProfilePicture as express.RequestHandler
);
router.delete(
  "/profile/delete-image",
  deleteProfilePicture as express.RequestHandler
);

// Templates favorites routes - these don't exist yet, so commenting them out:
// router.post('/favorites/:templateId', favoriteTemplate as express.RequestHandler);
// router.get('/favorites', getFavoriteTemplates as express.RequestHandler);

// Subscription route
router.get("/subscription", getUserSubscription as express.RequestHandler);

export default router;
