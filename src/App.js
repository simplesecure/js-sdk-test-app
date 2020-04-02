import React from 'react';
import './App.css';
import SimpleID from 'simpleid-js-sdk';
import Web3Connect from "web3connect";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Portis from "@portis/web3";
import Fortmatic from "fortmatic";
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'
import Spinner from 'react-bootstrap/Spinner'
const simple = new SimpleID({
  appOrigin: window.location.origin,
  appName: "Test App",
  appId: "660928cd-3ca8-44a6-b375-6b38027fb93d",
  chatAddress: "zdpuAu3rxU7suVYZCpBZSBE19Nfqmr71MLqbq3HVhAtSBtVqq",
  renderNotifications: true,
  network: 'mainnet'
});
const Web3 = require('web3')
let web3 = new Web3(Web3.givenProvider)

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
  }
}

class App extends React.Component {
  constructor() {
    super()
    this.state = {
      address: "",
      email: "",
      displayEmailPrompt: false,
      loading: false,
      showNotificationModal: false,
      html: "",
      plainText: "",
      radarNode: true
    }
  }
  async componentDidMount() {
    const userData = simple.getUserData()
    if(userData && userData.wallet) {
      this.setState({ address: userData.wallet.ethAddr })
      if(!simple.renderNotifications) {
        this.handleNotificationFetch()
      } else {
        simple.notifications()
      }
    }
  }

  handleNotificationFetch = async () => {
    const notifications = await simple.notifications()
    console.log("NOTIFICATIONS: ", notifications)
    if(notifications && notifications.length > 0) {
      this.setState({ showNotificationModal: true, html: notifications[0].content, plainText: notifications[0].plain_text })
    }
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


  signOut = () => {
    simple.signOut();
  }

  handleEmail = async (emailProvided) => {
    const { email } = this.state
    this.setState({ loading: true });
    const accounts = await web3.eth.getAccounts();
    let userInfo = undefined

    if(emailProvided && email) {
      userInfo = {
        email,
        address: accounts[0],
        provider: web3.currentProvider.isMetaMask ? "MetaMask" : "Unknown"
      }
      const signedIn = await simple.passUserInfo(userInfo);
      console.log(signedIn)
      //console.log(signedIn)
      if(signedIn === 'success') {
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
      if(signedIn === 'success') {
        //window.location.reload()
        this.setState({ address: accounts[0], loading: false, displayEmailPrompt: false })
      }
    }
  }

  createMarkup = () => {
    const { html } = this.state
    return {__html: html};
  }

  closeNotifications = async () => {
    this.setState({ showNotificationModal: false })
    // await simple.dismissMessages()
    this.handleNotificationFetch()
  }

  render() {
    const { address, displayEmailPrompt, email, loading, showNotificationModal, plainText, radarNode } = this.state

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
                onConnect={async (provider) => {
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
              <button className="sc-bxivhb idCQSl" onClick={() => this.handleEmail(true)}>Submit</button>
              <Button className="sc-bxivhb idCQSl secondary" onClick={() => this.handleEmail(false)} variant="secondary">No, thanks</Button>
            </Modal.Footer>
          </Modal>
           : <div />
        }

          <Modal show={showNotificationModal} onHide={() => this.setState({ displayEmailPrompt: false})}>
            <Modal.Header closeButton>
              <Modal.Title>Provide Email?</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <p>HTML version of the message: </p>
              <div dangerouslySetInnerHTML={this.createMarkup()} />

              <p>Plain Text Version of the message: </p>
              <div>{plainText}</div>
            </Modal.Body>

            <Modal.Footer>
              <Button className="sc-bxivhb idCQSl secondary" onClick={this.closeNotifications} variant="secondary">Close</Button>
            </Modal.Footer>
          </Modal>
      </div>
    );
  }
}

export default App;
