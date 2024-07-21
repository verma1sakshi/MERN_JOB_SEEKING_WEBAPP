import express from "express"
import { employerGetAllApplications, jobSeekerGetAllApplications, jobseekerDeleteApplication, postApplication } from "../controllers/applicationController.js";
import {isAuthenticated} from "../middlewares/auth.js"

const router =express.Router();
router.post("/post", isAuthenticated, postApplication);
router.get("/employer/getall", isAuthenticated, employerGetAllApplications);
router.get("/jobseeker/getall", isAuthenticated, jobSeekerGetAllApplications);
// here id for identify which appliction should be deleted
router.delete("/delete/:id", isAuthenticated, jobseekerDeleteApplication);
export default router;