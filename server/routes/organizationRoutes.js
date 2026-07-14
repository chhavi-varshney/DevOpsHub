import express from "express";
import {
  createOrganization,
  getOrganizations,
  updateOrganization,
  deleteOrganization,
  inviteMember,
  updateMemberRole,
  removeMember,
} from "../controllers/organizationController.js";

import roleMiddleware from "../middleware/roleMiddleware.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Create Organization
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  createOrganization
);
router.get("/", authMiddleware, getOrganizations);
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  updateOrganization
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteOrganization
);

router.post(
  "/:id/invite",
  authMiddleware,
  roleMiddleware("admin"),
  inviteMember
);

router.put(
  "/:id/member-role",
  authMiddleware,
  roleMiddleware("admin"),
  updateMemberRole
);

router.delete(
  "/:id/member",
  authMiddleware,
  roleMiddleware("admin"),
  removeMember
);
export default router;