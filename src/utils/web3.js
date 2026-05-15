import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0xE3058B927d5ba871ce784139fA9827bc50414188";

const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "_title", "type": "string" },
      { "internalType": "string", "name": "_content", "type": "string" },
      { "internalType": "uint256", "name": "_endTime", "type": "uint256" }
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
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "pid", "type": "uint256" },
      { "internalType": "bool", "name": "isYes", "type": "bool" }
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "pid", "type": "uint256" }],
    "name": "getProposal",
    "outputs": [
      { "internalType": "string", "name": "title", "type": "string" },
      { "internalType": "string", "name": "content", "type": "string" },
      { "internalType": "uint256", "name": "yesVotes", "type": "uint256" },
      { "internalType": "uint256", "name": "noVotes", "type": "uint256" },
      { "internalType": "uint256", "name": "endTime", "type": "uint256" }
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
    "inputs": [{ "internalType": "uint256", "name": "pid", "type": "uint256" }],
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
      { "internalType": "string", "name": "content", "type": "string" },
      { "internalType": "uint256", "name": "yesVotes", "type": "uint256" },
      { "internalType": "uint256", "name": "noVotes", "type": "uint256" },
      { "internalType": "uint256", "name": "endTime", "type": "uint256" },
      { "internalType": "bool", "name": "exists", "type": "bool" }
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
  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  return await signer.getAddress();
}

// ✅ 获取所有提案（永久保存、全局可见）
export async function getAllProposals() {
  const c = await getReadOnlyContract();
  const count = await c.getProposalCount();
  const list = [];
  for (let i = 0; i < count; i++) {
    const p = await c.proposals(i);
    list.push(p);
  }
  return list;
}

export async function createProposal(title, content, endTime) {
  const c = await getSignerContract();
  const tx = await c.createProposal(title, content, endTime, { gasLimit: 300000 });
  await tx.wait();
  return tx;
}

export async function voteProposal(pid, support) {
  const c = await getSignerContract();
  const tx = await c.vote(pid, support, { gasLimit: 300000 });
  await tx.wait();
  return true;
}

export async function getUserPoints(addr) {
  const c = await getReadOnlyContract();
  return await c.userPoints(addr);
}

export const getContract = getSignerContract;