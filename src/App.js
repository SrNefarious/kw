import React, { useEffect, useState } from 'react';
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES } from "@web3auth/base";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { SolanaWallet } from "@web3auth/solana-provider";
import { Connection, SystemProgram, Transaction, clusterApiUrl, PublicKey } from "@solana/web3.js";
import './App.css';

const clientId = process.env.REACT_APP_WEB3AUTH_CLIENT_ID;
const moonpayApiKey = process.env.REACT_APP_MOONPAY_API_KEY;

function App() {
  const [web3auth, setWeb3auth] = useState(null);
  const [provider, setProvider] = useState(null);
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [displayInfo, setDisplayInfo] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        console.log("Environment:", process.env.NODE_ENV);
        console.log("Initializing Web3Auth...");
        console.log("Client ID:", clientId);
  
        const web3AuthNetwork = process.env.NODE_ENV === 'production' ? "mainnet" : "testnet";
        console.log("Web3Auth Network:", web3AuthNetwork);
  
        const web3auth = new Web3Auth({
          clientId,
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.SOLANA,
            chainId: "0x3", // Devnet
            rpcTarget: clusterApiUrl("devnet"),
          },
          web3AuthNetwork: web3AuthNetwork
        });
  
        const openloginAdapter = new OpenloginAdapter({
          adapterSettings: {
            network: web3AuthNetwork,
            clientId: clientId,
            uxMode: "popup",
          },
        });
  
        web3auth.configureAdapter(openloginAdapter);
  
        setWeb3auth(web3auth);
        await web3auth.initModal();
        console.log("Web3Auth initialized successfully");
        console.log("Web3Auth options:", JSON.stringify(web3auth.options, null, 2));
        console.log("OpenloginAdapter settings:", JSON.stringify(openloginAdapter.adapterSettings, null, 2));
      } catch (error) {
        console.error("Initialization error:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        setError(`Initialization error: ${error.message}`);
      }
    };
  
    init();
  }, []);
  
  

  const login = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    setIsLoading(true);
    try {
      console.log("Attempting to connect...");
      const web3authProvider = await web3auth.connect();
      console.log("Connected successfully, provider:", web3authProvider);
      setProvider(web3authProvider);
      const solanaWallet = new SolanaWallet(web3authProvider);
      const accounts = await solanaWallet.requestAccounts();
      console.log("Accounts received:", accounts);
      setAddress(accounts[0]);
      setDisplayInfo(null);
      console.log("Login successful, address:", accounts[0]);
    } catch (error) {
      console.error("Login error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      setError(`Login error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  

  const getUserInfo = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    setIsLoading(true);
    try {
      const user = await web3auth.getUserInfo();
      setUserInfo(user);
      setDisplayInfo('userInfo');
      console.log("User info retrieved:", user);
    } catch (error) {
      console.error("Error getting user info:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    try {
      await web3auth.logout();
      setProvider(null);
      setAddress("");
      setBalance(null);
      setUserInfo(null);
      setDisplayInfo(null);
      console.log("Logged out successfully");
    } catch (error) {
      console.error("Error during logout:", error);
      setError(error.message);
    }
  };

  const getBalance = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    setIsLoading(true);
    try {
      const solanaWallet = new SolanaWallet(provider);
      const connection = new Connection(clusterApiUrl("devnet"));
      const accounts = await solanaWallet.requestAccounts();
      const balance = await connection.getBalance(new PublicKey(accounts[0]));
      setBalance(balance / 1000000000); // Convert lamports to SOL
      setDisplayInfo('balance');
      console.log("Balance retrieved:", balance / 1000000000);
    } catch (error) {
      console.error("Error getting balance:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const sendTransaction = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    setIsLoading(true);
    try {
      const solanaWallet = new SolanaWallet(provider);
      const connection = new Connection(clusterApiUrl("devnet"));
      const accounts = await solanaWallet.requestAccounts();
      const fromPublicKey = new PublicKey(accounts[0]);
      const block = await connection.getLatestBlockhash("finalized");
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: fromPublicKey,
          toPubkey: fromPublicKey, // Sending to self for this example
          lamports: 0.01 * 1000000000, // 0.01 SOL
        })
      );
      transaction.recentBlockhash = block.blockhash;
      transaction.feePayer = fromPublicKey;
      const signedTransaction = await solanaWallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      await connection.confirmTransaction(signature);
      console.log("Transaction sent successfully:", signature);
      setError("Transaction sent successfully: " + signature);
      getBalance(); // Refresh balance after transaction
    } catch (error) {
      console.error("Error sending transaction:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const buySOL = () => {
    if (!address) return;
    const moonpayUrl = `https://buy.moonpay.com?apiKey=${moonpayApiKey}&currencyCode=sol&walletAddress=${address}`;
    window.open(moonpayUrl, '_blank');
  };

  const sellSOL = () => {
    if (!address) return;
    const moonpayUrl = `https://sell.moonpay.com?apiKey=${moonpayApiKey}&currencyCode=sol&walletAddress=${address}`;
    window.open(moonpayUrl, '_blank');
  };

  return (
    <div className="app-container">
      <div className="glass-panel">
        <h1 className="brand">KROSSWALKS</h1>
        <h2 className="subtitle">Global Settlements</h2>
        
        {error && <p className="error-message">{error}</p>}
        
        {web3auth === null ? (
          <p>Initializing...</p>
        ) : !address ? (
          <button className="main-button" onClick={login} disabled={isLoading}>
            {isLoading ? 'Connecting...' : 'Get Started'}
          </button>
        ) : (
          <div className="wallet-interface">
            <p className="address">Address: {address}</p>
            <div className="button-group">
              <button onClick={getUserInfo} disabled={isLoading}>Get User Info</button>
              <button onClick={getBalance} disabled={isLoading}>Get Balance</button>
              <button onClick={sendTransaction} disabled={isLoading}>Send Transaction</button>
              <button onClick={buySOL} disabled={isLoading}>Buy SOL</button>
              <button onClick={sellSOL} disabled={isLoading}>Sell SOL</button>
              <button onClick={logout} disabled={isLoading}>Logout</button>
            </div>
            {isLoading && <p>Loading...</p>}
            {displayInfo === 'balance' && balance !== null && (
              <p className="balance">Balance: {balance} SOL</p>
            )}
            {displayInfo === 'userInfo' && userInfo && (
              <div className="user-info">
                <h3>User Info:</h3>
                <pre>{JSON.stringify(userInfo, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
