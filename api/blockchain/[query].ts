import { apiRoute } from '../../utils';
import hash from 'object-hash';
import { MongoClient } from "mongodb";
import mongoose from "mongoose";
mongoose.set('strictQuery', true);
let Schema = mongoose.Schema;

let BlockChainSchema = new Schema({
  index: {
    required: true,
    type: Schema.Types.Number
  },
  timestamp: {
    required: true,
    type: Schema.Types.Date,
    default: Date.now()
  },
  transactions: {
    required: true,
    type: Schema.Types.Array
  },
  prevHash: {
    required: false,
    type: Schema.Types.String
  },
  hash: {
    required: true,
    type: Schema.Types.String
  }
});

let blockChainModel = mongoose.model("block", BlockChainSchema);



const url = process.env.DATABASE_MONGO;
const client = new MongoClient(url);
const dbName = 'blockchain';
const db = client.db(dbName);
const TARGET_HASH = 1560;


// async function main() {
//   // Use connect method to connect to the server
//   await mongoose.connect(`${url}/blockchain`)
// }

async function main() {
  // Use connect method to connect to the server
  await client.connect();
  console.log('Connected successfully to server');
  const data = await db.collection('block').find().toArray()
  console.log(data)

  // the following code examples can be pasted here...

  return 'done.';
}


type Block = {
  index: number,
  timestamp: number,
  transactions: Object,
  prevHash: string,
  hash: string
}

class BlockChain {
  chain: Array<Block>;
  newBlock: Block[];
  curr_transactions: any[];

  constructor() {

    //Create
    this.chain = [];
    this.newBlock = [];
    //Transaction
    this.curr_transactions = [];

  }

  async addNewBlock(prevHash) {
    let block: Block = {
      index: this.chain.length + 1,
      timestamp: Date.now(),
      transactions: this.curr_transactions,
      prevHash: prevHash,
      hash: null
    };
    block.hash = hash(block);
    this
      .chain
      .push(block);
    this.newBlock.push(block)
    this.curr_transactions = [];
    console.log('108', block)
    console.log('109', this.curr_transactions)
    return block;
  }

  async addNewTransaction(sender: any, recipient: any, amount: any) {
    this
      .curr_transactions
      .push({ sender, recipient, amount });
  }

  lastBock() {
    return this
      .chain
      .slice(-1)[0];
  }

  getNewBlock(){
    return this.newBlock[0]
  }

  getPrevHash() {
    return this
      .chain
      .slice(-1)[0]?.hash;
  }



  isEmpty() {
    return this.chain.length == 0;
  }

}

let blockChain = new BlockChain();

apiRoute.get(async (req, res) => {

  const validProof = (proof: any) => {
    let guessHash = hash(proof);
    // console.log("Hashing: ", guessHash);
    return guessHash == hash(TARGET_HASH);
  }

  const proofOfWork = () => {
    let proof = 0;
    while (true) {
      if (!validProof(proof)) {
        proof++;
      } else {
        break;
      }
    }
    return proof;
  }

  if (proofOfWork() == TARGET_HASH) {
    blockChain.addNewTransaction("islem6", "alex", 200);
    const prevBlock = await db.collection('block').findOne({}, {sort: {_id: -1}, limit: 1})
    blockChain.addNewBlock(prevBlock.hash);
    const data = await db.collection('block').insertOne(blockChain.getNewBlock())
    return res.json(data);
  }
});



main().catch(err => console.log(err));
export default apiRoute;