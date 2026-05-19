import { ethers } from "ethers";

/** Remix 重新部署后请更新此地址 */
export const CONTRACT_ADDRESS = "0xB3BE35a4f3f55F765bc882f694B4789Ed6aC8ca6";
const EXPECTED_CHAIN_ID = 1337;

const CONTRACT_ABI = [
  {
    inputs: [
      { internalType: "string", name: "title", type: "string" },
      { internalType: "string", name: "description", type: "string" },
      { internalType: "uint256", name: "durationSeconds", type: "uint256" },
      { internalType: "bool", name: "requiresPoints", type: "bool" },
      { internalType: "bool", name: "useWeight", type: "bool" },
      { internalType: "bool", name: "realSettlement", type: "bool" },
    ],
    name: "createProposal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "proposalId", type: "uint256" },
      { internalType: "bool", name: "support", type: "bool" },
      { internalType: "uint256", name: "weight", type: "uint256" },
    ],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "proposalId", type: "uint256" }],
    name: "settle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "to", type: "address" }],
    name: "mintPoints",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "mintPoints",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "proposalId", type: "uint256" }],
    name: "getProposalDetail",
    outputs: [
      { internalType: "string", name: "title", type: "string" },
      { internalType: "string", name: "description", type: "string" },
      { internalType: "uint256", name: "yesVotes", type: "uint256" },
      { internalType: "uint256", name: "noVotes", type: "uint256" },
      { internalType: "uint256", name: "endTime", type: "uint256" },
      { internalType: "enum VotingSystemEnhanced.ProposalStatus", name: "status", type: "uint8" },
      { internalType: "address", name: "creator", type: "address" },
      { internalType: "bool", name: "requiresPoints", type: "bool" },
      { internalType: "bool", name: "useWeight", type: "bool" },
      { internalType: "bool", name: "realSettlement", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "proposalId", type: "uint256" },
      { internalType: "address", name: "user", type: "address" },
    ],
    name: "getUserVote",
    outputs: [
      { internalType: "bool", name: "voted", type: "bool" },
      { internalType: "bool", name: "support", type: "bool" },
      { internalType: "uint256", name: "weight", type: "uint256" },
      { internalType: "bool", name: "settled", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  { inputs: [], name: "getProposalCount", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  {
    inputs: [{ internalType: "uint256", name: "proposalId", type: "uint256" }],
    name: "getVoteRate",
    outputs: [{ type: "uint256" }, { type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "", type: "uint256" },
      { internalType: "address", name: "", type: "address" },
    ],
    name: "hasVoted",
    outputs: [{ type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "proposals",
    outputs: [
      { type: "string", name: "title" },
      { type: "string", name: "description" },
      { type: "uint256", name: "yesVotes" },
      { type: "uint256", name: "noVotes" },
      { type: "uint256", name: "endTime" },
      { type: "bool", name: "exists" },
      { type: "uint8", name: "status" },
      { type: "address", name: "creator" },
      { type: "bool", name: "requiresPoints" },
      { type: "bool", name: "useWeight" },
      { type: "bool", name: "realSettlement" },
    ],
    stateMutability: "view",
    type: "function",
  },
  { inputs: [], name: "owner", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "isAdmin",
    outputs: [{ type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "userPoints",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
];

let readOnlyContract = null;

export function resetContractCache() {
  readOnlyContract = null;
}

function mapProposal(p) {
  return {
    title: p.title,
    description: p.description || "",
    content: p.description || "",
    yesVotes: p.yesVotes,
    noVotes: p.noVotes,
    endTime: p.endTime,
    exists: p.exists,
    status: p.status,
    creator: p.creator,
    requiresPoints: p.requiresPoints,
    useWeight: p.useWeight,
    realSettlement: p.realSettlement,
  };
}

export async function checkNetwork() {
  if (!window.ethereum) throw new Error("请安装MetaMask");
  const provider = new ethers.BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();
  if (Number(network.chainId) !== EXPECTED_CHAIN_ID) {
    throw new Error(`网络不匹配！请切换到 Chain ID: ${EXPECTED_CHAIN_ID} (当前: ${network.chainId})`);
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
  if (Number(network.chainId) !== EXPECTED_CHAIN_ID) {
    throw new Error(`请切换到正确的网络！期望 Chain ID: ${EXPECTED_CHAIN_ID}, 当前: ${network.chainId}`);
  }
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  return signer.getAddress();
}

export async function getAllProposals() {
  const c = await getReadOnlyContract();
  const count = await c.getProposalCount();
  const list = [];
  for (let i = 0; i < count; i++) {
    list.push(mapProposal(await c.proposals(i)));
  }
  return list;
}

export async function getProposalDetail(id) {
  const c = await getReadOnlyContract();
  const d = await c.getProposalDetail(id);
  return {
    title: d.title,
    description: d.description,
    yesVotes: d.yesVotes,
    noVotes: d.noVotes,
    endTime: d.endTime,
    status: d.status,
    creator: d.creator,
    requiresPoints: d.requiresPoints,
    useWeight: d.useWeight,
    realSettlement: d.realSettlement,
  };
}

export async function getUserVote(proposalId, user) {
  const c = await getReadOnlyContract();
  const v = await c.getUserVote(proposalId, user);
  return {
    voted: v.voted,
    support: v.support,
    weight: Number(v.weight),
    settled: v.settled,
  };
}

export async function createProposal(
  title,
  description = "",
  durationSeconds = 86400,
  requiresPoints = false,
  useWeight = false,
  realSettlement = false
) {
  const c = await getSignerContract();
  const tx = await c.createProposal(title, description, durationSeconds, requiresPoints, useWeight, realSettlement, {
    gasLimit: 600000,
  });
  await tx.wait();
  return tx;
}

export async function voteProposal(pid, support, weight = 1) {
  if (!window.ethereum) throw new Error("请安装MetaMask钱包");
  const provider = new ethers.BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();
  if (Number(network.chainId) !== EXPECTED_CHAIN_ID) {
    throw new Error(`网络不匹配！当前 Chain ID: ${network.chainId}, 期望: ${EXPECTED_CHAIN_ID}`);
  }
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  try {
    const tx = await contract.vote(BigInt(pid), support, BigInt(weight), { gasLimit: 350000 });
    const receipt = await tx.wait();
    if (receipt.status !== 1) throw new Error("交易失败（状态码: 0）");
    return true;
  } catch (error) {
    if (
      error.code === 4001 ||
      error.message?.includes("aborted") ||
      error.message?.includes("cancelled") ||
      error.message?.includes("User denied")
    ) {
      throw new Error("用户取消了交易");
    }
    throw error;
  }
}

export async function settleProposal(pid) {
  const c = await getSignerContract();
  const tx = await c.settle(BigInt(pid), { gasLimit: 300000 });
  await tx.wait();
  return tx;
}

export async function getUserPoints(addr) {
  const c = await getReadOnlyContract();
  return c.userPoints(addr);
}

export async function getProposalVoteRate(proposalId) {
  const c = await getReadOnlyContract();
  const [yesRate, noRate] = await c.getVoteRate(proposalId);
  return { yesRate: Number(yesRate), noRate: Number(noRate) };
}

export async function mintPoints(to, amount = 10) {
  const c = await getSignerContract();
  const tx = await c.mintPoints(to, amount, { gasLimit: 100000 });
  await tx.wait();
  return tx;
}

/** 与链上 onlyAdmin 一致：合约 owner 或 isAdmin 映射为 true */
export async function isContractAdmin(addr) {
  if (!addr) return false;
  const c = await getReadOnlyContract();
  const who = ethers.getAddress(addr);
  const owner = ethers.getAddress(await c.owner());
  if (who === owner) return true;
  return Boolean(await c.isAdmin(who));
}

/** @deprecated 请用 isContractAdmin */
export async function isOwner(addr) {
  return isContractAdmin(addr);
}

export async function getContractOwner() {
  const c = await getReadOnlyContract();
  return ethers.getAddress(await c.owner());
}

export const getContract = getSignerContract;
