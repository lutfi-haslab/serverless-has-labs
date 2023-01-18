import { VercelRequest, VercelResponse } from "@vercel/node";
import nextConnect from 'next-connect';

const apiRoute = nextConnect({
  onError(error, req: VercelRequest, res: VercelResponse) {
    res.status(501).json({ error: `Sorry something Happened! ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

apiRoute.get((req, res) => {
  return res.json({ message: "Hello World" });
});

apiRoute.post('/auth', (req, res) => {
  return res.json({ message: "Hello World" });
});


export default apiRoute;