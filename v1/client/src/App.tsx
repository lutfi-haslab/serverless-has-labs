import { useState, useEffect } from "react";
import Web3 from "web3";

declare let window: any;

const abi: any = [
  {
    inputs: [],
    name: "a",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_a",
        type: "uint256",
      },
    ],
    name: "set",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "get",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const bytecode =
  "608060405234801561001057600080fd5b5061017f806100206000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c80630dbe671f1461004657806360fe47b1146100645780636d4ce63c14610080575b600080fd5b61004e61009e565b60405161005b91906100d0565b60405180910390f35b61007e6004803603810190610079919061011c565b6100a4565b005b6100886100ae565b60405161009591906100d0565b60405180910390f35b60005481565b8060008190555050565b60008054905090565b6000819050919050565b6100ca816100b7565b82525050565b60006020820190506100e560008301846100c1565b92915050565b600080fd5b6100f9816100b7565b811461010457600080fd5b50565b600081359050610116816100f0565b92915050565b600060208284031215610132576101316100eb565b5b600061014084828501610107565b9150509291505056fea26469706673582212206e38676c1694930a393d5d8028b2c9a6a8e781557ee65ee8007b710203a3fee964736f6c63430008120033";

function App() {
  const [walletAddress, setWalletAddress] = useState();
  const [stateVariable, setStateVariable] = useState();
  const [changedStateVariable, setChangedStateVariable] = useState();

  let provider = typeof window !== "undefined" && window.ethereum;

  const connectMeta = async () => {
    try {
      if (!provider) return alert("Please Install MetaMask");

      const accounts = await provider.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length) {
        setWalletAddress(accounts[0]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const deploy = async () => {
    console.log("deploy");
    const web3 = new Web3(provider);
    const contract = new web3.eth.Contract(abi);
    const contractTx = contract.deploy({
      data: bytecode,
      arguments: [5],
    });

    const transactionParameters = {
      from: window.ethereum.selectedAddress,
      data: contractTx.encodeABI(),
      gas: String(1500000),
    };
    //sign transaction via Metamask
    window.ethereum
      .request({
        method: "eth_sendTransaction",
        params: [transactionParameters],
      })
      .then((txHash: any) => {
        console.log("txHash", txHash);
      })
      .catch((e) => console.log(e));
  };

  useEffect(() => {
    connectMeta();
    console.log(walletAddress);
  }, [walletAddress]);

  return (
    <div>
      <h1>Hello World!</h1>
      <p>address: {walletAddress}</p>
      <button onClick={deploy}>Deploy</button>
    </div>
  );
}

export default App;
