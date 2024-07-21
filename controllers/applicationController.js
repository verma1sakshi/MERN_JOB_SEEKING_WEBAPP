import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import {Application} from "../models/applicationSchema.js";
import {Job} from "../models/jobSchema.js";
import cloudinary from "cloudinary";


// =========all applications for employer======

export const employerGetAllApplications = catchAsyncErrors(async(req,res,next)=>{
    // here (user) used from the (const  user ) on the register section of userController folder===
    const { role } = req.user;
    if (role === "Job Seeker") {
        return next(
          new ErrorHandler("Job Seeker not allowed to access this resource.", 400)
        );
      }
      const { _id } = req.user;
      const applications = await Application.find({ "employerID.user": _id });
      res.status(200).json({
        success: true,
        message:"all candidates applications form",
        applications,
      });
    }
  );

// =====all applications form of a Job seeker==========

export const jobSeekerGetAllApplications = catchAsyncErrors(async(req,res,next)=>{
    const { role } = req.user;
    if (role === "Employer") {
        return next(
          new ErrorHandler("Employer not allowed to access this resource.", 400)
        );
      }
      const { _id } = req.user;
      const applications = await Application.find({ "applicantID": _id });
      res.status(200).json({
        success: true,
        message:"all  application form of a jobseeker",
        applications,
      });
    }
  );

  // ===========application deletd by jobseeker==========

  export const jobseekerDeleteApplication = catchAsyncErrors(
    async (req, res, next) => {
      const { role } = req.user;
      if (role === "Employer") {
        return next(
          new ErrorHandler("Employer not allowed to access this resource.", 400)
        );
      }
      const { id } = req.params;
      const application = await Application.findById(id);
      if (!application) {
        return next(new ErrorHandler("Oops Application not found!", 404));
      }
      await application.deleteOne();
      res.status(200).json({
        success: true,
        message: "Application Deleted successfully!",
      });
    }
  );

// =========== fill application post by jobseeker=============

  export const postApplication = catchAsyncErrors(async (req, res, next) => {
    const { role } = req.user;
    if (role === "Employer") {
      return next(
        new ErrorHandler("Employer not allowed to access this resource.", 400)
      );
    }
    if (!req.files || Object.keys(req.files).length === 0) {
      return next(new ErrorHandler("Resume File Required!", 400));
    }
  // here resume are not in formate of pdf bcz we post resume in pdf formate but wecannt get it by cloudinary ,, so we use jpeg,png,webp
    const { resume } = req.files;
    const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
    // --mimetype mean extesion
    if (!allowedFormats.includes(resume.mimetype)) {
      return next(
        new ErrorHandler("Invalid file type. Please upload your resume in PNG / JPEG / WEBP extension file.", 400)
      );
    }
    const cloudinaryResponse = await cloudinary.uploader.upload(
      resume.tempFilePath
    );
// console.log("component of cloudinary",cloudinaryResponse);
    if (!cloudinaryResponse || cloudinaryResponse.error) {
      console.error(
        "Cloudinary Error:",
        cloudinaryResponse.error || "Unknown Cloudinary error"
      );
      return next(new ErrorHandler("Failed to upload Resume to Cloudinary", 500));
    }
    const { name, email, coverLetter, phone, address, jobId } = req.body;
    const applicantID = {
      user: req.user._id,
      role: "Job Seeker",
    };
    // --check job are available or not
    if (!jobId) {
      return next(new ErrorHandler("Job not found!", 404));
    }
    const jobDetails = await Job.findById(jobId);
    // -----if candidate have job id but job has expired for that time
    if (!jobDetails) {
      return next(new ErrorHandler("Job not found!", 404));
    }
  
    const employerID = {
      user: jobDetails.postedBy,
      role: "Employer",
    };
    if (
      !name ||
      !email ||
      !coverLetter ||
      !phone ||
      !address ||
      !applicantID ||
      !employerID ||
      !resume
    ) {
      return next(new ErrorHandler("Please fill all fields.", 400));
    }
    const application = await Application.create({
      name,
      email,
      coverLetter,
      phone,
      address,
      applicantID,
      employerID,
      resume: {
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url,
      },
    });
    res.status(200).json({
      success: true,
      message: " Successfully Application Submitted!",
      application,
    });
  });