import { Router } from "express";
import { createRegistration, getRegistration } from "../controllers";
import { upload } from "../services/gridfs";
import { adminAuth } from "../middleware";

const router = Router();

router.post("/register", upload.single("resume"), createRegistration);
router.get("/registrations/:id", adminAuth, getRegistration);

export default router;
