import * as multer from "multer";
import * as AWS from "aws-sdk";
import { VercelRequest, VercelResponse } from "@vercel/node";
import nextConnect from 'next-connect';
import cors from 'cors'

const apiRoute = nextConnect({
  onError(error, req: VercelRequest, res: VercelResponse) {
    res.status(501).json({ error: `Sorry something Happened! ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

apiRoute.use(cors());

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
  apiRoute
};