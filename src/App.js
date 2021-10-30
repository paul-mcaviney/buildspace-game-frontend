import React, { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import SelectCharacter from './Components/SelectCharacter';
import { CONTRACT_ADDRESS, transformCharacterData } from './constants';
import blockchainGame from './utils/BlockchainGame.json';
import { ethers } from 'ethers';
import Arena from './Components/Arena';

// Constants
const TWITTER_HANDLE = 'paul_can_code';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {

  // State variable used to store user's public wallet
  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);

  // Actions
  const checkIfWalletIsConnected = async () => {

    try {
      // make sure we have access to window.ethereum
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have MetaMask!");
        return;
      } else {
        console.log("Ethereum Object Found", ethereum);

        // Check if authorized to access user's wallet 
        const accounts = await ethereum.request({ method: "eth_accounts" });

        // User may have multiple authorized accounts - grab the first if there 
        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log("Found an authorized account:", account);
          setCurrentAccount(account);
        } else {
          console.log("No Authorized Account Found");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  
  // Connect Wallet Function
  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get Metamask!");
        return;
      }

      // Access account
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      // Log public address once Metamask is authorized
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };


  // Run the function when the page loads
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    // Function to interact with smart contract 
    const fetchNFTMetadata = async () => {
      console.log("Checking for Character NFT on address:", currentAccount);

      const provider = new ethers.providers.Web3Provider(window.ethereum); 
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(CONTRACT_ADDRESS, blockchainGame.abi, signer);

      const txn = await gameContract.checkIfUserHasNFT();
      if (txn.name) {
        console.log("User has a character NFT");
        setCharacterNFT(transformCharacterData(txn));
      } else 
        {console.log("No character NFT found");}
    };

    // Run if we have a connected wallet 
    if (currentAccount) {
      console.log("CurrentAccount:", currentAccount);
      fetchNFTMetadata();
    }
  }, [currentAccount]);

  // Render Functions
  const renderContent = () => {

   // Scenario 1
   if (!currentAccount) {
    return (
      <div className="connect-wallet-container">
        <img
          src="https://i.imgur.com/BBlKNXu.jpg"
          alt="Dragon Ball Z Battle Logo"
        />
        <button
          className="cta-button connect-wallet-button"
          onClick={connectWalletAction}
        >
          Connect Wallet To Get Started
        </button>
      </div>
    );

    // Scenario 2
    } else if (currentAccount && !characterNFT) {
      return <SelectCharacter setCharacterNFT={setCharacterNFT} />

      // If there is a connected wallet and character NFT head to Arena
    } else if (currentAccount && characterNFT) {
      return <Arena characterNFT={characterNFT} />;
    }
  };

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Dragon Ball Z Battle!</p>
          <p className="sub-text">Team up to protect the Metaverse from the evil Cell!</p>
          {renderContent()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
