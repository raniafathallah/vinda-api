const jwt = require('jsonwebtoken');
const User = require('../models/userModel.js');

const catchAsync = require('../utils/catchAsync');
const AppError = require('./appError.js');

const protect = catchAsync(async (req, res, next) => {
     // -> Check if token exists in request
     let token;

     if (
          req.headers.authorization &&
          req.headers.authorization.startsWith("Bearer")
     ) {
          token = req.headers.authorization.split(" ")[1];
     }else{
          token = req.cookies.jwt||req.body.token;
     }

     if (!token)
          // 401: Unauthorized
          return next(
               new AppError(
                    "You Are not Logged in! Please Login to gain access",
                    401
               )
          );

     const decoded = jwt.verify(token, process.env.JWT_SECRET);

     const currUser = await User.findById(decoded.id).select("-password");
     console.log(currUser);
     // -> Check if user still exists
     if (!currUser)
          return next(
               // 401: Unauthorized
               new AppError(
                    "The user belonging to given token doesn't exist!",
                    401
               )
          );
     // -> Grant Access to the protected resource requested
     req.user = currUser;
     next();
});

const admin = (req, res, next) => {

     
     console.log(req.user);
     if (req.user.role==="admin") {
          next();
     } else {
          res.status(401);
          throw new Error("Not authorized as an admin");
     }
};


// ------------- Middlewares -------------
// Middleware to protect unauthorised access to certain routes (Authentication)
// Middleware to restrict access of a resource to specific roles only (Authorization)
const restrict = (...roles) => {
     // This function actually returns the middleware with req, res, next
     // Since we wanted to pass it additional params(roles) we return this function
     // after calling restrict
     return (req, res, next) => {
          // 403: Forbidden
          if (!roles.includes(req.user.role))
               return next(
                    new AppError(
                         "You do not have permission to perform this action.",
                         403
                    )
               );
          // Allow access since the role is authorized
          next();
     };
};



module.exports = { admin, protect }