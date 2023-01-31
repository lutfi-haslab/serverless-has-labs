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

const contractAddress = "0x2Bb5C882E9Ed93A7D51d9dDd6aC801EFe0AC6771";
const abi = [
  {
    "inputs": [],
    "name": "a",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "get",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_a",
        "type": "uint256"
      }
    ],
    "name": "set",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const contract = new web3.eth.Contract(abi, contractAddress);

const privateKey = "0x0632fcea7ef96c663922386d15ba5163fa412967dedb41e092162647081d3c96";
// Unlock wallet by private key
const account = web3.eth.accounts.privateKeyToAccount(privateKey)
let coinbase = account.address
web3.eth.accounts.wallet.add(privateKey);
web3.eth.defaultAccount = coinbase
console.log(coinbase)


apiRoute.get(async (req, res) => {
  await contract.methods.get().call().then((v) => {
    return res.json({ message: v });
  });
});

apiRoute.post(async (req, res) => {
  const tx = {
    from: coinbase,
    to: contractAddress,
    gas: 50000,
    data: contract.methods.set(req.query.set).encodeABI()
  }

  const signature = await web3.eth.accounts.signTransaction(tx, privateKey);
  await web3.eth.sendSignedTransaction(signature.rawTransaction).on("receipt", (receipt) => {
    console.log(receipt)
    contract.methods.get().call().then(v => {
      return res.json({ message: v, receipt });
    });
  })
});

export default apiRoute;