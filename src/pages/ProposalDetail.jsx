import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAllProposals, voteProposal, getUserPoints, connectWallet } from "../utils/web3.js";

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
      checkIfVoted();
    } catch (err) {
      console.error(err);
    }
  }

  async function loadProposal() {
    try {
      const list = await getAllProposals();
      const p = list[id];

      setProposal({
        title: p.title,
        content: p.content,
        yesVotes: p.yesVotes.toString(),
        noVotes: p.noVotes.toString(),
        endTime: p.endTime.toString(),
        exists: p.exists
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
    try {
      const { getContract } = require("../utils/web3.js");
      const contract = await getContract();
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
    if (userPoints < 10) {
      alert("⚠️ 积分不足，需要至少10积分");
      return;
    }
    if (isExpired()) {
      alert("⚠️ 投票已结束！");
      return;
    }

    setIsVoting(true);
    try {
      await voteProposal(id, support);
      alert("✅ 投票成功！");
      
      const voteType = support ? "yes" : "no";
      localStorage.setItem(`vote_${id}_${account}`, voteType);
      setUserVoteType(voteType);
      setHasVoted(true);
      loadProposal();
    } catch (err) {
      console.error(err);
      const msg = err.message || "";
      if (msg.includes("Already voted")) {
        alert("⚠️ 您已投过票！");
        setHasVoted(true);
      } else if (msg.includes("expired")) {
        alert("⚠️ 投票已结束！");
      } else if (msg.includes("points")) {
        alert("⚠️ 积分不足！");
      } else {
        alert("❌ 投票失败：" + msg);
      }
    } finally {
      setIsVoting(false);
    }
  }

  if (!proposal) {
    return (
      <div style={{ 
        width: "100vw", 
        height: "50vh", 
        display: "flex", 
        flexDirection: "column",
        alignItems: "center", 
        justifyContent: "center" 
      }}>
        <div style={{ fontSize: "48px", marginBottom: "12px" }}>⏳</div>
        <p style={{ fontSize: "16px", color: "#666" }}>提案加载中...</p>
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
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      boxSizing: "border-box"
    }}>
      {/* 返回 + 标题 */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "32px",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <h1 style={{ 
          fontSize: "26px", 
          fontWeight: 700, 
          margin: 0,
          color: "#1f2937",
          lineHeight: 1.3
        }}>{proposal.title}</h1>
        
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "10px 20px",
            background: "#f3e8ff",
            color: "#7e22ce",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "15px",
            fontWeight: 600,
            transition: "all 0.2s",
            boxShadow: "0 2px 8px rgba(126,34,206,0.1)"
          }}
          onMouseOver={e => e.target.style.background = "#e9d5ff"}
          onMouseOut={e => e.target.style.background = "#f3e8ff"}
        >
          ← 返回列表
        </button>
      </div>

      {/* 提案详情卡片 */}
      <div style={{
        background: "#ffffff",
        padding: "28px 32px",
        borderRadius: "16px",
        margin: "0 auto 32px auto",
        maxWidth: "700px",
        lineHeight: "1.8",
        fontSize: "15px",
        border: "1px solid #f3f4f6",
        boxShadow: "0 4px 16px rgba(0,0,0,0.04)"
      }}>
        <h3 style={{ 
          margin: "0 0 14px 0", 
          fontSize: "18px", 
          fontWeight: 600,
          color: "#1f2937"
        }}>📝 提案详情</h3>
        <p style={{ 
          margin: 0, 
          color: "#4b5563",
          fontSize: "15px"
        }}>{proposal.content || "暂无详情"}</p>
      </div>

      {/* 投票结果 */}
      <div style={{
        background: "#ffffff",
        borderRadius: "18px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
        padding: "36px",
        maxWidth: "340px",
        margin: "0 auto 36px auto"
      }}>
        <h3 style={{ 
          textAlign: "center", 
          fontSize: "17px", 
          fontWeight: 600,
          marginBottom: "24px",
          color: "#1f2937"
        }}>📊 投票结果</h3>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: "28px" }}>
          <svg width="160" height="160" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="#f9fafb" />
            {totalVotes > 0 && (
              <circle
                cx="50" cy="50" r="45" fill="none"
                stroke="#22c55e" strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: "stroke-dashoffset 0.5s ease", transform: "rotate(-90deg)", transformOrigin: "center" }}
              />
            )}
            <text x="50" y="48" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#1f2937">
              {totalVotes > 0 ? `${voteRate.yes}%` : "0%"}
            </text>
            <text x="50" y="66" textAnchor="middle" fontSize="12" fill="#6b7280">支持</text>
          </svg>
        </div>

        <div style={{ marginBottom: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ color: "#16a34a", fontWeight: 500 }}>支持票</span>
            <span style={{ color: "#374151" }}>{yesVotes} 票</span>
          </div>
          <div style={{ height: "10px", background: "#f3f4f6", borderRadius: "10px" }}>
            <div style={{ height: "100%", width: `${voteRate.yes}%`, background: "#22c55e", borderRadius: "10px" }} />
          </div>
        </div>

        <div style={{ marginBottom: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ color: "#dc2626", fontWeight: 500 }}>反对票</span>
            <span style={{ color: "#374151" }}>{noVotes} 票</span>
          </div>
          <div style={{ height: "10px", background: "#f3f4f6", borderRadius: "10px" }}>
            <div style={{ height: "100%", width: `${voteRate.no}%`, background: "#ef4444", borderRadius: "10px" }} />
          </div>
        </div>

        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          borderTop: "1px solid #f3f4f6", 
          paddingTop: "18px",
          marginTop: "8px"
        }}>
          <span style={{ color: "#6b7280" }}>总投票数</span>
          <span style={{ fontWeight: 600, color: "#1f2937" }}>{totalVotes}</span>
        </div>
      </div>

      {/* 截止时间 */}
      <div style={{ 
        textAlign: "center", 
        marginBottom: "36px", 
        fontSize: "15px", 
        color: "#6b7280",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px"
      }}>
        <span>⏰</span>
        <span>投票截止时间：{formatEndTime(proposal.endTime)}</span>
      </div>

      {/* 投票按钮 */}
      {!isExpired() ? (
        <div>
          <div style={{ display: "flex", gap: "18px", justifyContent: "center" }}>
            <button
              onClick={() => handleVote(true)}
              disabled={hasVoted || isVoting || userPoints < 10}
              style={{
                padding: "14px 36px",
                background: hasVoted ? "#d1fae5" : "#22c55e",
                color: hasVoted ? "#065f46" : "#ffffff",
                border: "none",
                borderRadius: "12px",
                cursor: hasVoted ? "not-allowed" : "pointer",
                fontSize: "15px",
                fontWeight: 600,
                transition: "all 0.2s",
                boxShadow: hasVoted ? "none" : "0 4px 12px rgba(34,197,94,0.2)",
                opacity: hasVoted ? 0.9 : 1
              }}
            >
              {isVoting ? "投票中..." : (hasVoted ? "✅ 已投票" : "👍 支持")}
            </button>

            <button
              onClick={() => handleVote(false)}
              disabled={hasVoted || isVoting || userPoints < 10}
              style={{
                padding: "14px 36px",
                background: hasVoted ? "#fee2e2" : "#ef4444",
                color: hasVoted ? "#991b1b" : "#ffffff",
                border: "none",
                borderRadius: "12px",
                cursor: hasVoted ? "not-allowed" : "pointer",
                fontSize: "15px",
                fontWeight: 600,
                transition: "all 0.2s",
                boxShadow: hasVoted ? "none" : "0 4px 12px rgba(239,68,68,0.2)",
                opacity: hasVoted ? 0.9 : 1
              }}
            >
              {isVoting ? "投票中..." : (hasVoted ? "✅ 已投票" : "👎 反对")}
            </button>
          </div>

          {hasVoted && (
            <p style={{ 
              textAlign:"center", 
              marginTop:"16px", 
              fontSize:"15px",
              color: "#4b5563"
            }}>
              ✅ 您已投
              <span style={{ 
                color: userVoteType === "yes" ? "#16a34a" : "#dc2626", 
                fontWeight:"600" 
              }}>
                {userVoteType === "yes" ? " 支持票" : " 反对票"}
              </span>
            </p>
          )}
        </div>
      ) : (
        <div style={{
          padding: "16px 32px",
          background: "#f9fafb",
          color: "#6b7280",
          borderRadius: "12px",
          textAlign: "center",
          maxWidth: "300px",
          margin: "0 auto"
        }}>
          <span>✅ 投票已结束</span>
        </div>
      )}
    </div>
  );
}

export default ProposalDetail;