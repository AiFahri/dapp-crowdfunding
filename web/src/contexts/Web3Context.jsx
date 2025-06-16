import React, { createContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { factoryAddress, factoryABI, campaignABI } from "../utils/contract";
import StatusModal from "../components/UI/StatusModal";

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success"
  });

  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [factory, setFactory] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [chainId, setChainId] = useState(null);
  const [donationToken, setDonationToken] = useState(0);

  const showStatusModal = (title, message, type = "success") => {
    setStatusModal({
      isOpen: true,
      title,
      message,
      type
    });
  };

  const closeStatusModal = () => {
    setStatusModal({
      ...statusModal,
      isOpen: false
    });
  };

  useEffect(() => {
    checkIfWalletIsConnected();

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  useEffect(() => {
    if (account && factory) {
      updateDonationToken();
    }
  }, [account, factory]);

  const checkIfWalletIsConnected = async () => {
    try {
      if (!window.ethereum) {
        console.log("Please install MetaMask");
        return;
      }

      const accounts = await window.ethereum.request({ method: "eth_accounts" });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        await setupEthers();
      }
    } catch (error) {
      console.error("Error checking if wallet is connected:", error);
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask");
        return;
      }

      console.log("Requesting accounts...");
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      console.log("Accounts received:", accounts);

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);

        const setup = await setupEthers();

        if (setup) {
          console.log("Wallet connected successfully");
        }
      } else {
        console.error("No accounts found");
        alert("No accounts found. Please check your MetaMask.");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet: " + error.message);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    setSigner(null);
    setFactory(null);
    setDonationToken(0);
  };

  const setupEthers = async () => {
    try {
      console.log("Setting up ethers...");

      if (!window.ethereum) {
        console.error("MetaMask not installed");
        alert("Please install MetaMask");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      console.log("Provider created:", provider);
      const signer = await provider.getSigner();
      console.log("Signer created:", signer);
      const network = await provider.getNetwork();
      const chainId = network.chainId;
      console.log("Connected to chain ID:", chainId);

      setProvider(provider);
      setSigner(signer);
      setChainId(chainId);

      const factory = new ethers.Contract(factoryAddress, factoryABI, signer);
      console.log("Factory contract created:", factory.target);

      if (typeof factory.approverTokens !== "function") {
        console.error("approverTokens function not found in factory contract!");
        console.log("Available functions:", Object.keys(factory.interface.functions));
      }

      setFactory(factory);

      return { provider, signer, factory };
    } catch (error) {
      console.error("Error setting up ethers:", error);
      alert("Failed to connect to blockchain. Please check your MetaMask connection.");
    }
  };

  const updateDonationToken = async () => {
    try {
      if (!signer || !factory || !account) {
        console.log("Cannot update donation token: missing signer, factory, or account");
        return;
      }

      let tokens;
      if (typeof factory.approverTokens === 'function') {
        tokens = await factory.approverTokens(account);
      } else if (typeof factory.getApproverToken === 'function') {
        tokens = await factory.getApproverToken(account);
      } else {
        console.error("No method found to get approver tokens");
        return;
      }
      
      console.log(`Updated donation tokens for ${account}: ${tokens}`);
      setDonationToken(Number(tokens));
    } catch (error) {
      console.error("Failed to update donation token:", error);
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      setupEthers();
    } else {
      disconnectWallet();
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  const handleDonate = async (campaignAddress, amount) => {
    try {
      if (!signer) {
        showStatusModal("Error", "Please connect your wallet first", "error");
        return false;
      }

      console.log(`Donating ${amount} ETH to ${campaignAddress}`);
      
      if (parseFloat(amount) < 0.001) {
        showStatusModal("Info", "Donations less than 0.001 ETH won't earn any donation tokens", "info");
      }
      
      const amountWei = ethers.parseEther(amount);
      const campaign = new ethers.Contract(campaignAddress, campaignABI, signer);

      const tx = await campaign.donate({ value: amountWei });
      console.log("Donation transaction sent:", tx.hash);

      const receipt = await tx.wait();
      console.log("Donation confirmed:", receipt);

      console.log("Current donation tokens before update:", donationToken);
      await updateDonationToken();
      console.log("Donation tokens after update:", donationToken);
      
      showStatusModal("Success", "Thank you for your donation!", "success");
      return true;
    } catch (error) {
      console.error("Donation failed:", error);

      if (error.code === "ACTION_REJECTED") {
        showStatusModal("Transaction Rejected", "Transaction was rejected by user", "error");
      } else if (error.code === "INSUFFICIENT_FUNDS") {
        showStatusModal("Insufficient Funds", "You don't have enough funds for this donation", "error");
      } else {
        showStatusModal("Donation Failed", error.reason || error.message || "Unknown error", "error");
      }

      return false;
    }
  };

  const handleAccept = async (campaignAddress, neededTokens) => {
    try {
      if (!signer) {
        showStatusModal("Error", "Please connect your wallet first", "error");
        return false;
      }

      console.log(`Accepting campaign ${campaignAddress}, needed tokens: ${neededTokens}`);
      
      if (neededTokens <= 0) {
        showStatusModal("Error", "Campaign ini sudah memiliki cukup token persetujuan", "error");
        return false;
      }
      
      console.log(`Calling acceptCampaign with address=${campaignAddress}, amount=${neededTokens}`);
      const tx = await factory.acceptCampaign(campaignAddress, neededTokens);
      await tx.wait();

      await updateDonationToken();
      showStatusModal("Success", "Campaign accepted successfully!", "success");
      return true;
    } catch (error) {
      console.error("Accept failed:", error);
      showStatusModal("Error", "Accept failed: " + error.message, "error");
      return false;
    }
  };

  const createCampaign = async (title, description, targetAmount, deadline) => {
    try {
      if (!signer) {
        alert("Please connect your wallet first");
        return false;
      }

      const targetAmountWei = ethers.parseEther(targetAmount);
      const deadlineTimestamp = Math.floor(new Date(deadline).getTime() / 1000);

      console.log("Creating campaign with params:", {
        title,
        description,
        targetAmount: targetAmountWei.toString(),
        deadline: deadlineTimestamp,
      });

      if (!factory) {
        console.error("Factory contract not initialized");
        alert("Contract not initialized. Please try reconnecting your wallet.");
        return false;
      }

      const data = factory.interface.encodeFunctionData("createCampaign", [title, description, targetAmountWei, deadlineTimestamp]);

      console.log("Sending transaction to MetaMask...");

      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: account,
            to: factoryAddress,
            data: data,
            gas: "0x2DC6C0", // Hex for 3000000 gas
          },
        ],
      });

      console.log("Transaction sent:", txHash);

      const receipt = await provider.waitForTransaction(txHash);
      console.log("Transaction confirmed:", receipt);

      return true;
    } catch (error) {
      console.error("Error creating campaign:", error);

      if (error.code === 4001) {
        alert("Transaction was rejected by user");
      } else if (error.code === "INSUFFICIENT_FUNDS") {
        alert("Insufficient funds to create campaign");
      } else {
        alert("Failed to create campaign: " + (error.message || "Unknown error"));
      }

      return false;
    }
  };

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        factory,
        account,
        isConnected,
        chainId,
        donationToken,
        connectWallet,
        disconnectWallet,
        handleDonate,
        handleAccept,
        createCampaign,
        updateDonationToken,
        showStatusModal,
      }}
    >
      {children}
      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={closeStatusModal}
        title={statusModal.title}
        message={statusModal.message}
        type={statusModal.type}
      />
    </Web3Context.Provider>
  );
};




