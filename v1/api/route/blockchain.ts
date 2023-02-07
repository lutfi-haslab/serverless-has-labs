import Web3 from "web3";
import solc from 'solc'

const provider = new Web3.providers.HttpProvider('https://rpc.testnet.tomochain.com')
const web3 = new Web3(provider)

export const Blockchain = async (app, opt, done) => {
  app.post('/compile', async (req, res) => {
    const { contract, nameContract } = req.body;

    const name = nameContract.split('.')[0]
    const input = {
      language: 'Solidity',
      sources: {
        [nameContract]: {
          content: contract
        }
      },
      settings: {
        outputSelection: {
          '*': {
            '*': ['*']
          }
        }
      }
    };


    const output = await JSON.parse(solc.compile(JSON.stringify(input)));
    const result = {
      contractABI: output.contracts[nameContract][name].abi,
      byteCode: output.contracts[nameContract][name].evm['bytecode'].object
    }

    return res.json(result)
  })

  app.post('/deploy', async (req, res) => {
    const { privateKey, bytecode, abi, gas } = req.body;

    let account: any = web3.eth.accounts.privateKeyToAccount(privateKey)
    account = account.address
    const contract = new web3.eth.Contract(abi);
    const contractTx = contract.deploy({
      data: bytecode,
      arguments: [5],
    });

    const createTransaction = await web3.eth.accounts.signTransaction(
      {
        from: account,
        data: contractTx.encodeABI(),
        gas: gas ? 1500000 : gas
      },
      privateKey
    );

    const createReceipt = await web3.eth.sendSignedTransaction(
      createTransaction.rawTransaction
    );

    return res.json(createReceipt)
  })
  done()
}