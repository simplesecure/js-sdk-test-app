import React from 'react';
import './App.css';
import SimpleID from 'simpleid-js-sdk';
import { abi, bytecode } from './contractDeets';
const Box = require('3box')
const Web3 = require('web3');
const simple = new SimpleID({
  appOrigin: "http://localhost:3001",
  appName: "Test App",
  scopes: ['email'],
  apiKey: "123456",
  devId: "justin.email.email@email.com",
  development: true, 
  network: 'ropsten', 
  localRPCServer: 'http://localhost:7545'
});
const web3 = new Web3(simple.getProvider());
const address = "0xe9F3fe303dAe6223696cE3CE1573D7168100E8E8";
const BLOCKSTACK_FILE_NAME = "SimpleID";
let code;
let email;
let valueToSet;
let contract;
let content;

class App extends React.Component {
  async componentDidMount() {
    const accounts = await web3.eth.getAccounts();
    console.log(accounts);
  }

  openBox = async () => {
    const addr = simple.getUserData().wallet.ethAddr;
    const box = await Box.openBox(addr, web3.currentProvider);
    console.log(box);
  }

  auth = async () => {
    const payload = { email };
    const account = await simple.authenticate(payload);
    console.log(account);
  }
  
  signIn = async () => {
    simple.signUserIn();
    // console.log(code);
    // const payload = { email, token: code};
    // const account = await simple.authenticate(payload);
    // console.log(account);
  }
  
  createContractTx = async () => {
    const data = simple.getUserData();
    const account = data.wallet.ethAddr;
    const payload = {
      email: data.email, 
      fromEmail: "hello@simpleid.xyz", 
      bytecode, 
      abi, 
      account
    }
    const contract = await simple.createContract(payload);
    console.log(contract);
  }
  
  fetchContract = async () => {
    contract = new web3.eth.Contract(abi, address);
    const taskCount = await contract.methods.userCount();
    // contract = await simple.fetchContract(abi, address);
    // const taskCount = await contract.taskCount();
    // console.log(taskCount.toNumber());
    // let i;
    // let taskArr = [];
    // for (i = 1; i < taskCount.toNumber() + 1; i++) {
    //   let task = await contract.tasks(i);
    //   const taskObj = {
    //     id: task[0],
    //     content: task[1],
    //     completed: task[2]
    //   }
    //   console.log(taskObj)
    //   taskArr.push(taskObj);
    // }
  }
  
  deployContract = async () => {
    const contract = new web3.eth.Contract(abi, {
      from: simple.getUserData().wallet.ethAddr, gas: 1000000, data: bytecode
    });
    //const newContract = await contract.new({from: simple.getUserData().wallet.ethAddr, gas: 1000000, data: bytecode})
    contract.deploy({data: bytecode})
    .send({
      from: simple.getUserData().wallet.ethAddr,
      gas: 1500000,
      gasPrice: '20000000000'
    })
    .on('error', function(error){ 
      console.log("ERROR: ", error)
    })
    .on('transactionHash', function(transactionHash){
      console.log("HASH: ", transactionHash)
    })
    .on('receipt', function(receipt){
      console.log("ADDRESS: ", receipt.contractAddress) // contains the new contract address
    })
    .on('confirmation', function(confirmationNumber, receipt){
      console.log("CONFIRMATION NUMBER: ", confirmationNumber);
    })
    .then(function(newContractInstance){
        console.log(newContractInstance.options.address) // instance with the new contract address
    });
    // const params = {
    //   email: simple.getUserData().email, 
    //   code
    // }
    // const contract = await simple.deployContract(params);
    // console.log(contract);
    // if(contract.address) {
    //   this.pollForStatus(contract.deployTransaction.hash);
    // } else {
    //   console.log("ERROR: ", contract);
    // }
  }
  
  pollForStatus = async (tx) => {
    const status = await simple.pollForStatus(tx);
    console.log(status);
    if(status !== "Mined") {
      this.pollForStatus(tx);
    } else {
      this.fetchContract();
    }
  }
  
  // async function sendTokens() {
  //   //This will be a thing eventually
  // }
  
  setValue = async () => {
    const data = simple.getUserData();
    const account = data.wallet.ethAddr;
    await this.fetchContract();
    const params = {
      method: "createTask", 
      value: valueToSet, 
      abi, 
      email: data.email, 
      fromEmail: "hello@simpleid.xyz", 
      account, 
      address
    }
    const approval = await simple.createContractTransaction(params);
    console.log(approval);
  }
  
  approveTransaction = async () => {
    const approval = await web3.eth.approveTransaction({
      from: "0x709eDA1E2cc771C5D17a86422C121785eD7c2Cc0",
      gasPrice: "20000000000",
      gas: "21000",
      to: '0x3535353535353535353535353535353535353535',
      value: "1000000000000000000",
      data: "0x"
    });
    console.log(approval);
    // const params = {
    //   email: simple.getUserData().email, 
    //   contractTx: true, 
    //   code
    // }
    // const transaction = await simple.broadcastTransaction(params);
    // console.log(transaction);
    // if(transaction.success) {
    //   this.pollForStatus(transaction.body.hash);
    // } else {
    //   console.log("ERROR: ", transaction);
    // }
  }
  
  postToBlockstack = async () => {
    const userSession = simple.getBlockstackSession();
    const data = await userSession.putFile(BLOCKSTACK_FILE_NAME, JSON.stringify(content));
    console.log(data);
  }
  
 fetchFromBlockstack = async () => {
    const userSession = simple.getBlockstackSession();
    const data = await userSession.getFile(BLOCKSTACK_FILE_NAME);
    console.log(data);
  }
  
  pinToIPFS = async () => {
    const params = {
      email: simple.getUserData().email, 
      id: "testing", 
      content: {
        title: "SimpleID Test", 
        content
      }
    }
    const pinned = await simple.pinContent(params);
    console.log(pinned);
  }
  
  fetchFromIPFS = async () => {
    const params = {
      email: simple.getUserData().email, 
      id: "testing"
    }
    const fetchedContent = await simple.fetchPinnedContent(params);
    console.log(fetchedContent);
  }
  
  handleCode = (e) => {
    code = e.target.value;
  }
  
  handleValue = (e) => {
    valueToSet = e.target.value;
  }
  
  handleEmail = (e) => {
    email = e.target.value;
  }
  
  handleContent = (e) => {
    content = e.target.value;
  }

  signTx = async () => {
    try {
      web3.eth.sendTransaction({
        from: simple.getUserData().wallet.ethAddr,
        gasPrice: "20000000000",
        gas: "21000",
        to: '0x3ba190E767c1C1bfa7b0e3181829bBCBe82cfcD7',
        value: "0000005",
        data: "0x"
      })
      .on('transactionHash', (hash) => {
        console.log(hash)
      })
    } catch(e) {
      console.log("IN APP ERROR: ", e);
    }
    // console.log("SIGNED IN APP ", signed);
  }

  estGas = async () => {
    const estimate = await web3.eth.estimateGas({
      to: "0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe",
      data: "0xc6888fa10000000000000000000000000000000000000000000000000000000000000003"
    });
    console.log(estimate);
  }

  signMessage = async () => {
    const signedMsg = await web3.eth.sign("Hello world", simple.getUserData().wallet.ethAddr);
    console.log("SIGNED", signedMsg);
  }

  signOut = () => {
    simple.signOut();
  }

  updateState = () => {
    this.setState({ updated: true });
  }

  render() {
    console.log(simple.getProvider());
    console.log(simple.getUserData());
    let loggedIn = false;
    if(simple.getUserData()) {
      loggedIn = true;
    }
    return (
      <div className="App">
        {
          loggedIn ?
          <div>
            <h1>Welcome back!</h1>
            <p>Here's your wallet address: {simple.getUserData().wallet.ethAddr}</p>
          </div> : 
          <h1>Log in to continue</h1>
        }
        <button onClick={this.auth}>Auth Token</button>
        <button onClick={this.signIn}>Login With Token</button>
        <button onClick={this.pinToIPFS}>Store IPFS</button>
        <button onClick={this.fetchFromIPFS}>Fetch IPFS</button>
        <button onClick={this.postToBlockstack}>Store Blockstack</button>
        <button onClick={this.fetchFromBlockstack}>Fetch Blockstack</button>
        <button onClick={this.fetchContract}>Fetch Eth Contract</button>
        <button onClick={this.createContractTx}>Create Contract</button>
        <button onClick={this.deployContract}>Deploy Contract</button>
        <button onClick={this.setValue}>Update Contract</button>
        <button onClick={this.signTx}>Sign Transaction</button> <br/>
        <button onClick={this.signMessage}>Sign Message</button> <br/>
        <button onClick={this.estGas}>Estimate Gas</button> <br/>
        <button onClick={this.approveTransaction}>Approve Transaction</button> <br/>
        <button onClick={this.openBox}>3Box</button> <br/>
        <button onClick={this.signOut}>Sign Out</button> <br/>
        <input type="email" placeholder="email" onChange={this.handleEmail} /> <br/>
        <input type="text" id="token" placeholder="token" onChange={this.handleCode} /> <br/>
        <input type="text" placeholder="Set contract value" onChange={this.handleValue} /><br/>
        <input type="text" placeholder="Type some content" onChange={this.handleContent} />
      </div>
    );
  }
  
}

export default App;
