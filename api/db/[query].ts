import { VercelRequest, VercelResponse } from "@vercel/node";
import nextConnect from 'next-connect';
import { MongoClient } from "mongodb";

const url = process.env.DATABASE_MONGO;
const client = new MongoClient(url);
const dbName = 'blockchain';
const db = client.db(dbName);

const handleQuerySort = (query: any) => {
  try {
    // convert the string to look like json object
    // example "id: -1, name: 1" to "{ "id": -1, "name": 1 }"
    const toJSONString = ("{" + query + "}").replace(/(\w+:)|(\w+ :)/g, (matched => {
      return '"' + matched.substring(0, matched.length - 1) + '":';
    }));

    return JSON.parse(toJSONString);
  } catch (err) {
    return JSON.parse("{}"); // parse empty json if the clients input wrong query format
  }
}

async function main() {
  // Use connect method to connect to the server
  await client.connect();
  console.log('Connected successfully to server');
  const data = await db.collection('user').find().toArray()
  console.log(data)

  // the following code examples can be pasted here...

  return 'done.';
}

const apiRoute = nextConnect({
  onError(error, req: VercelRequest, res: VercelResponse) {
    res.status(501).json({ error: `Sorry something Happened! ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});


apiRoute.get<{
  query: {
    record: string
  }
}>(async (req, res) => {
  const { record, query, sort, limit, skip, ...rest } = req.query;
  // localhost:3000/api/db/query?name=Lutfi&sort=_id:-1&limit=1&skip=1

  const options = {
    sort: handleQuerySort(sort), //localhost:3000/mongo/2?sort=_id:-1
    limit: Number(limit),
    skip: Number(skip)
  }

  try {
    const result = await db.collection(record).find(rest, options).toArray()
    return res.send({ rest, options, result })
  } catch (err) {
    console.log(err)
  }
  // localhost:3000/api/db/record?name=user
});

apiRoute.post<{
  query: {
    name: string
  }
}>(async (req, res) => {
  const { name } = req.query;
  try {
    const user = await db.collection(name).insertOne(req.body)
    return res.json(user)
  } catch (err) {
    console.log(err)
  }
});

main()
export default apiRoute;