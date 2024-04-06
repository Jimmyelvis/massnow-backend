const express = require('express');
const multer = require('multer');
const storage = multer.memoryStorage(); // Configures Multer to store files in memory
const upload = multer({ storage: storage });
const router = express.Router();
const {
  create,
  list,
  listAllBlogsCategoriesTags,
  read,
  remove,
  update,
  photo,
  listRelated,
  listSearch,
  listTopNews,
  listNotTopNews,
  editTopNewsSection,
  listFeaturedSportsNews,
  notListFeaturedSportsNews,
  getSportsNews,
  editTopSportsNewsSection,
  editTopLocalNewsSection,
  listFeaturedLocalNews,
  notListFeaturedLocalNews,
  addToFavorites,
  removeFromFavorites,
  listAll,
  getBlogCategories,
  uploadImage
} = require("../controllers/blog");

const { requireSignin, adminMiddleware } = require('../controllers/auth');


router.post("/upload-image", upload.single('image'), uploadImage);
router.post('/blog', requireSignin, adminMiddleware, create);
router.get('/blogs', list);
router.get("/blogs/categories", getBlogCategories);
router.get("/blogs/all", listAll);
router.get("/blogs/sports", getSportsNews);
router.get("/blogs/topnews", listTopNews);
router.get("/blogs/not-topnews", listNotTopNews);
router.put("/blogs/edit-topnews/", requireSignin, adminMiddleware,  editTopNewsSection);
router.get("/blogs/topsportsnews", listFeaturedSportsNews);
router.get("/blogs/nottopsportsnews", notListFeaturedSportsNews);
router.get("/blogs/toplocalnews", listFeaturedLocalNews);
router.get("/blogs/nottoplocalnews", notListFeaturedLocalNews);
router.put(
  "/blogs/edit-topsportsnews/",
  requireSignin,
  adminMiddleware,
  editTopSportsNewsSection
);
router.put(
  "/blogs/edit-toplocalnews/",
  requireSignin,
  adminMiddleware,
  editTopLocalNewsSection
);
router.post('/blogs-categories-tags', listAllBlogsCategoriesTags);
router.get('/blog/:slug', read);
router.delete('/blog/:slug', requireSignin, adminMiddleware, remove);
router.put('/blog/:slug', requireSignin, adminMiddleware, update);
router.get('/blog/photo/:slug', photo);
router.post('/blogs/related', listRelated);
router.get('/blogs/search', listSearch);
router.post("/blogs/addtofavorites", addToFavorites);
router.post("/blogs/removefromfavorites", removeFromFavorites);






module.exports = router;
