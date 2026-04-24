const express = require("express");
const router  = express.Router();
const {
  getReviews, getRecentReviews, getTopReviewers, getFeaturedReviews,
  getMyReviews, getStats, searchReviews, getArchives,
  getReviewById, createReview, updateReview, deleteReview,
  toggleFeatured, adminGetAllReviews, adminGetAllUsers, adminDeleteUser,submitContact, adminGetContacts, markContactRead
} = require("../controllers/reviewController");
const { protect, optionalAuth, adminOnly } = require("../middlewares/authMiddleware");

router.get("/stats",              getStats);
router.get("/recent",             getRecentReviews);
router.get("/top-reviewers",      getTopReviewers);
router.get("/featured",           getFeaturedReviews);
router.get("/search",             searchReviews);
router.get("/archives",           getArchives);
router.get("/my-reviews",         protect, getMyReviews);
router.get("/admin/reviews",      protect, adminOnly, adminGetAllReviews);
router.get("/admin/users",        protect, adminOnly, adminGetAllUsers);
router.delete("/admin/users/:id", protect, adminOnly, adminDeleteUser);
router.get("/",                   getReviews);
router.post("/",                  optionalAuth, createReview);
router.put("/:id/feature",        protect, adminOnly, toggleFeatured);
router.put("/:id",                protect, updateReview);
router.delete("/:id",             protect, deleteReview);
router.get("/:id",                getReviewById);
router.post("/contact",          submitContact);
router.get("/admin/contacts",    protect, adminOnly, adminGetContacts);
router.put("/admin/contacts/:id/read", protect, adminOnly, markContactRead);
module.exports = router;





