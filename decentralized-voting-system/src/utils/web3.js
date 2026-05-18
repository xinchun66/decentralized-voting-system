import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0xE32C20167eb98418CBcc177B790e8cD10Eb52945";
const EXPECTED_CHAIN_ID = 1337;

const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "title", "type": "string" },
      { "internalType": "uint256", "name": "durationHours", "type": "uint256" },
      { "internalType": "bool", "name": "usePoints", "type": "bool" }
    ],
    "name": "createProposal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "to", "type": "address" }],
    "name": "mintPoints",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "mintPoints",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "proposalId", "type": "uint256" },
      { "internalType": "bool", "name": "support", "type": "bool" }
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "proposalId", "type": "uint256" }],
    "name": "getProposalDetail",
    "outputs": [
      { "internalType": "string", "name": "title", "type": "string" },
      { "internalType": "uint256", "name": "yesVotes", "type": "uint256" },
      { "internalType": "uint256", "name": "noVotes", "type": "uint256" },
      { "internalType": "uint256", "name": "endTime", "type": "uint256" },
      { "internalType": "enum VotingSystemEnhanced.ProposalStatus", "name": "status", "type": "uint8" },
      { "internalType": "address", "name": "creator", "type": "address" },
      { "internalType": "bool", "name": "requiresPoints", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getProposalCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "proposalId", "type": "uint256" }],
    "name": "getVoteRate",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "hasVoted",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "proposals",
    "outputs": [
      { "internalType": "string", "name": "title", "type": "string" },
      { "internalType": "uint256", "name": "yesVotes", "type": "uint256" },
      { "internalType": "uint256", "name": "noVotes", "type": "uint256" },
      { "internalType": "uint256", "name": "endTime", "type": "uint256" },
      { "internalType": "bool", "name": "exists", "type": "bool" },
      { "internalType": "enum VotingSystemEnhanced.ProposalStatus", "name": "status", "type": "uint8" },
      { "internalType": "address", "name": "creator", "type": "address" },
      { "internalType": "bool", "name": "requiresPoints", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "userPoints",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

let readOnlyContract = null;

export async function checkNetwork() {
  if (!window.ethereum) throw new Error("请安装MetaMask");
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();
  const currentChainId = network.chainId;
  
  if (currentChainId !== EXPECTED_CHAIN_ID) {
    throw new Error(`网络不匹配！请切换到 Chain ID: ${EXPECTED_CHAIN_ID} (当前: ${currentChainId})`);
  }
  return true;
}

export async function getReadOnlyContract() {
  if (!window.ethereum) throw new Error("请安装MetaMask");
  if (readOnlyContract) return readOnlyContract;

  const provider = new ethers.BrowserProvider(window.ethereum);
  readOnlyContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  return readOnlyContract;
}

export async function getSignerContract() {
  if (!window.ethereum) throw new Error("请安装MetaMask");
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

export async function connectWallet() {
  if (!window.ethereum) throw new Error("请安装MetaMask");
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  
  const network = await provider.getNetwork();
  const currentChainId = Number(network.chainId);
  
  if (currentChainId !== EXPECTED_CHAIN_ID) {
    throw new Error(`请切换到正确的网络！期望 Chain ID: ${EXPECTED_CHAIN_ID}, 当前: ${currentChainId}`);
  }
  
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  return await signer.getAddress();
}

export async function getAllProposals() {
  const c = await getReadOnlyContract();
  const count = await c.getProposalCount();
  const list = [];
  for (let i = 0; i < count; i++) {
    const p = await c.proposals(i);
    list.push({
      title: p.title,
      yesVotes: p.yesVotes,
      noVotes: p.noVotes,
      endTime: p.endTime,
      exists: p.exists,
      status: p.status,
      creator: p.creator,
      requiresPoints: p.requiresPoints
    });
  }
  return list;
}

export async function createProposal(title, durationHours = 24, usePoints = false) {
  const c = await getSignerContract();
  const tx = await c.createProposal(title, durationHours, usePoints, { gasLimit: 300000 });
  await tx.wait();
  return tx;
}

export async function voteProposal(pid, support) {
  if (!window.ethereum) {
    throw new Error("请安装MetaMask钱包");
  }
  
  console.log("[voteProposal] 开始投票, pid:", pid, "support:", support);
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  
  const network = await provider.getNetwork();
  console.log("[voteProposal] 当前网络:", network.chainId);
  
  if (Number(network.chainId) !== EXPECTED_CHAIN_ID) {
    throw new Error(`网络不匹配！当前 Chain ID: ${network.chainId}, 期望: ${EXPECTED_CHAIN_ID}`);
  }
  
  const signer = await provider.getSigner();
  const signerAddr = await signer.getAddress();
  console.log("[voteProposal] 签名账户:", signerAddr);
  
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  console.log("[voteProposal] 合约地址:", CONTRACT_ADDRESS);
  
  const proposalId = BigInt(pid);
  
  try {
    console.log("[voteProposal] 准备发送交易...");
    const tx = await contract.vote(proposalId, support, { gasLimit: 300000 });
    console.log("[voteProposal] 交易已发送, hash:", tx.hash);
    
    console.log("[voteProposal] 等待交易确认...");
    const receipt = await tx.wait();
    console.log("[voteProposal] 交易确认完成, status:", receipt.status);
    
    if (receipt.status === 1) {
      return true;
    } else {
      throw new Error("交易失败（状态码: 0）");
    }
  } catch (error) {
    console.error("[voteProposal] 错误:", error);
    if (error.code === 4001 || 
        error.message.includes("aborted") || 
        error.message.includes("cancelled") || 
        error.message.includes("User denied")) {
      throw new Error("用户取消了交易");
    }
    throw error;
  }
}

export async function getUserPoints(addr) {
  const c = await getReadOnlyContract();
  return await c.userPoints(addr);
}

export async function mintPoints(to, amount = 10) {
  const c = await getSignerContract();
  const tx = await c.mintPoints(to, amount, { gasLimit: 100000 });
  await tx.wait();
  return tx;
}

export async function isOwner(addr) {
  const c = await getReadOnlyContract();
  return await c.owner() === addr;
}

export const getContract = getSignerContract;
