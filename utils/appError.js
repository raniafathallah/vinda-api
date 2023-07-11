class AppError extends Error {
     constructor(message, statusCode) {
         super(message);
 
         this.statusCode = statusCode;
         this.status = `${this.statusCode}`.startsWith(4) ? "fail" : "error";
         // Error is of type Operational/Programming
         this.isOperational = true;
 
         //
         Error.captureStackTrace(this, this.constructor);
     }
 }
 
 module.exports = AppError;
 