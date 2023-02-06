import { MongoClient, ObjectId } from "mongodb";
export { ObjectId } from 'mongodb'

// Mongo Instance
const url = process.env.DATABASE_MONGO;
const client = new MongoClient(url);

export const devDb = client.db('dev');
export const blockchainDb = client.db('blockchain')

export const main = async () => {
  // Use connect method to connect to the server
  await client.connect();
  console.log('Connected successfully to server');

  return 'done.';
}

export const handleSortQuery = (query: any) => {
  try {
    // example "id: -1, name: 1" to "{ "id": -1, "name": 1 }"
    const toJSONString = ("{" + query + "}").replace(/(\w+:)|(\w+ :)/g, (matched => {
      return '"' + matched.substring(0, matched.length - 1) + '":';
    }));

    return JSON.parse(toJSONString);
  } catch (err) {
    return JSON.parse("{}"); // parse empty json if the clients input wrong query format
  }
}