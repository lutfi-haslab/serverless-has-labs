import Web3 from 'web3'
import nextConnect from 'next-connect';

const apiRoute = nextConnect({
  onError(error, req, res) {
    res.status(501).json({ error: `Sorry something Happened! ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});


// Connect to TomoChain nodes
const provider = new Web3.providers.HttpProvider('https://rpc.testnet.tomochain.com')
const web3 = new Web3(provider)

const contractAddress = "0x128C294b9e1AE7fea20dbFFa30ca0BEB50479edA";
const abi = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "jsonDataArray",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_jsonData",
        "type": "string"
      }
    ],
    "name": "storeData",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllData",
    "outputs": [
      {
        "internalType": "string[]",
        "name": "",
        "type": "string[]"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "getData",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "getArrayLength",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  }
];

const contract = new web3.eth.Contract(abi, contractAddress);

const privateKey = process.env.WALLET_PRIVATE_KEY;
// Unlock wallet by private key
const account = web3.eth.accounts.privateKeyToAccount(privateKey)
let coinbase = account.address
web3.eth.accounts.wallet.add(privateKey);
web3.eth.defaultAccount = coinbase
console.log(coinbase)


apiRoute.get(async (req, res) => {
  const { id } = req.query;
  if (id) {
    await contract.methods.getData(id).call().then((v) => {
      return res.json({ message: JSON.parse(v) });
    });
  } else {
    await contract.methods.getAllData().call().then((v) => {
      const parsedData = v.map(jsonString => JSON.parse(jsonString));

      return res.json({ message: parsedData });
    });
  }

});

apiRoute.post(async (req, res) => {
  const { ...data } = req.body

  const gasAmount = await contract.methods.storeData(JSON.stringify(data)).estimateGas({ from: coinbase });
  const gasPrice = await web3.eth.getGasPrice();
  const fee = gasPrice * gasAmount;


  const tx = {
    from: coinbase,
    to: contractAddress,
    gas: Number(gasAmount),
    data: contract.methods.storeData(JSON.stringify(data)).encodeABI()
  }

  const signature = await web3.eth.accounts.signTransaction(tx, privateKey);
  await web3.eth.sendSignedTransaction(signature.rawTransaction).on("receipt", (receipt) => {
    console.log(receipt)
    contract.methods.getAllData().call().then(v => {
      return res.json({ message: v, receipt });
    });
  })
});

export default apiRoute;