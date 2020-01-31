import React from 'react';
import './App.css';
import SimpleID from 'simpleid-js-sdk';
import { abi, bytecode } from './contractDeets';
import Web3Connect from "web3connect";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Portis from "@portis/web3";
import Fortmatic from "fortmatic";
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'
import Spinner from 'react-bootstrap/Spinner'
//const Box = require('3box')
const Web3 = require('web3');
const simple = new SimpleID({
  appOrigin: window.location.origin,
  useSimpledIdWidget: true,
  appName: "PBJ Project",
  appId: "64b05085-4400-4f48-a271-de2377f9ce49",
  network: 'mainnet',
  devWidget: false,
  localRPCServer: 'http://localhost:7545'
});
let web3 = undefined //new Web3(simple.getProvider());
//const web3 = window.web3 ? window.web3 = new Web3(window.web3.currentProvider) : new Web3(Web3.givenProvider);
const address = "0xcf88FA6eE6D111b04bE9b06ef6fAD6bD6691B88c";
const BLOCKSTACK_FILE_NAME = "SimpleID";
const TEST_EMAIL = "justin.edward.hunter@gmail.com";
const TEST_ADDRESS = "0xD5DD03773883c6f12091994482104fDd27F14118";
const WALLET_PROVIDER = "NOT SIMPLEID";
let email;
let valueToSet;
let contract;
let content;

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: 'b8c67a1f996e4d5493d5ba3ae3abfb03'
    }
  },
  portis: {
    package: Portis,
    options: {
      id: "80389521-9f08-4ded-bea3-09795dbb2201"
    }
  },
  fortmatic: {
    package: Fortmatic,
    options: {
      key: 'pk_test_AC1725A313402AC6'
    }
  },
  // burnerconnect: {
  //   package: BurnerConnectProvider,
  //   options: {
  //     defaultNetwork: '100',
  //   },
  // },
  // arkane: {
  //   package: Arkane,
  //   options: {
  //     clientId: process.env.REACT_APP_ARKANE_CLIENT_ID,
  //     environment: "staging"
  //   }
  // },
  // authereum: {
  //   package: Authereum,
  //   options: {}
  // },
  // squarelink: {
  //   package: Squarelink,
  //   options: {
  //     id: process.env.REACT_APP_SQUARELINK_ID
  //   }
  // },
  // torus: {
  //   package: Torus
  // }
}

class App extends React.Component {
  constructor() {
    super()
    this.state = {
      address: "", 
      email: "", 
      displayEmailPrompt: false, 
      loading: false
    }
  }
  async componentDidMount() {
    const userData = simple.getUserData()
    if(userData && userData.wallet) {
      this.setState({ address: userData.wallet.ethAddr })
    }
    // const accounts = await web3.eth.getAccounts();
    // console.log("ACCOUNTS", accounts)

  }

  openBox = async () => {
    const addr = simple.getUserData().wallet.ethAddr;
    // const box = await Box.openBox(addr, web3.currentProvider);
    // console.log(box);
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

  signInWithoutSID = async () => {
    // return this.inlineIdleTestCase()

    const accounts = await web3.eth.getAccounts();
    const { email } = this.state
    console.log(accounts);
    if(accounts.length > 0) {
      //const handleMetamask = await web3.eth.sign('This app is trying to sign you in', accounts[0])
      const msgParams = [
        {
          type: 'string',      // Any valid solidity type
          name: 'Message',     // Any string label you want
          value: 'This application is trying to sign you in using this address.'  // The value to sign
       }
      ] 
      web3.currentProvider.sendAsync({
        method: 'eth_signTypedData',
        params: [msgParams, accounts[0]],
        from: accounts[0],
      }, async (err, result) => {
        if (err) return console.error(err)
        if (result.error) {
          return console.error(result.error.message)
        }
        console.log("RESULT", result);
        if(result.result) {
          let userInfo = undefined
          if(email) {
            userInfo = {
              email,
              address: accounts[0],
              provider: web3.currentProvider.isMetaMask ? "MetaMask" : "Unknown"
            }
            const signedIn = await simple.passUserInfo(userInfo);
            console.log(signedIn)
            //console.log(signedIn)
            if(signedIn && signedIn[0].result && signedIn[0].result === 'success') {
              //window.location.reload()
              this.setState({ address: accounts[0] })
            }
          } else {
            this.setState({ displayEmailPrompt: true })
          }
          
        }
      })

    } else {
      console.log("CONNECT PROVIDER")
    }
  }

  // A quick test case to ensure we can handle many calls w/o throwing
  // bad wallet address etc.
  inlineIdleTestCase = async () => {
    const SAME_DATA_TEST = false
    const ITERATIONS = 5
    const PERMUTATION_START = 22

    if (SAME_DATA_TEST) {
      const permutation = PERMUTATION_START
      const userInfo = {
        email: `justin.edward.hunter+${permutation}@gmail.com`,
        address: `0xD5DD03773883c6f12091994482104fDd27F141${permutation}`,
        provider: "NOT SIMPLEID"
      }
      for (let iteration = 0; iteration < ITERATIONS; iteration++) {
        simple.passUserInfo(userInfo)
      }
    } else {
      for (let iteration = 0; iteration < ITERATIONS; iteration++) {
        let permutation = PERMUTATION_START + iteration
        const userInfo = {
          email: `justin.edward.hunter+${permutation}@gmail.com`,
          address: `0xD5DD03773883c6f12091994482104fDd27F141${permutation}`,
          provider: "NOT SIMPLEID"
        }
        simple.passUserInfo(userInfo)
      }
    }
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
    console.log(contract);
    //const taskCount = await contract.methods.userCount();
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
      value: "00000000005",
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

  // handleCode = (e) => {
  //   code = e.target.value;
  // }

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
      const signed = await web3.eth.signTransaction({
        from: simple.getUserData().wallet.ethAddr,
        gasPrice: "20000000000",
        gas: "21000",
        to: '0xb41C60Db5590331a56162D30DA905b498DcA9130',
        value: "00000000005",
        data: "0x"
      })
      console.log("HERE's THE SIGNED TX: ", signed);
    } catch(e) {
      console.log("IN APP ERROR: ", e);
    }
    // console.log("SIGNED IN APP ", signed);
  }

  sendTx = async () => {
    try {
      web3.eth.sendTransaction({
        from: simple.getUserData().wallet.ethAddr,
        gasPrice: "20000000000",
        gas: "21000",
        to: '0xb41C60Db5590331a56162D30DA905b498DcA9130',
        value: "00000000005",
        data: "0x"
      })
      .on('transactionHash', (hash) => {
        console.log("HERE's THE HASH: ", hash)
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
    const signedMsg = await web3.eth.signPersonal("Hello world", simple.getUserData().wallet.ethAddr);
    console.log("SIGNED", signedMsg);
  }

  signOut = () => {
    simple.signOut();
  }

  updateState = () => {
    this.setState({ updated: true });
  }

  handleEmail = async (emailProvided) => {
    const { email } = this.state
    this.setState({ loading: true });
    const accounts = await web3.eth.getAccounts();
    let userInfo = undefined
    debugger;
    if(emailProvided && email) {
      userInfo = {
        email,
        address: accounts[0],
        provider: web3.currentProvider.isMetaMask ? "MetaMask" : "Unknown"
      }
      const signedIn = await simple.passUserInfo(userInfo);
      console.log(signedIn)
      //console.log(signedIn)
      if(signedIn && signedIn[0].result && signedIn[0].result === 'success') {
        //window.location.reload()
        this.setState({ address: accounts[0], loading: false, displayEmailPrompt: false })
      }
    } else {
      userInfo = {
        address: accounts[0],
        provider: web3.currentProvider.isMetaMask ? "MetaMask" : "Unknown"
      }
      const signedIn = await simple.passUserInfo(userInfo);
      console.log(signedIn)
      //console.log(signedIn)
      if(signedIn && signedIn[0].result && signedIn[0].result === 'success') {
        //window.location.reload()
        this.setState({ address: accounts[0], loading: false, displayEmailPrompt: false })
      }
    }
  }

  

  render() {
    const { address, displayEmailPrompt, email, loading } = this.state
    return (
      <div className="App">
        <div className="text-center">
          <h3>SimpleID Integration Testing</h3>
          <div className="web3-button">
            {
              !address ? 
              <Web3Connect.Button
                network="ropsten" // optional
                providerOptions={providerOptions}
                onConnect={async (provider: any) => {
                  web3 = await new Web3(provider); // add provider to web3
                  console.log(web3.currentProvider)
                  const accounts = await web3.eth.getAccounts()
                  if(accounts && accounts.length > 0) {
                    const msgParams = [
                      {
                        type: 'string',      // Any valid solidity type
                        name: 'Message',     // Any string label you want
                        value: 'This application is trying to sign you in using this address.'  // The value to sign
                     }
                    ] 
                    web3.currentProvider.sendAsync({
                      method: 'eth_signTypedData',
                      params: [msgParams, accounts[0]],
                      from: accounts[0],
                    }, async (err, result) => {
                      if (err) return console.error(err)
                      if (result.error) {
                        return console.error(result.error.message)
                      } else {
                        this.setState({ displayEmailPrompt: true, loading: false })
                      }
                    })
                  } else {
                    console.log("Web3 provider error")
                  }
                }}
                onClose={() => {
                  console.log("Web3Connect Modal Closed"); // modal has closed
                }}
            /> : 
            <div>
              <h5>Welcome back! Here's your wallet address:</h5>
              <p>{address}</p>
              <button onClick={() => simple.signOut()} className="sc-bxivhb idCQSl">Sign Out</button>
            </div>
            }
          </div>
        </div>

        {
          displayEmailPrompt ? 
          <Modal show={displayEmailPrompt} onHide={() => this.setState({ displayEmailPrompt: false})}>
            <Modal.Header closeButton>
              <Modal.Title>Provide Email?</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              {
                !loading ? 
                <div>
                  <p>If you'd like to be able to receive important updates, please provide your email. We do not ever store your email. Instead, we use SimpleID to protect your information and disassociate your email from your wallet address. <a href="https://simpleid.xyz">Learn more here</a>.</p>
                  <InputGroup className="mb-3">
                    <InputGroup.Prepend>
                      <InputGroup.Text id="basic-addon1">Email</InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl
                      value={email}
                      onChange={(e) => this.setState({ email: e.target.value })}
                      placeholder="Enter an email address"
                      aria-label="Email"
                      aria-describedby="basic-addon1"
                    />
                  </InputGroup>
                </div> : 
                <Spinner animation="grow" />
              }

            </Modal.Body>

            <Modal.Footer>
              <Button onClick={() => this.handleEmail(true)} variant="primary">Submit</Button>
              <Button onClick={() => this.handleEmail(false)} variant="secondary">No, thanks</Button>
            </Modal.Footer>
          </Modal>
           : <div />
        }
      </div>
    );
  }
}

export default App;
