import multer from "multer";
import AWS from "aws-sdk";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const multipleUpload = upload.fields([{ name: "csv" }, { name: "zip" }]);
let s3 = new AWS.S3({
  region: "id-jkt-1",
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_KEY,
  endpoint: "https://is3.cloudhost.id"
});

const bucket = "digital-seal";


export {
  upload,
  multipleUpload,
  s3,
  bucket,
};