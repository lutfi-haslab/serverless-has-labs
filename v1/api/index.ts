import 'dotenv/config'
import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import { main, devDb, handleSortQuery, ObjectId } from "./config/db"
import { VM, NodeVM, VMScript } from 'vm2'

import { checkValidation } from './config/schemaValidation';

// VM2 Instance
const vm = new NodeVM({
  allowAsync: true,
  sandbox: { print: console.log },
  require: { external: true }
});

// Fastify Instance
const PORT: number = 3000;
const HOST: string = "0.0.0.0" || "localhost";
const app = Fastify({
  logger: true,
});

// @GET ALL COLLECTION
// localhost:3000/v1/api/record?name=user
app.get("/v1/api/record", async (req: FastifyRequest<{
  Querystring: {
    name: string
  }
}>, res: FastifyReply) => {
  const { name: collectionName } = req.query;

  try {
    const data = await devDb.collection(collectionName).find({}).toArray()
    return res.send(data)
  } catch (err) {
    return res.send(err)
  }
});

// @GET COLLECTION BY ID TO GET FUNCTION
// localhost:3000/v1/api/record?name=user
app.get("/v1/api/fn/record", async (req: FastifyRequest<{
  Querystring: {
    name: string,
    id: string,
    fn: string
  }
}>, res: FastifyReply) => {
  const { name: collectionName, id, fn } = req.query;

  try {
    const data = await devDb.collection(collectionName).find({ _id: new ObjectId(id) }).toArray()

    const functionObject = data[0].function.filter((item) => {
      return item.name == fn
    })

    const script = new VMScript(functionObject[0].fn);

    const result = vm.run(script)()

    return res.send(await result)
  } catch (err) {
    return res.send(err)
  }
});

// @GET COLLECTION WITH QUERY
//localhost:3000/v1/api/record/user/query?sort=_id:-1&limit=1
app.get("/v1/api/record/:name/query", async (req: FastifyRequest<{
  Querystring: {
    sort: string,
    limit: string,
    skip: string,
  },
  Params: {
    name: string
  }
}>, res: FastifyReply) => {
  const { sort, limit, skip, ...rest } = req.query;
  const { name: collectionName } = req.params;

  const options = {
    sort: handleSortQuery(sort),
    limit: Number(limit),
    skip: Number(skip)
  }

  try {
    const user = await devDb.collection(collectionName).find(rest, options).toArray()
    return res.send({ rest, options, user })
  } catch (err) {
    console.log(err)
  }
});

// @POST TO ROOT OBJECT OF COLLECTION
// localhost:3000/v1/api/user/:idUser/record/:collectionName
app.post("/v1/api/user/:idUser/record/:collectionName", async (req: FastifyRequest<{
  Querystring: {
    object: string
  },
  Params: {
    idUser: string,
    id: string,
    collectionName: string
  }
}>, res: FastifyReply) => {
  const { id, idUser, collectionName } = req.params;
  const collectionUser: string = "user";
  const object = "root";

  const queryUser: {
    _id: ObjectId
  } = {
    _id: new ObjectId(idUser)
  } as const

  try {
    const data = await devDb.collection(collectionUser).find(queryUser).toArray();
    console.log(data)
    let schema = data[0].records.filter((item: any) => {
      return item.name == collectionUser && item.object == object
    })[0].schema

    const validation = checkValidation(req.body, schema)

    // Insert to Root
    if (validation.result) {
      const data = await devDb.collection(collectionName).insertOne(req.body)
      return res.send(data)
    }

    return res.send(validation)
  } catch (err) {
    return res.send(err)
  }
});

// @POST TO CHILD OBJECT OF COLLECTION
// localhost:3000/v1/api/user/:idUser/record/:collectionName/:id?object=root
app.post("/v1/api/user/:idUser/record/:collectionName/:id", async (req: FastifyRequest<{
  Querystring: {
    object: string
  },
  Params: {
    idUser: string,
    id: string,
    collectionName: string
  }
}>, res: FastifyReply) => {
  const { object } = req.query;
  const { id, idUser, collectionName } = req.params;
  const collectionUser: string = "user";

  const queryUser: {
    _id: ObjectId
  } = {
    _id: new ObjectId(idUser)
  } as const

  const query: {
    _id: ObjectId
  } = {
    _id: new ObjectId(id)
  } as const

  try {
    const data = await devDb.collection(collectionUser).find(queryUser).toArray();
    console.log(data)
    let schema = data[0].records.filter((item: any) => {
      return item.name == collectionUser && item.object == object
    })[0].schema

    const validation = checkValidation(req.body, schema)

    if (validation.result && object !== "root") {
      let obj = {}
      obj[object] = req.body
      console.log(obj)
      const data = await devDb.collection(collectionName).updateOne(query, {
        $addToSet: obj
      })
      return res.send(data)
    }
    return res.send(validation)
  } catch (err) {
    return res.send(err)
  }
});

/**
 * Run the server!
 */

const start = async () => {
  try {
    await app.listen({ port: PORT, host: HOST });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};
// Databases
main();
// Fastify
start();