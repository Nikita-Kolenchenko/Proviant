import express from "express";

const router = express.Route();

router.get("/product/:slug");
router.get("/category/:category");

export default router;
