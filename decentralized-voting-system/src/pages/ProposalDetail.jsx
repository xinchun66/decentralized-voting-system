import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAllProposals, voteProposal, getUserPoints, connectWallet, getReadOnlyContract, checkNetwork, mintPoints, isOwner } from "../utils/web3.js";

function ProposalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState(null);
  const [voteRate, setVoteRate] = useState({ yes: 0, no: 0 });
  const [account, setAccount] = useState("");
  const [userPoints, setUserPoints] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [userVoteType, setUserVoteType] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mintAddress, setMintAddress] = useState("");

  const circumference = 2 * Math.PI * 45;

  useEffect(() => {
    if (id === undefined) return;
    loadProposal();
    loadWalletInfo();
  }, [id]);

  useEffect(() => {
    if (!proposal || !account) return;
    checkIfVoted();
  }, [proposal, account]);

  async function loadWalletInfo() {
    try {
      const addr = await connectWallet();
      setAccount(addr);
      const pts = await getUserPoints(addr);
      setUserPoints(Number(pts));
      
      const ownerStatus = await isOwner(addr);
      setIsAdmin(ownerStatus);
      
      checkIfVoted();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }

  async function loadProposal() {
    try {
      const list = await getAllProposals();
      const p = list[id];

      setProposal({
        id: id,
        title: p.title,
        content: p.content,
        yesVotes: p.yesVotes.toString(),
        noVotes: p.noVotes.toString(),
        endTime: p.endTime.toString(),
        exists: p.exists,
        status: p.status !== undefined ? Number(p.status) : 0,
        creator: p.creator || "",
        requiresPoints: Boolean(p.requiresPoints)
      });

      const yesVotes = Number(p.yesVotes);
      const noVotes = Number(p.noVotes);
      const total = yesVotes + noVotes;

      if (total > 0) {
        setVoteRate({
          yes: Math.round((yesVotes / total) * 100),
          no: Math.round((noVotes / total) * 100),
        });
      } else {
        setVoteRate({ yes: 0, no: 0 });
      }
    } catch (error) {
      console.error("加载提案失败:", error);
    }
  }

  async function checkIfVoted() {
    if (!account || !proposal) return;
    
    try {
      const contract = await getReadOnlyContract();
      const voted = await contract.hasVoted(id, account);
      setHasVoted(voted);

      if (voted) {
        const t = localStorage.getItem(`vote_${id}_${account}`) || "";
        setUserVoteType(t === "yes" ? "yes" : "no");
      } else {
        setUserVoteType(null);
      }
    } catch (err) {
      console.error("检查投票状态失败:", err);
      setHasVoted(false);
    }
  }

  const isExpired = () => {
    if (!proposal) return false;
    return Date.now() > parseInt(proposal.endTime) * 1000;
  };

  const formatEndTime = (timestamp) => {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleString("zh-CN");
  };

  async function handleVote(support) {
    if (hasVoted) {
      alert("⚠️ 您已投过票，无法重复投票！");
      return;
    }
    if (isExpired()) {
      alert("⚠️ 投票已结束！");
      return;
    }

    // 检查积分
    const pts = await getUserPoints(account);
    if (Number(pts) < 1) {
      alert("⚠️ 积分不足！请联系管理员获取积分");
      return;
    }

    setIsVoting(true);
    try {
      console.log(`投票: 提案ID=${id}, 支持=${support}`);
      await voteProposal(id, support);
      alert("✅ 投票成功！");
      
      const voteType = support ? "yes" : "no";
      localStorage.setItem(`vote_${id}_${account}`, voteType);
      setUserVoteType(voteType);
      setHasVoted(true);
      loadProposal();
      const newPts = await getUserPoints(account);
      setUserPoints(Number(newPts));
    } catch (err) {
      console.error("投票失败:", err);
      const msg = err.message || "";
      if (msg.includes("用户取消")) {
        alert("您已取消交易");
      } else if (msg.includes("网络不匹配")) {
        alert("⚠️ 网络不匹配！请检查 MetaMask 网络配置");
      } else if (msg.includes("aborted")) {
        alert("交易被中断，请重试");
      } else {
        alert("❌ 投票失败：" + msg);
      }
    } finally {
      setIsVoting(false);
    }
  }

  async function handleMintPoints() {
    if (!mintAddress) {
      alert("请输入要发放积分的地址");
      return;
    }
    
    try {
      await mintPoints(mintAddress, 10);
      alert("✅ 积分发放成功！");
      setMintAddress("");
    } catch (err) {
      console.error("发放积分失败:", err);
      alert("发放积分失败: " + err.message);
    }
  }

  if (!proposal) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <div style={{ fontSize: "48px" }}>⏳</div>
        <p>加载中...</p>
      </div>
    );
  }

  const yesVotes = Number(proposal.yesVotes);
  const noVotes = Number(proposal.noVotes);
  const totalVotes = yesVotes + noVotes;
  const strokeDashoffset = circumference - (voteRate.yes / 100) * circumference;

  return (
    <div style={{
      width: "100%",
      maxWidth: "900px",
      margin: "0 auto",
      padding: "40px 20px",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        marginBottom: "30px"
      }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "24px", margin: "0 0 8px 0" }}>{proposal.title}</h1>
          <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
            <span style={{
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              background: proposal.requiresPoints ? "#fef3c7" : "#d1fae5",
              color: proposal.requiresPoints ? "#92400e" : "#065f46"
            }}>
              {proposal.requiresPoints ? "💰 需要积分投票" : "🆓 免费投票"}
            </span>
            <span style={{
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              background: proposal.status === 1 ? "#dbeafe" : "#f3f4f6",
              color: proposal.status === 1 ? "#1e40af" : "#6b7280"
            }}>
              {proposal.status === 1 ? "✅ 进行中" : proposal.status === 2 ? "⏰ 已结束" : "❌ 未开始"}
            </span>
          </div>
        </div>
        <button
          onClick={() => navigate("/")}
          style={{
            position: "absolute",
            right: 0,
            padding: "8px 16px",
            background: "#aa3bff0b",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold"
          }}
        >
          ← 返回列表
        </button>
      </div>

      <div style={{
        background: "#f9fafb",
        padding: "20px 25px",
        borderRadius: "12px",
        margin: "0 auto 30px auto",
        maxWidth: "600px",
        lineHeight: "1.7",
        fontSize: "15px",
        border: "1px solid #eee"
      }}>
        <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>📝 提案详情</h3>
        <p style={{ margin: "0 0 10px 0" }}>{proposal.content || "暂无详情"}</p>
        <div style={{ borderTop: "1px solid #ddd", paddingTop: "10px", marginTop: "10px" }}>
          <p style={{ margin: "0 0 6px 0", fontSize: "13px", color: "#666" }}>
            <strong>创建者:</strong> {proposal.creator ? `${proposal.creator.slice(0, 6)}...${proposal.creator.slice(-4)}` : "未知"}
          </p>
          <p style={{ margin: "0", fontSize: "13px", color: "#666" }}>
            <strong>提案ID:</strong> {proposal.id}
          </p>
        </div>
      </div>

      <div style={{
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        padding: "30px",
        maxWidth: "300px",
        margin: "0 auto 30px auto"
      }}>
        <h3 style={{ textAlign: "center", fontSize: "16px", marginBottom: "20px" }}>📊 投票结果</h3>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <svg width="150" height="150" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="#f3f4f6" />
            {totalVotes > 0 && (
              <circle
                cx="50" cy="50" r="45" fill="none"
                stroke="#22c55e" strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: "stroke-dashoffset 0.5s ease", transform: "rotate(-90deg)", transformOrigin: "center" }}
              />
            )}
            <text x="50" y="45" textAnchor="middle" fontSize="14" fill="#333">
              {totalVotes > 0 ? `${voteRate.yes}%` : "0%"}
            </text>
            <text x="50" y="60" textAnchor="middle" fontSize="10" fill="#666">支持</text>
          </svg>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
            <span style={{ color: "#22c55e" }}>支持票</span>
            <span>{yesVotes} 票</span>
          </div>
          <div style={{ height: "10px", background: "#e5e7eb", borderRadius: "5px" }}>
            <div style={{ height: "100%", width: `${voteRate.yes}%`, background: "#22c55e" }} />
          </div>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
            <span style={{ color: "#ef4444" }}>反对票</span>
            <span>{noVotes} 票</span>
          </div>
          <div style={{ height: "10px", background: "#e5e7eb", borderRadius: "5px" }}>
            <div style={{ height: "100%", width: `${voteRate.no}%`, background: "#ef4444" }} />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #eee", paddingTop: "15px" }}>
          <span>总票数</span>
          <span style={{ fontWeight: "bold" }}>{totalVotes}</span>
        </div>
      </div>

      <div style={{ textAlign: "center", marginBottom: "30px", fontSize: "14px", color: "#666" }}>
        <span>⏰ 截止时间：{formatEndTime(proposal.endTime)}</span>
      </div>

      {!isExpired() ? (
        <div>
          <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
            <button
              onClick={() => handleVote(true)}
              disabled={hasVoted || isVoting}
              style={{
                padding: "12px 30px",
                background: hasVoted ? "#d1fae5" : "#bbf7c1",
                color: "#166534",
                border: "none",
                borderRadius: "8px",
                cursor: hasVoted ? "not-allowed" : "pointer",
                opacity: hasVoted ? 0.6 : 1
              }}
            >
              {hasVoted ? "✅ 已投票" : "👍 支持"}
            </button>
            <button
              onClick={() => handleVote(false)}
              disabled={hasVoted || isVoting}
              style={{
                padding: "12px 30px",
                background: hasVoted ? "#fee2e2" : "#fecaca",
                color: "#991b1b",
                border: "none",
                borderRadius: "8px",
                cursor: hasVoted ? "not-allowed" : "pointer",
                opacity: hasVoted ? 0.6 : 1
              }}
            >
              {hasVoted ? "✅ 已投票" : "👎 反对"}
            </button>
          </div>

          {hasVoted && (
            <p style={{ textAlign:"center", marginTop:"12px", fontSize:"14px" }}>
              ✅ 您已投
              <span style={{ color: userVoteType === "yes" ? "#16a34a" : "#dc2626", fontWeight:"bold" }}>
                {userVoteType === "yes" ? " 支持票" : " 反对票"}
              </span>
            </p>
          )}
        </div>
      ) : (
        <p style={{ textAlign: "center", color: "#999" }}>✅ 投票已结束</p>
      )}

      {isAdmin && (
        <div style={{
          marginTop: "40px",
          padding: "20px",
          background: "#fef3c7",
          borderRadius: "12px",
          maxWidth: "500px",
          margin: "40px auto 0 auto"
        }}>
          <h3 style={{ margin: "0 0 15px 0", fontSize: "16px", color: "#92400e" }}>💰 管理员：发放积分</h3>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              value={mintAddress}
              onChange={(e) => setMintAddress(e.target.value)}
              placeholder="输入钱包地址 (0x...)"
              style={{
                flex: 1,
                padding: "10px 12px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "14px"
              }}
            />
            <button
              onClick={handleMintPoints}
              style={{
                padding: "10px 20px",
                background: "#f59e0b",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold"
              }}
            >
              发放10积分
            </button>
          </div>
          <p style={{ margin: "10px 0 0 0", fontSize: "12px", color: "#92400e" }}>
            提示：每次发放10积分
          </p>
        </div>
      )}

      <div style={{ marginTop: "40px", padding: "15px", background: "#f3f4f6", borderRadius: "8px", maxWidth: "500px", margin: "40px auto 0 auto" }}>
        <h4 style={{ margin: "0 0 10px 0", fontSize: "14px" }}>📌 用户信息</h4>
        <p style={{ margin: "0 0 5px 0", fontSize: "13px", color: "#666" }}>
          地址: {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "未连接"}
        </p>
        <p style={{ margin: "0 0 5px 0", fontSize: "13px", color: "#666" }}>
          积分: {userPoints}
        </p>
        <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>
          角色: {isAdmin ? "👑 管理员" : "普通用户"}
        </p>
      </div>
    </div>
  );
}

export default ProposalDetail;