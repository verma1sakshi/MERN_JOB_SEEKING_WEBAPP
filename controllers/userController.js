import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { User } from "../models/userSchema.js";
import ErrorHandler from "../middlewares/error.js";
import { sendToken } from "../utils/jwtToken.js";
// ==========register=========
export const register = catchAsyncErrors(async (req, res, next) => {
  const { name, email, phone, password,role } = req.body;
  if (!name || !email || !phone ||!password ||!role  ) {
    return next(new ErrorHandler("Please fill full form!"));
  }
  const isEmail = await User.findOne({ email });
  if (isEmail) {
    return next(new ErrorHandler("Email already registered!"));
  }
  const user = await User.create({
    name,
    email,
    phone,
    password,
    role,
  });
//   res.status(200).json({ message: "user registered !!",
//   success:true,
//   user
// });
sendToken(user, 201, res, "User Registered!");
});


// =============login=============
export const login = catchAsyncErrors(async (req, res, next) => {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return next(new ErrorHandler("Please provide email ,password and role."));
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return next(new ErrorHandler("Invalid Email Or Password.", 400));
    }
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
      return next(new ErrorHandler("Invalid Email Or Password.", 400));
    }
    if (user.role !== role) {
      return next(
        new ErrorHandler(`User with provided email and ${role} not found!`, 404)
      );
    }
//     res.status(200).json({ message: "user loggedin !!",
//   success:true,
//   user
// });
    sendToken(user, 201, res, "User Logged In!");
  });



  // ========logout===========
  export const logout = catchAsyncErrors(async (req, res, next) => {
    res
      .status(201)
      .cookie("token", "", {
        httpOnly: true,
        expiresIn: new Date(Date.now()),
        secure:true,
        sameSize:"None",
      })
      .json({
        success: true,
        message: "Logged Out Successfully.",
      });
  });

  // =========all users info=========
  export const getUser = catchAsyncErrors((req, res, next) => {
    const user = req.user;
    res.status(200).json({
      success: true,
      message:"get all user info",
      user,
    });
  });
  