import { CHAIN_NAMESPACES } from "@web3auth/base";

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.SOLANA,
  chainId: process.env.REACT_APP_CHAIN_ID || "0x2", // default to testnet
  rpcTarget: process.env.REACT_APP_RPC_TARGET || "https://api.testnet.solana.com",
  displayName: process.env.REACT_APP_CHAIN_DISPLAY_NAME || "Solana Testnet",
  blockExplorerUrl: process.env.REACT_APP_BLOCK_EXPLORER_URL || "https://explorer.solana.com",
  ticker: "SOL",
  tickerName: "Solana",
};

export const web3AuthNetwork = process.env.REACT_APP_WEB3AUTH_NETWORK || "sapphire_devnet";

export default chainConfig;
