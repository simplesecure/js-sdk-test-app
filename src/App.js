import React from 'react';
import './App.css';
import SimpleID from 'simpleid-js-sdk';
import { abi, bytecode } from './contractDeets';
const simple = new SimpleID({
  appOrigin: "https://app.graphitedocs.com",
  scopes: ['store_write', 'publish_data'],
  apiKey: "123456",
  devId: "justin.email.email@email.com",
  development: true, 
  network: 'layer2', 
  localRPCServer: 'http://localhost:7545'
});
const address = "0xEC165904f967791C10de91CEeb57e65505063EBf";
const BLOCKSTACK_FILE_NAME = "SimpleID";
let code;
let email;
let valueToSet;
let contract;
let content;

async function auth() {
  const payload = { email };
  const account = await simple.authenticate(payload);
  console.log(account);
}

async function signIn() {
  console.log(code);
  const payload = { email, token: code};
  const account = await simple.authenticate(payload);
  console.log(account);
}

async function createContractTx() {
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

async function fetchContract() {
  contract = await simple.fetchContract(abi, address);
  const taskCount = await contract.taskCount();
  console.log(taskCount.toNumber());
  let i;
  let taskArr = [];
  for (i = 1; i < taskCount.toNumber() + 1; i++) {
    let task = await contract.tasks(i);
    const taskObj = {
      id: task[0],
      content: task[1],
      completed: task[2]
    }
    console.log(taskObj)
    taskArr.push(taskObj);
  }
}

async function deployContract() {
  const params = {
    email: simple.getUserData().email, 
    code
  }
  const contract = await simple.deployContract(params);
  console.log(contract);
  if(contract.address) {
    pollForStatus(contract.deployTransaction.hash);
  } else {
    console.log("ERROR: ", contract);
  }
}

async function pollForStatus(tx) {
  const status = await simple.pollForStatus(tx);
  console.log(status);
  if(status !== "Mined") {
    pollForStatus(tx);
  } else {
    fetchContract();
  }
}

// async function sendTokens() {
//   //This will be a thing eventually
// }

async function setValue() {
  const data = simple.getUserData();
  const account = data.wallet.ethAddr;
  await fetchContract();
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

async function approveTransaction() {
  const params = {
    email: "justin.edward.hunter@gmail.com", 
    contractTx: true, 
    code
  }
  const transaction = await simple.broadcastTransaction(params);
  console.log(transaction);
  if(transaction.success) {
    pollForStatus(transaction.body.hash);
  } else {
    console.log("ERROR: ", transaction);
  }
}

async function postToBlockstack() {
  const userSession = simple.getBlockstackSession();
  const data = await userSession.putFile(BLOCKSTACK_FILE_NAME, JSON.stringify(content));
  console.log(data);
}

async function fetchFromBlockstack() {
  const userSession = simple.getBlockstackSession();
  const data = await userSession.getFile(BLOCKSTACK_FILE_NAME);
  console.log(data);
}

async function pinToIPFS() {
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

async function fetchFromIPFS() {
  const params = {
    email: simple.getUserData().email, 
    id: "testing"
  }
  const fetchedContent = await simple.fetchPinnedContent(params);
  console.log(fetchedContent);
}

function handleCode(e) {
  code = e.target.value;
}

function handleValue(e) {
  valueToSet = e.target.value;
}

function handleEmail(e) {
  email = e.target.value;
}

function handleContent(e) {
  content = e.target.value;
}

function App() {
  console.log(simple.getProvider());
  console.log(simple.getUserData());
  return (
    <div className="App">
      <button onClick={auth}>Auth Token</button>
      <button onClick={signIn}>Login With Token</button>
      <button onClick={pinToIPFS}>Store IPFS</button>
      <button onClick={fetchFromIPFS}>Fetch IPFS</button>
      <button onClick={postToBlockstack}>Store Blockstack</button>
      <button onClick={fetchFromBlockstack}>Fetch Blockstack</button>
      <button onClick={fetchContract}>Fetch Eth Contract</button>
      <button onClick={createContractTx}>Create Contract</button>
      <button onClick={deployContract}>Deploy Contract</button>
      <button onClick={setValue}>Update Contract</button>
      <button onClick={approveTransaction}>Approve Transaction</button> <br/>
      <input type="email" placeholder="email" onChange={handleEmail} /> <br/>
      <input type="text" placeholder="token" onChange={handleCode} /> <br/>
      <input type="text" placeholder="Set contract value" onChange={handleValue} /><br/>
      <input type="text" placeholder="Type some content" onChange={handleContent} />
    </div>
  );
}

export default App;
