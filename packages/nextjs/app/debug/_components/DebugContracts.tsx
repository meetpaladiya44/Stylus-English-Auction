"use client";

import { useEffect, useState } from "react";
import { IEnglishAuction } from "./IStylusToken";
import { ethers } from "ethers";
import Link from "next/link";
import { useGlobalState } from "~~/services/store/store";

const contractAddress = "0x4e16ec2bae1c7806664438002f4d23c57b8e593c"; // Get this from run-dev-node.sh output
const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL || "");
const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY || "";
const signer = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(contractAddress, IEnglishAuction, signer);

export function DebugContracts() {
  const [nftAddressInput, setNftAddressInput] = useState<string>("");
  const [nftIdInput, setNftIdInput] = useState<string>("");
  const [startingBidInput, setStartingBidInput] = useState<string>("");
  const [bidAmountInput, setBidAmountInput] = useState<string>("");
  const [seller, setSeller] = useState<string>("");
  const [nftAddress, setNftAddress] = useState<string>("");
  const [nftId, setNftId] = useState<string>("");
  const [started, setStarted] = useState<boolean>(false);
  const [ended, setEnded] = useState<boolean>(false);
  const [endAt, setEndAt] = useState<number | null>(null);
  const [highestBidder, setHighestBidder] = useState<string>("");
  const [highestBid, setHighestBid] = useState<string>("0");
  const [myBid, setMyBid] = useState<string>("0");
  const addTx = useGlobalState(s => s.addTx);
  const updateTxStatus = useGlobalState(s => s.updateTxStatus);
  const [txStatus, setTxStatus] = useState<{
    status: "none" | "pending" | "success" | "error";
    message: string;
    operation?: string;
  }>({ status: "none", message: "" });
  
  // NFT ownership and approval status
  const [nftOwnershipStatus, setNftOwnershipStatus] = useState<{
    isOwner: boolean;
    isApproved: boolean;
    owner: string;
    approvedAddress: string;
    balance: string;
    details: string;
  }>({
    isOwner: false,
    isApproved: false,
    owner: "",
    approvedAddress: "",
    balance: "0",
    details: ""
  });

  const fetchContractInfo = async () => {
    try {
      const [sellerAddr, nftAddr, nftIdVal, startedVal, endedVal, endAtVal, hbAddr, hbVal, myBidVal] = await Promise.all([
        contract.seller(),
        contract.nft(),
        contract.nftId(),
        contract.started(),
        contract.ended(),
        contract.endAt(),
        contract.highestBidder(),
        contract.highestBid(),
        contract.bids(signer.address),
      ]);
      setSeller(sellerAddr);
      setNftAddress(nftAddr);
      setNftId(ethers.toNumber(nftIdVal).toString());
      setStarted(Boolean(startedVal));
      setEnded(Boolean(endedVal));
      setEndAt(Number(ethers.toNumber(endAtVal)) || null);
      setHighestBidder(hbAddr);
      setHighestBid(ethers.formatEther(hbVal));
      setMyBid(ethers.formatEther(myBidVal));
    } catch (error: unknown) {
      console.error("Error fetching auction info:", error);
      // Set default values if contract is not initialized
      setSeller("");
      setNftAddress("");
      setNftId("");
      setStarted(false);
      setEnded(false);
      setEndAt(null);
      setHighestBidder("");
      setHighestBid("0");
      setMyBid("0");
    }
  };

  const fetchBalance = async () => {};

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setTxStatus({ status: "success", message: "Contract address copied to clipboard!" });
    } catch (err) {
      setTxStatus({ status: "error", message: "Failed to copy address" });
    }
  };

  const approveAuctionContract = async () => {
    if (!nftAddress || !nftId) {
      setTxStatus({ status: "error", message: "No NFT address or ID provided" });
      return;
    }
    
    try {
      const nftABI = [
        "function approve(address to, uint256 tokenId) external",
        "function setApprovalForAll(address operator, bool approved) external"
      ];
      const nftContract = new ethers.Contract(nftAddress, nftABI, signer);
      
      setTxStatus({ status: "pending", message: "Approving auction contract to transfer NFT..." });
      
      // Approve the auction contract to transfer this specific NFT
      const tx = await nftContract.approve(contractAddress, nftId);
      await tx.wait();
      
      setTxStatus({ status: "success", message: "✅ Auction contract approved to transfer NFT!" });
      
      // Update the approval status
      setNftOwnershipStatus(prev => ({
        ...prev,
        isApproved: true,
        details: "✅ You own this NFT and the auction contract is approved to transfer it."
      }));
      
      // Refresh the ownership check
      await checkNFTOwnership();
      
    } catch (error: any) {
      console.error("Error approving auction contract:", error);
      setTxStatus({ status: "error", message: "Failed to approve auction contract" });
    }
  };

  const checkNFTOwnership = async () => {
    if (!nftAddress || !nftId) {
      console.log("No NFT address or ID provided");
      return false;
    }
    
    try {
      // Create a simple ERC721 contract to check ownership
      const nftABI = [
        "function ownerOf(uint256 tokenId) view returns (address)",
        "function balanceOf(address owner) view returns (uint256)",
        "function supportsInterface(bytes4 interfaceId) view returns (bool)",
        "function getApproved(uint256 tokenId) view returns (address)",
        "function isApprovedForAll(address owner, address operator) view returns (bool)"
      ];
      const nftContract = new ethers.Contract(nftAddress, nftABI, provider);
      
      // First check if contract supports ERC721
      try {
        const isERC721 = await nftContract.supportsInterface("0x80ac58cd");
        console.log("Is ERC721 compliant:", isERC721);
      } catch (e) {
        console.log("Could not check ERC721 compliance");
      }
      
      const owner = await nftContract.ownerOf(nftId);
      const balance = await nftContract.balanceOf(signer.address);
      const approvedAddress = await nftContract.getApproved(nftId);
      const isApprovedForAll = await nftContract.isApprovedForAll(signer.address, contractAddress);
      
      console.log("NFT Ownership Check:");
      console.log("NFT Owner:", owner);
      console.log("Your balance:", balance.toString());
      console.log("Is owner:", owner.toLowerCase() === signer.address.toLowerCase());
      console.log("Approved address:", approvedAddress);
      console.log("Is approved for all:", isApprovedForAll);
      console.log("Auction contract address:", contractAddress);
      
      // Check if the auction contract is approved to transfer this NFT
      const isAuctionApproved = approvedAddress.toLowerCase() === contractAddress.toLowerCase() || isApprovedForAll;
      console.log("Is auction contract approved:", isAuctionApproved);
      
      const isOwner = owner.toLowerCase() === signer.address.toLowerCase();
      
      // Update UI state with detailed information
      setNftOwnershipStatus({
        isOwner,
        isApproved: isAuctionApproved,
        owner,
        approvedAddress,
        balance: balance.toString(),
        details: isOwner 
          ? (isAuctionApproved 
              ? "✅ You own this NFT and the auction contract is approved to transfer it."
              : "⚠️ You own this NFT but need to approve the auction contract to transfer it.")
          : "❌ You don't own this NFT."
      });
      
      if (!isAuctionApproved && isOwner) {
        console.log("⚠️ NFT owner but auction contract not approved. You need to approve the auction contract to transfer the NFT.");
        setTxStatus({ 
          status: "error", 
          message: "NFT owner but auction contract not approved. You need to approve the auction contract to transfer the NFT." 
        });
      } else if (isOwner && isAuctionApproved) {
        setTxStatus({ 
          status: "success", 
          message: "✅ NFT ownership verified and auction contract approved!" 
        });
      }
      
      return isOwner;
    } catch (error: unknown) {
      console.error("Error checking NFT ownership:", error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes("require(false)")) {
        console.log("❌ NFT with ID", nftId, "does not exist at contract", nftAddress);
        setTxStatus({ status: "error", message: `NFT with ID ${nftId} does not exist at this contract address` });
      } else if (errorMessage.includes("execution reverted")) {
        console.log("❌ Contract at", nftAddress, "is not a valid ERC721 contract");
        setTxStatus({ status: "error", message: "Invalid NFT contract address - not ERC721 compliant" });
      } else {
        console.log("❌ Unknown error checking NFT ownership");
        setTxStatus({ status: "error", message: "Error checking NFT ownership" });
      }
      
      return false;
    }
  };

  useEffect(() => {
    fetchContractInfo();
    fetchBalance();
  }, []);

  const handleTransaction = async (
    operation: () => Promise<any>,
    pendingMessage: string,
    successMessage: string,
    operationType: string,
  ) => {
    // Don't proceed if another operation is pending
    if (txStatus.status === "pending") return;

    try {
      setTxStatus({ status: "pending", message: pendingMessage, operation: operationType });
      const tx = await operation();
      if (tx?.hash) {
        addTx({ hash: tx.hash, operation: operationType, message: pendingMessage, status: "pending", timestamp: Date.now() });
      }
      if (tx) {
        await tx.wait();
      }
      setTxStatus({ status: "success", message: successMessage });
      if (tx?.hash) {
        updateTxStatus(tx.hash, "success", successMessage);
      }
      await fetchContractInfo(); // Refresh contract info after successful transaction
    } catch (error: any) {
      console.error("Transaction error:", error);
      let errorMessage = "Transaction failed";
      
      // Parse custom errors from the contract
      if (error.data) {
        const errorData = error.data;
        if (errorData === "0x5ec82351") errorMessage = "Auction not started";
        else if (errorData === "0x4b5c2c2c") errorMessage = "Auction already started";
        else if (errorData === "0x4b5c2c2c") errorMessage = "Not the seller";
        else if (errorData === "0x4b5c2c2c") errorMessage = "Auction ended";
        else if (errorData === "0x4b5c2c2c") errorMessage = "Bid too low";
        else if (errorData === "0x4b5c2c2c") errorMessage = "Auction not ended";
        else if (errorData === "0x4b5c2c2c") errorMessage = "Already initialized";
        else errorMessage = `Contract error: ${errorData}`;
      } else if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setTxStatus({
        status: "error",
        message: errorMessage,
      });
    }
    // Clear status after 5 seconds
    setTimeout(() => {
      setTxStatus({ status: "none", message: "" });
    }, 5000);
  };

  const initializeAuction = () => {
    if (!ethers.isAddress(nftAddressInput)) {
      setTxStatus({ status: "error", message: "Enter valid NFT address" });
      return;
    }
    if (!nftIdInput || isNaN(Number(nftIdInput))) {
      setTxStatus({ status: "error", message: "Enter valid NFT ID" });
      return;
    }
    if (!startingBidInput || Number(startingBidInput) < 0) {
      setTxStatus({ status: "error", message: "Enter valid starting bid (ETH)" });
      return;
    }
    const id = BigInt(nftIdInput);
    const minBid = ethers.parseEther(startingBidInput || "0");
    handleTransaction(
      () => contract.initialize(nftAddressInput, id, minBid),
      "Initializing auction...",
      "Auction initialized",
      "initialize",
    );
  };

  const startAuction = async () => {
    if (started) {
      setTxStatus({ status: "error", message: "Auction already started" });
      return;
    }
    if (!seller || seller === "0x0000000000000000000000000000000000000000") {
      setTxStatus({ status: "error", message: "Auction not initialized" });
      return;
    }
    
    // Add debugging information
    console.log("Starting auction with details:");
    console.log("Seller:", seller);
    console.log("NFT Address:", nftAddress);
    console.log("NFT ID:", nftId);
    console.log("Current user:", signer.address);
    console.log("Contract address:", contractAddress);
    
    // Check if user is the seller
    if (signer.address.toLowerCase() !== seller.toLowerCase()) {
      setTxStatus({ status: "error", message: "Only the seller can start the auction" });
      return;
    }
    
    // Check NFT ownership before starting
    const isOwner = await checkNFTOwnership();
    if (!isOwner) {
      setTxStatus({ status: "error", message: "You don't own this NFT. Please check the NFT address and ID." });
      return;
    }
    
    handleTransaction(() => contract.start(), "Starting auction...", "Auction started", "start");
  };

  const placeBid = () => {
    if (!bidAmountInput || Number(bidAmountInput) <= 0) {
      setTxStatus({ status: "error", message: "Enter valid bid amount (ETH)" });
      return;
    }
    if (!started) {
      setTxStatus({ status: "error", message: "Auction not started yet" });
      return;
    }
    if (ended) {
      setTxStatus({ status: "error", message: "Auction has ended" });
      return;
    }
    const value = ethers.parseEther(bidAmountInput);
    handleTransaction(() => contract.bid({ value }), "Placing bid...", "Bid placed", "bid");
  };

  const withdrawBid = () => {
    if (myBid === "0" || myBid === "0.0") {
      setTxStatus({ status: "error", message: "No refundable bids to withdraw" });
      return;
    }
    handleTransaction(() => contract.withdraw(), "Withdrawing...", "Withdrawn", "withdraw");
  };

  const endAuction = () => {
    if (!started) {
      setTxStatus({ status: "error", message: "Auction not started" });
      return;
    }
    if (ended) {
      setTxStatus({ status: "error", message: "Auction already ended" });
      return;
    }
    if (endAt !== null && Date.now() / 1000 < endAt) {
      setTxStatus({ status: "error", message: "Auction not ended yet" });
      return;
    }
    handleTransaction(() => contract.end(), "Ending auction...", "Auction ended", "end");
  };

  

  // Helper function to determine if a button should be disabled
  const isOperationDisabled = (operation: string) => {
    return txStatus.status === "pending" && (!txStatus.operation || txStatus.operation === operation);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto py-8 px-4">
      <div className="bg-white dark:bg-gray-900/95 shadow-2xl rounded-3xl w-full max-w-5xl p-8 border border-slate-200 dark:border-blue-500/30">
        <div className="flex items-center justify-center mb-8">
          <div className="px-6 py-3 rounded-full">
            <h1 className="text-4xl font-extrabold tracking-tight text-blue-600 dark:text-cyan-400">
              English Auction
            </h1>
          </div>
        </div>

        {/* Contract Address Display */}
        <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-500/30 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-lg font-semibold text-green-600 dark:text-green-400">Contract Deployed & Active</span>
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">English Auction Contract</h2>
            <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-4 border border-slate-200 dark:border-blue-500/20">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Contract Address</span>
              </div>
              <div className="font-mono text-lg font-bold text-blue-600 dark:text-blue-400 break-all">
                0x4e16ec2bae1c7806664438002f4d23c57b8e593c
              </div>
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Arbitrum Sepolia Testnet
              </div>
            </div>
            <div className="mt-4 flex justify-center space-x-4">
              <button 
                onClick={() => copyToClipboard("0x4e16ec2bae1c7806664438002f4d23c57b8e593c")}
                className="btn btn-sm bg-blue-500 hover:bg-blue-600 text-white border-0 rounded-lg px-4 py-2"
              >
                📋 Copy Address
              </button>
              <a 
                href={`https://sepolia.arbiscan.io/address/0x4e16ec2bae1c7806664438002f4d23c57b8e593c`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm bg-purple-500 hover:bg-purple-600 text-white border-0 rounded-lg px-4 py-2"
              >
                🔍 View on Arbiscan
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-slate-100/80 dark:bg-blue-900/40 rounded-2xl px-8 py-6 shadow-xl border border-slate-200 dark:border-blue-500/20 backdrop-blur-md">
            <div className="text-lg font-medium text-slate-600 dark:text-blue-200 mb-2">Auction Status</div>
            <div className="space-y-1 text-slate-700 dark:text-blue-100">
              <div><span className="opacity-70">Seller:</span> <span className="font-mono break-all">{seller || "-"}</span></div>
              <div><span className="opacity-70">NFT:</span> <span className="font-mono break-all">{nftAddress || "-"}</span> #{nftId || "-"}</div>
              <div><span className="opacity-70">Started:</span> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${started ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300" : "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300"}`}>
                  {started ? "Yes" : "No"}
                </span>
              </div>
              <div><span className="opacity-70">Ended:</span> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${ended ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300" : "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300"}`}>
                  {ended ? "Yes" : "No"}
                </span>
              </div>
              <div><span className="opacity-70">Ends at:</span> {endAt ? new Date(endAt * 1000).toLocaleString() : "-"}</div>
            </div>
                </div>
          <div className="bg-slate-100/80 dark:bg-blue-900/40 rounded-2xl px-8 py-6 shadow-xl border border-slate-200 dark:border-blue-500/20 backdrop-blur-md">
            <div className="text-lg font-medium text-slate-600 dark:text-blue-200 mb-2">Bids</div>
            <div className="space-y-1 text-slate-700 dark:text-blue-100">
              <div><span className="opacity-70">Highest bidder:</span> <span className="font-mono break-all">{highestBidder || "-"}</span></div>
              <div><span className="opacity-70">Highest bid:</span> <span className="font-semibold text-green-600 dark:text-green-400">{highestBid} ETH</span></div>
              <div><span className="opacity-70">Your refundable bids:</span> <span className="font-semibold text-blue-600 dark:text-blue-400">{myBid} ETH</span></div>
            </div>
          </div>
        </div>

        {/* Development Setup Information */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-500/30 rounded-2xl p-6 mb-8">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-yellow-500 dark:text-yellow-400 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-3">🛠️ Development Setup Process</h3>
              <div className="space-y-2 text-sm text-yellow-700 dark:text-yellow-300">
                <div>
                  <strong>Current Status:</strong> ✅ English Auction contract deployed and ready for testing!
                </div>
                <div>
                  <strong>What's Available:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• English Auction contract deployed on Arbitrum Sepolia</li>
                    <li>• Test ERC721 contract with 100 NFTs (IDs: 1-100)</li>
                    <li>• Development wallet owns all test NFTs</li>
                    <li>• Ready for immediate testing without user NFT ownership</li>
                  </ul>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-800/30 rounded-lg p-3 mt-3">
                  <strong>🎯 For Users Who Want Full Control:</strong> Clone the repository, add your private key to <code className="bg-yellow-200 dark:bg-yellow-700 px-1 rounded">.env</code>, and use your own NFTs with the same English Auction contract. This gives you complete control over the auction process.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contract Status Alert */}
        {!seller || seller === "0x0000000000000000000000000000000000000000" ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-500/30 rounded-2xl p-6 mb-8">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-yellow-500 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">Contract Not Initialized</h3>
                <p className="text-yellow-700 dark:text-yellow-300">Please initialize the auction with NFT details and starting bid first.</p>
              </div>
            </div>
          </div>
        ) : seller && seller !== "0x0000000000000000000000000000000000000000" && !started ? (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-500/30 rounded-2xl p-6 mb-8">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-orange-500 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200">Contract Already Initialized</h3>
                <p className="text-orange-700 dark:text-orange-300">
                  This contract can only be initialized once. Current NFT: <span className="font-mono">{nftAddress}</span> #{nftId}
                  <br />
                  <strong>To test with a different NFT, you need to deploy a new contract instance.</strong>
                </p>
              </div>
            </div>
          </div>
        ) : !started ? (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 rounded-2xl p-6 mb-8">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">Auction Ready to Start</h3>
                <p className="text-blue-700 dark:text-blue-300">The auction is initialized but not started yet. Click "Start Auction" to begin.</p>
              </div>
            </div>
          </div>
        ) : ended ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-2xl p-6 mb-8">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Auction Ended</h3>
                <p className="text-red-700 dark:text-red-300">The auction has concluded. Winner: {highestBidder || "No bids"}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500/30 rounded-2xl p-6 mb-8">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">Auction Active</h3>
                <p className="text-green-700 dark:text-green-300">The auction is running! Place your bids now.</p>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Status Alert */}
        {txStatus.status !== "none" && (
          <div
            className={`transition-all duration-300 alert ${
              txStatus.status === "pending"
                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200"
                : txStatus.status === "success"
                  ? "bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-200"
                  : "bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-200"
            } mb-8 border ${
              txStatus.status === "pending"
                ? "border-blue-200 dark:border-blue-500/40"
                : txStatus.status === "success"
                  ? "border-green-200 dark:border-green-500/40"
                  : "border-red-200 dark:border-red-500/40"
            } shadow-lg backdrop-blur-md rounded-2xl`}
          >
            <div className="flex items-center">
              {txStatus.status === "pending" && (
                <div className="loading loading-spinner loading-md mr-3 text-blue-500 dark:text-blue-400" />
              )}
              {txStatus.status === "success" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-3 text-green-500 dark:text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {txStatus.status === "error" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-3 text-red-500 dark:text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <span className="font-medium">{txStatus.message}</span>
            </div>
          </div>
        )}

        {/* Complete Flow Explanation */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-500/30 rounded-2xl p-6 mb-8">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-blue-500 dark:text-blue-400 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">📋 Complete Auction Flow Guide</h3>
              <div className="space-y-3 text-sm text-blue-700 dark:text-blue-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200">Step 1: Initialize Auction</h4>
                    <ul className="ml-4 space-y-1">
                      <li>• Enter NFT contract address and token ID</li>
                      <li>• Set starting bid amount</li>
                      <li>• Click "Initialize Auction"</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200">Step 2: Start Auction</h4>
                    <ul className="ml-4 space-y-1">
                      <li>• Check NFT ownership status</li>
                      <li>• Approve auction contract if needed</li>
                      <li>• Click "Start Auction" to begin</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200">Step 3: Bidding Phase</h4>
                    <ul className="ml-4 space-y-1">
                      <li>• Users can place bids (7 days)</li>
                      <li>• Each bid must be higher than previous</li>
                      <li>• Previous bidders can withdraw refunds</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200">Step 4: End Auction</h4>
                    <ul className="ml-4 space-y-1">
                      <li>• After 7 days, anyone can end auction</li>
                      <li>• Winner gets NFT, seller gets ETH</li>
                      <li>• Losers can withdraw their bids</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Setup Information */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-500/30 rounded-2xl p-6 mb-8">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-yellow-500 dark:text-yellow-400 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-3">🚀 Setup Requirements & Testing Options</h3>
              <div className="space-y-3 text-sm text-yellow-700 dark:text-yellow-300">
                <div>
                  <strong>Option 1: Use Your Own Wallet (Recommended for Full Testing)</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• Clone this repository and set up locally</li>
                    <li>• Add your private key to the <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">.env</code> file</li>
                    <li>• Use NFTs from your wallet (you must own them to transfer to contract)</li>
                    <li>• Interact with the same English Auction contract</li>
                    <li>• Full control over the auction process</li>
                  </ul>
                </div>
                <div>
                  <strong>Option 2: Quick Demo (Current Setup)</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• We've deployed a test English Auction contract</li>
                    <li>• We've deployed a test ERC721 contract with pre-minted NFTs</li>
                    <li>• Our development wallet already has test NFTs for immediate testing</li>
                    <li>• Perfect for quick demos and understanding the flow</li>
                  </ul>
                  <div className="bg-yellow-100 dark:bg-yellow-800/30 rounded-lg p-3 mt-2">
                    <strong>📋 Test NFT Contract Details:</strong>
                    <br />• Contract Address: <code className="font-mono text-xs">0xf7486B2D17Cdf217395B2AE7F281335546bdeb3C</code>
                    <br />• Available Token IDs: 1-100 (100 token supply)
                    <br />• Network: Arbitrum Sepolia Testnet
                    <br />• Owner: <code className="font-mono text-xs">0xd649CB59755EbC44610a8e5F15D3C93C3aEb08F1</code> (Development Wallet)
                  </div>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-800/30 rounded-lg p-3 mt-3">
                  <strong>✅ Testing Ready:</strong> For this demo, you don't need to own any NFTs! Our development wallet owns all 100 test NFTs. The auction will be initialized using our development wallet, so you can test the bidding process without needing your own NFTs.
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-800/30 rounded-lg p-3 mt-3">
                  <strong>🚀 Ready to Test:</strong> The English Auction contract is deployed and ready! You can now initialize the auction using the test NFT contract address <code className="font-mono text-xs">0xf7486B2D17Cdf217395B2AE7F281335546bdeb3C</code> with any token ID between 1-100.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Initialize Auction */}
          <div className="bg-slate-50 dark:bg-gray-800/80 rounded-2xl p-6 border border-slate-200 dark:border-blue-500/20">
            <h2 className="text-xl font-semibold text-slate-700 dark:text-blue-200 mb-4">1. Initialize Auction</h2>
            <p className="text-sm text-slate-600 dark:text-blue-300 mb-4">Set up the auction with NFT contract address, token ID, and minimum starting bid.</p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-500/30 rounded-xl p-4 mb-4">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                <strong>🎯 Demo Mode:</strong> For this demo, you don't need to own any NFTs! Use the test NFT contract address <code className="font-mono text-xs">0xf7486B2D17Cdf217395B2AE7F281335546bdeb3C</code> with any token ID between 1-100. Our development wallet will handle the NFT transfer.
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-500/30 rounded-xl p-4 mb-4">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                <strong>🔧 Development Setup:</strong> For this demo, our development wallet handles all NFT operations. If you want to use your own NFTs, clone the project, add your private key to the <code className="font-mono text-xs">.env</code> file, and interact with the same English Auction contract.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex gap-2 w-full sm:w-96">
                  <input type="text" value={nftAddressInput} onChange={e => setNftAddressInput(e.target.value)} className="input bg-white/70 dark:bg-blue-900/30 border border-slate-300 dark:border-blue-500/30 focus:border-blue-400 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-blue-900/40 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-blue-300/50 flex-1 rounded-xl" placeholder="0xf7486B2D17Cdf217395B2AE7F281335546bdeb3C" disabled={txStatus.status === "pending" || (!!seller && seller !== "0x0000000000000000000000000000000000000000")} />
                  <button 
                    onClick={() => setNftAddressInput("0xf7486B2D17Cdf217395B2AE7F281335546bdeb3C")} 
                    className="btn bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-xl text-sm font-medium"
                    disabled={txStatus.status === "pending" || (!!seller && seller !== "0x0000000000000000000000000000000000000000")}
                  >
                    Use Test NFT
                  </button>
                </div>
                <input type="number" value={nftIdInput} onChange={e => setNftIdInput(e.target.value)} className="input bg-white/70 dark:bg-blue-900/30 border border-slate-300 dark:border-blue-500/30 focus:border-blue-400 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-blue-900/40 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-blue-300/50 w-full sm:w-48 rounded-xl" placeholder="NFT ID (1-100)" disabled={txStatus.status === "pending" || (!!seller && seller !== "0x0000000000000000000000000000000000000000")} />
                <input type="number" value={startingBidInput} onChange={e => setStartingBidInput(e.target.value)} className="input bg-white/70 dark:bg-blue-900/30 border border-slate-300 dark:border-blue-500/30 focus:border-blue-400 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-blue-900/40 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-blue-300/50 w-full sm:w-48 rounded-xl" placeholder="Starting bid (ETH)" disabled={txStatus.status === "pending" || (!!seller && seller !== "0x0000000000000000000000000000000000000000")} />
                </div>
              <button className={`btn border-0 shadow-lg px-6 rounded-xl font-semibold ${isOperationDisabled("initialize") || (!!seller && seller !== "0x0000000000000000000000000000000000000000") ? "bg-slate-200 text-slate-400 dark:bg-cyan-900/50 dark:text-cyan-300/70 cursor-not-allowed" : "bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white transform hover:scale-105 transition-all duration-300"}`} onClick={initializeAuction} disabled={isOperationDisabled("initialize") || (!!seller && seller !== "0x0000000000000000000000000000000000000000")}>
                {txStatus.status === "pending" && txStatus.operation === "initialize" ? (
                  <div className="flex items-center"><div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>Initializing...</div>
                ) : (
                  <div className="flex items-center">Initialize Auction</div>
                )}
              </button>
            </div>
          </div>

          {/* Start Auction */}
          <div className="bg-slate-50 dark:bg-gray-800/80 rounded-2xl p-6 border border-slate-200 dark:border-blue-500/20">
            <h2 className="text-xl font-semibold text-slate-700 dark:text-blue-200 mb-4">2. Start Auction</h2>
            <p className="text-sm text-slate-600 dark:text-blue-300 mb-4">Begin the auction. This will transfer the NFT to the contract and start the 7-day auction period.</p>
            
            {/* NFT Ownership Status Display */}
            {nftAddress && nftId && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 rounded-xl p-4 mb-4">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">🔍 NFT Ownership & Approval Status</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">NFT Owner:</span>
                    <span className="font-mono text-blue-800 dark:text-blue-200">{nftOwnershipStatus.owner || "Not checked"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">Your Balance:</span>
                    <span className="font-mono text-blue-800 dark:text-blue-200">{nftOwnershipStatus.balance} NFTs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">Approved Address:</span>
                    <span className="font-mono text-blue-800 dark:text-blue-200">{nftOwnershipStatus.approvedAddress || "None"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">Auction Contract Approved:</span>
                    <span className={`font-semibold ${nftOwnershipStatus.isApproved ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {nftOwnershipStatus.isApproved ? "✅ Yes" : "❌ No"}
                    </span>
                  </div>
                  {nftOwnershipStatus.details && (
                    <div className="mt-3 p-3 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
                      <span className="text-blue-800 dark:text-blue-200 font-medium">{nftOwnershipStatus.details}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="flex gap-3 flex-wrap">
              <button className={`btn border-0 shadow-lg px-6 rounded-xl font-semibold ${isOperationDisabled("start") || !seller || seller === "0x0000000000000000000000000000000000000000" || started || !nftOwnershipStatus.isOwner || !nftOwnershipStatus.isApproved ? "bg-slate-200 text-slate-400 dark:bg-green-900/50 dark:text-green-300/70 cursor-not-allowed" : "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500 text-white transform hover:scale-105 transition-all duration-300"}`} onClick={startAuction} disabled={isOperationDisabled("start") || !seller || seller === "0x0000000000000000000000000000000000000000" || started || !nftOwnershipStatus.isOwner || !nftOwnershipStatus.isApproved}>
                {txStatus.status === "pending" && txStatus.operation === "start" ? <div className="flex items-center"><div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>Starting...</div> : <div className="flex items-center">Start Auction</div>}
              </button>
              <button className="btn border-0 shadow-lg px-6 rounded-xl font-semibold bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white transform hover:scale-105 transition-all duration-300" onClick={checkNFTOwnership}>
                <div className="flex items-center">
                  {nftOwnershipStatus.owner ? "✅ Checked" : "🔍 Check NFT Ownership"}
                </div>
              </button>
              <button className={`btn border-0 shadow-lg px-6 rounded-xl font-semibold ${nftOwnershipStatus.isApproved ? "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500" : "bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-500"} text-white transform hover:scale-105 transition-all duration-300`} onClick={approveAuctionContract}>
                <div className="flex items-center">
                  {nftOwnershipStatus.isApproved ? "✅ Approved" : "🔐 Approve Auction Contract"}
                </div>
              </button>
            </div>
            
            {/* Status Messages */}
            {nftAddress && nftId && (
              <div className="mt-4 space-y-2">
                {!nftOwnershipStatus.owner && (
                  <div className="text-sm text-amber-600 dark:text-amber-400">
                    ⚠️ Click "Check NFT Ownership" to verify you own the NFT
                  </div>
                )}
                {nftOwnershipStatus.isOwner && !nftOwnershipStatus.isApproved && (
                  <div className="text-sm text-orange-600 dark:text-orange-400">
                    ⚠️ Click "Approve Auction Contract" to allow the contract to transfer your NFT
                  </div>
                )}
                {nftOwnershipStatus.isOwner && nftOwnershipStatus.isApproved && (
                  <div className="text-sm text-green-600 dark:text-green-400">
                    ✅ Ready to start auction! Click "Start Auction" to begin the 7-day auction period
                  </div>
                )}
              </div>
            )}
                    </div>

          {/* Place Bid */}
          <div className="bg-slate-50 dark:bg-gray-800/80 rounded-2xl p-6 border border-slate-200 dark:border-blue-500/20">
            <h2 className="text-xl font-semibold text-slate-700 dark:text-blue-200 mb-4">3. Place Bid</h2>
            <p className="text-sm text-slate-600 dark:text-blue-300 mb-4">Submit your bid in ETH. Must be higher than the current highest bid.</p>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <input type="number" value={bidAmountInput} onChange={e => setBidAmountInput(e.target.value)} className="input bg-white/70 dark:bg-blue-900/30 border border-slate-300 dark:border-blue-500/30 focus:border-blue-400 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-blue-900/40 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-blue-300/50 w-full sm:w-48 rounded-xl" placeholder="Bid amount (ETH)" disabled={txStatus.status === "pending" || !started || ended} />
                    </div>
              <button className={`btn border-0 shadow-lg px-6 rounded-xl font-semibold ${isOperationDisabled("bid") || !started || ended ? "bg-slate-200 text-slate-400 dark:bg-blue-900/50 dark:text-blue-300/70 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white transform hover:scale-105 transition-all duration-300"}`} onClick={placeBid} disabled={isOperationDisabled("bid") || !started || ended}>
                {txStatus.status === "pending" && txStatus.operation === "bid" ? (
                  <div className="flex items-center"><div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>Bidding...</div>
                ) : (
                  <div className="flex items-center">Place Bid</div>
                  )}
                </button>
              </div>
            </div>

          {/* Withdraw and End */}
          <div className="bg-slate-50 dark:bg-gray-800/80 rounded-2xl p-6 border border-slate-200 dark:border-blue-500/20">
            <h2 className="text-xl font-semibold text-slate-700 dark:text-blue-200 mb-4">4. Withdraw / End</h2>
            <p className="text-sm text-slate-600 dark:text-blue-300 mb-4">Withdraw your refundable bids or end the auction after the time period.</p>
            <div className="flex gap-3 flex-wrap">
              <button className={`btn border-0 shadow-lg px-6 rounded-xl font-semibold ${isOperationDisabled("withdraw") || (myBid === "0" || myBid === "0.0") ? "bg-slate-200 text-slate-400 dark:bg-purple-900/50 dark:text-purple-300/70 cursor-not-allowed" : "bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-500 text-white transform hover:scale-105 transition-all duration-300"}`} onClick={withdrawBid} disabled={isOperationDisabled("withdraw") || (myBid === "0" || myBid === "0.0")}>
                {txStatus.status === "pending" && txStatus.operation === "withdraw" ? <div className="flex items-center"><div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>Withdrawing...</div> : <div className="flex items-center">Withdraw</div>}
              </button>
              <button className={`btn border-0 shadow-lg px-6 rounded-xl font-semibold ${isOperationDisabled("end") || !started || ended || (endAt !== null && Date.now() / 1000 < endAt) ? "bg-slate-200 text-slate-400 dark:bg-red-900/50 dark:text-red-300/70 cursor-not-allowed" : "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500 text-white transform hover:scale-105 transition-all duration-300"}`} onClick={endAuction} disabled={isOperationDisabled("end") || !started || ended || (endAt !== null && Date.now() / 1000 < endAt)}>
                {txStatus.status === "pending" && txStatus.operation === "end" ? <div className="flex items-center"><div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>Ending...</div> : <div className="flex items-center">End Auction</div>}
              </button>
            </div>
                </div>
              </div>
        {/* CTA: View your transactions */}
        <div className="mt-10">
          <div className="bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-purple-500/10 dark:from-blue-900/20 dark:via-cyan-900/20 dark:to-purple-900/20 border border-slate-200 dark:border-blue-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-white">See your transaction history</h3>
              <p className="text-slate-600 dark:text-blue-200/90">Open the Block Explorer tab to view all actions you performed here.</p>
            </div>
            <Link
              href="/blockexplorer"
              className="btn border-0 bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl shadow-lg px-6"
            >
              View on Block Explorer
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h6m0 0v6m0-6L10 16" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

