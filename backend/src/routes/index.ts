import { Router } from "express";
import publicRoutes from "./publicRoutes";
import registrationRoutes from "./registrationRoutes";
import adminRoutes from "./adminRoutes";

const router = Router();

router.use("/", publicRoutes);
router.use("/", registrationRoutes);
router.use("/admin", adminRoutes);

export default router;
