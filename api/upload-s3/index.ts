import { VercelRequest, VercelResponse } from "@vercel/node";
import nextConnect from 'next-connect';
import crypto from "node:crypto";
import { bucket, s3, upload } from '../../utils';



export interface MulterFile {
  key: string // Available using `S3`.
  path: string // Available using `DiskStorage`.
  mimetype: string
  originalname: string
  size: number
}

const apiRoute = nextConnect({
  onError(error, req: VercelRequest, res: VercelResponse) {
    res.status(501).json({ error: `Sorry something Happened! ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

apiRoute.use(upload.single("file"));
apiRoute.get((req, res) => {
  return res.json({ message: "Hello World" });
});

apiRoute.post(async (req: VercelRequest & { file: MulterFile[] }, res) => {
  let key = crypto.randomUUID() + "-" + req.file['originalname'];
  const { path } = req.query;

  try {
    await s3
      .putObject({
        Bucket: bucket,
        Key: path + "/" + key,
        Body: req.file['buffer'],
        ACL: "public-read",
        ContentType: req.file["mimetype"],
        ContentDisposition: "inline",
      })
      .promise()
      .then((res) => {
        console.log(`Upload succeeded`);
      })
      .catch((err) => {
        console.log("Upload failed:", err);
      });
    if (path) {
      return res.status(200).json({
        url:
          "https://is3.cloudhost.id/digital-seal/" +
          path +
          "/" +
          encodeURI(key),
        mimetype: req.file["mimetype"],
        originalname: req.file["originalname"],
        size: req.file["size"]
      });
    }
    return res.status(200).json({
      url: "https://is3.cloudhost.id/digital-seal/" + encodeURI(key),
      mimetype: req.file["mimetype"],
      originalname: req.file["originalname"],
      size: req.file["size"]
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
});

export default apiRoute;
export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};