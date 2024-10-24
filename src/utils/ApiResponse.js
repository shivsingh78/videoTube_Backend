// Class to represent a structured API response
class ApiResponse {
     constructor(statusCode, data, message = "Success") {
       // Set the HTTP status code for the response
       this.statusCode = statusCode;
   
       // Set the data to be included in the response body
       this.data = data;
   
       // Set the response message (optional)
       this.message = message;
   
       // Determine the success status based on the HTTP status code
       // Responses with status codes below 400 are considered successful
       this.success = statusCode < 400;
     }
   }
   
   export { ApiResponse };