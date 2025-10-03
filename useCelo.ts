import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

// Celo Alfajores Testnet configuration
const CUSD_ADDRESS = '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1'; // Alfajores cUSD
// A dummy recipient address for the transaction
const RECIPIENT_ADDRESS = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'; // A placeholder address

const CUSD_ABI = [
  "function transfer(address to, uint256 value) public returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
];

// Check if we are in a Celo Minipay environment
const getCeloProvider = () => {
    if (typeof window !== 'undefined' && (window as any).celo) {
        return new ethers.BrowserProvider((window as any).celo);
    }
    return null;
}

export const useCelo = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(getCeloProvider());
  const [error, setError] = useState<string | null>(null);
  
  const isConnected = !!address;

  const connectWallet = useCallback(async () => {
    setError(null);
    if (!provider) {
        setError("Celo wallet not found. Please use this in a Minipay compatible browser.");
        console.error("Celo wallet not found");
        return;
    }
    try {
      const accounts = await provider.send('eth_requestAccounts', []);
      if (accounts.length > 0) {
        setAddress(accounts[0]);
      }
    } catch (e: any) {
      console.error("Failed to connect wallet:", e);
      setError("Failed to connect wallet.");
    }
  }, [provider]);

  // Effect to handle account changes
  useEffect(() => {
    const celo = (window as any).celo;
    if (celo && celo.on) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
        } else {
          setAddress(null);
        }
      };
      celo.on('accountsChanged', handleAccountsChanged);
      
      // Attempt to connect eagerly
      connectWallet();

      return () => {
        if (celo.removeListener) {
            celo.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, [connectWallet]);
  
  const sendCUSDForHint = useCallback(async (): Promise<boolean> => {
    setError(null);
    if (!provider || !address) {
      setError("Wallet not connected.");
      console.error("Wallet not connected.");
      return false;
    }
    try {
      const signer = await provider.getSigner();
      const cusdContract = new ethers.Contract(CUSD_ADDRESS, CUSD_ABI, signer);
      const amount = ethers.parseUnits("0.01", 18); // 0.01 cUSD

      const balance = await cusdContract.balanceOf(address);
      if (balance < amount) {
          setError("Insufficient cUSD balance for a hint.");
          console.error("Insufficient cUSD balance.");
          return false;
      }

      const tx = await cusdContract.transfer(RECIPIENT_ADDRESS, amount);
      await tx.wait(); // Wait for transaction confirmation
      return true;
    } catch (e: any) {
      console.error("Transaction failed:", e);
      setError("Transaction failed. Please try again.");
      return false;
    }
  }, [provider, address]);

  return { connectWallet, sendCUSDForHint, address, isConnected, error };
};
