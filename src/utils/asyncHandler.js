
// Custom error handler middleware
const asyncHandler = (requestHandler) => {
     // Create a new middleware function that wraps the provided request handler
     return (req, res, next) => {
       // Resolve the request handler as a Promise
       Promise.resolve(requestHandler(req, res, next))
         .catch((err) => {
           // Handle any errors that occur within the request handler
           console.error('Error:', err);
           res.status(500).json({ error: 'Internal Server Error' });
         });
     };
   };
   
   export { asyncHandler };

// const asynHandler =(fn) => async (req,res,next) => {
//      try{
//           await fn(req,res,next)
          

//      }catch (error) {
//           res.status(err.code || 500).json({
//                sucess:false,
//                messaage: err.messaage
//           })

//      }
// }

