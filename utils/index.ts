import multer from "multer";
import AWS from "aws-sdk";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const multipleUpload = upload.fields([{ name: "csv" }, { name: "zip" }]);
let s3 = new AWS.S3({
  region: "id-jkt-1",
  accessKeyId: "B95YFCU5MTH72T9QZ3EL",
  secretAccessKey: "UvM9NkUHEC5woqbZ1orxsdxLJ9rxM6eldILWo3Hy",
  endpoint: "https://is3.cloudhost.id"
});

const bucket = "digital-seal";


export {
  upload,
  multipleUpload,
  s3,
  bucket,
};