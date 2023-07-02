class APIFeatures {
     constructor(query, queryString) {
         this.query = query;
         this.queryString = queryString;
     }
 
     // Filtering out based on query string
     filter() {
         const queryObj = { ...this.queryString };
         const excludedFields = ["page", "sort", "limit", "fields"];
         excludedFields.forEach((el) => delete queryObj[el]);
 
         // Filtering for gt, gte, lt, lte
         let queryStr = JSON.stringify(queryObj);
         queryStr = queryStr.replace(
             /\b(gte|gt|lte|lt)\b/g,
             (match) => `$${match}`
         );
 
         this.query = this.query.find(JSON.parse(queryStr));
         return this;
     }
 
     // Sorting Results
     sort() {
         if (this.queryString.sort) {
             const sortBy = this.queryString.sort.split(",").join(" ");
             // Add onto Query Obj
             this.query = this.query.sort(sortBy);
         } else {
             // Add onto Query Obj
             this.query = this.query.sort("-createdAt");
         }
 
         return this;
     }
 
     // Select Specific Fields
     chooseFields() {
         if (this.queryString.fields) {
             const fields = this.queryString.fields.split(",").join(" ");
             // Add onto Query Obj
             this.query = this.query.select(fields);
         } else {
             // Add onto Query Obj
             this.query = this.query.select("-__v");
         }
 
         return this;
     }
 
     // Pagination of Documents
     paginate() {
         const page = this.queryString.page * 1 || 1;
         const limit = this.queryString.limit * 1 || 100;
         const skip = (page - 1) * limit;
         // Add onto Query Obj
         this.query = this.query.skip(skip).limit(limit);
 
         return this;
     }
 }
 
 module.exports = APIFeatures;
 