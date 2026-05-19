import { ethers } from "ethers";

const CONTRACT_ABI = [
  "function getProposalCount() view returns(uint256)",
  "function proposals(uint256) view returns(string,uint256,uint256,uint256,bool,uint8,address,bool)",
  "function vote(uint256,bool)",
  "function userPoints(address) view returns(uint256)",
  "function mintPoints(address)",
  "function createProposal(string,string,uint256,bool)",
  "function getVoteRate(uint256) view returns(uint256,uint256)",
  "function owner() view returns(address)",
  "function hasVoted(uint256,address) view returns(bool)"
];

const CONTRACT_ADDRESS = "0xB3BE35a4f3f55F765bc882f694B4789Ed6aC8ca6";

async function runTests() {
  console.log("=== 开始测试投票合约 ===");
  
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
  
  console.log("\n=== 测试阶段1: 检查合约状态 ===");
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  
  const owner = await contract.owner();
  console.log("合约所有者:", owner);
  
  const count = await contract.getProposalCount();
  console.log("当前提案数量:", count.toString());
  
  const deployer = await provider.getSigner(0);
  const user1 = await provider.getSigner(1);
  const user2 = await provider.getSigner(2);
  const user3 = await provider.getSigner(3);
  
  const deployerAddr = await deployer.getAddress();
  const user1Addr = await user1.getAddress();
  const user2Addr = await user2.getAddress();
  const user3Addr = await user3.getAddress();
  
  console.log("\n测试账户:");
  console.log(`  部署者: ${deployerAddr}`);
  console.log(`  用户1: ${user1Addr}`);
  console.log(`  用户2: ${user2Addr}`);
  console.log(`  用户3: ${user3Addr}`);
  
  console.log("\n=== 测试阶段2: 创建新提案 ===");
  const proposals = [
    { title: "校园活动预算投票", description: "是否增加本学期活动经费", duration: 24 * 3600, usePoints: false },
    { title: "班级委员会选举", description: "选举新一届班委成员", duration: 48 * 3600, usePoints: true },
    { title: "课程改革提案", description: "是否调整专业课学分结构", duration: 72 * 3600, usePoints: false },
  ];
  
  const deployerContract = contract.connect(deployer);
  
  for (let i = 0; i < proposals.length; i++) {
    try {
      const tx = await deployerContract.createProposal(
        proposals[i].title,
        proposals[i].description,
        proposals[i].duration,
        proposals[i].usePoints
      );
      await tx.wait();
      console.log(`提案 "${proposals[i].title}" 创建成功 (TX: ${tx.hash.slice(0, 10)}...)`);
    } catch (error) {
      console.log(`创建提案 "${proposals[i].title}" 失败: ${error.reason || error.message}`);
    }
  }
  
  console.log("\n=== 测试阶段3: 查询提案列表 ===");
  const newCount = await contract.getProposalCount();
  console.log("创建后提案总数:", newCount.toString());
  
  for (let i = 0; i < newCount; i++) {
    const proposal = await contract.proposals(i);
    console.log(`\n提案 ${i + 1}:`);
    console.log(`  标题: ${proposal[0]}`);
    console.log(`  支持票: ${proposal[1]}`);
    console.log(`  反对票: ${proposal[2]}`);
    console.log(`  结束时间: ${proposal[3]}`);
    console.log(`  是否存在: ${proposal[4]}`);
    console.log(`  状态: ${proposal[5]}`);
    console.log(`  创建者: ${proposal[6]}`);
    console.log(`  需要积分: ${proposal[7]}`);
  }
  
  console.log("\n=== 测试阶段4: 发放积分 ===");
  const users = [user1, user2, user3];
  const userAddrs = [user1Addr, user2Addr, user3Addr];
  
  for (let i = 0; i < users.length; i++) {
    try {
      const tx = await deployerContract.mintPoints(userAddrs[i]);
      await tx.wait();
      const points = await contract.userPoints(userAddrs[i]);
      console.log(`用户${i + 1} (${userAddrs[i].slice(0, 6)}...) 获得积分后: ${points}`);
    } catch (error) {
      console.log(`给用户${i + 1}发积分失败: ${error.reason}`);
    }
  }
  
  console.log("\n=== 测试阶段5: 用户投票 ===");
  // 使用新创建的提案ID（从 newCount - 3 开始，因为创建了3个新提案）
  const newCountNum = Number(newCount);
  const firstNewProposalId = newCountNum - 3;
  console.log(`新创建的提案ID范围: ${firstNewProposalId} - ${newCountNum - 1}`);
  
  const votes = [
    { signer: user1, proposalId: BigInt(firstNewProposalId), support: true },
    { signer: user1, proposalId: BigInt(firstNewProposalId + 1), support: true },
    { signer: user2, proposalId: BigInt(firstNewProposalId), support: false },
    { signer: user2, proposalId: BigInt(firstNewProposalId + 1), support: false },
    { signer: user3, proposalId: BigInt(firstNewProposalId), support: true },
    { signer: user3, proposalId: BigInt(firstNewProposalId + 1), support: true },
  ];
  
  for (const vote of votes) {
    const userContract = contract.connect(vote.signer);
    const addr = await vote.signer.getAddress();
    try {
      console.log(`用户 ${addr.slice(0, 6)} 尝试对提案${Number(vote.proposalId) + 1} ${vote.support ? '支持' : '反对'}...`);
      const tx = await userContract.vote(vote.proposalId, vote.support, { gasLimit: 300000 });
      await tx.wait();
      console.log(`用户 ${addr.slice(0, 6)} 对提案${Number(vote.proposalId) + 1} ${vote.support ? '支持' : '反对'}成功 (TX: ${tx.hash.slice(0, 10)}...)`);
    } catch (error) {
      console.log(`用户 ${addr.slice(0, 6)} 投票失败: ${error.reason || error.message || '未知错误'}`);
    }
  }
  
  console.log("\n=== 测试阶段6: 投票结果汇总 ===");
  for (let i = 0; i < newCount; i++) {
    const proposal = await contract.proposals(i);
    const [yesRate, noRate] = await contract.getVoteRate(i);
    const totalVotes = parseInt(proposal[1]) + parseInt(proposal[2]);
    
    console.log(`\n提案 ${i + 1}: ${proposal[0]}`);
    console.log(`├── 支持票: ${proposal[1]} (${yesRate}%)`);
    console.log(`├── 反对票: ${proposal[2]} (${noRate}%)`);
    console.log(`└── 总票数: ${totalVotes}`);
  }
  
  console.log("\n=== 测试阶段7: 用户积分变化 ===");
  for (let i = 0; i < users.length; i++) {
    const points = await contract.userPoints(userAddrs[i]);
    console.log(`用户${i + 1} (${userAddrs[i].slice(0, 6)}...) 剩余积分: ${points}`);
  }
  
  console.log("\n=== 测试阶段8: 重复投票测试 ===");
  const user1Contract = contract.connect(user1);
  try {
    await user1Contract.vote(0, true);
    console.log("ERROR: 重复投票应该失败但成功了!");
  } catch (error) {
    console.log("重复投票测试通过:", error.reason);
  }
  
  console.log("\n=== 所有测试完成 ===");
}

runTests().catch(console.error);
