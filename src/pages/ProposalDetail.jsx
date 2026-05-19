import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  connectWallet,
  getProposalDetail,
  voteProposal,
  getUserPoints,
  getUserVote,
  settleProposal,
} from "../utils/web3.js";
import { useWallet } from "../context/WalletContext.jsx";
import { getProposalModeBadges } from "../utils/proposalModes.js";
import ProposalMarketSection from "../components/ProposalMarketSection.jsx";

export default function ProposalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState(null);
  const [account, setAccount] = useState("");
  const [userPoints, setUserPoints] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [userVoteType, setUserVoteType] = useState(null);
  const [voteWeight, setVoteWeight] = useState(1);
  const [voteSettled, setVoteSettled] = useState(false);
  const [voteWeightInput, setVoteWeightInput] = useState("1");
  const [isVoting, setIsVoting] = useState(false);
  const [settling, setSettling] = useState(false);
  const { isAdmin, refreshAccount } = useWallet();

  useEffect(() => {
    if (id === undefined) return;
    loadProposal();
    restoreWallet();
  }, [id]);

  useEffect(() => {
    if (proposal && account) refreshVoteState();
  }, [proposal, account]);

  async function restoreWallet() {
    if (!window.ethereum) return;
    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      if (accounts[0]) {
        setAccount(accounts[0]);
        const pts = await getUserPoints(accounts[0]);
        setUserPoints(Number(pts));
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleConnect() {
    try {
      const addr = await connectWallet();
      setAccount(addr);
      setUserPoints(Number(await getUserPoints(addr)));
    } catch (e) {
      alert(e.message);
    }
  }

  async function loadProposal() {
    try {
      const p = await getProposalDetail(id);
      setProposal({
        id,
        title: p.title,
        content: p.description,
        yesVotes: p.yesVotes.toString(),
        noVotes: p.noVotes.toString(),
        endTime: p.endTime.toString(),
        status: Number(p.status),
        creator: p.creator,
        requiresPoints: Boolean(p.requiresPoints),
        useWeight: Boolean(p.useWeight),
        realSettlement: Boolean(p.realSettlement),
      });
    } catch (e) {
      console.error("加载提案失败", e);
    }
  }

  async function refreshVoteState() {
    try {
      const v = await getUserVote(id, account);
      setHasVoted(v.voted);
      setVoteSettled(v.settled);
      setVoteWeight(v.weight || 1);
      if (v.voted) setUserVoteType(v.support ? "yes" : "no");
      else setUserVoteType(null);
    } catch (e) {
      console.error(e);
    }
  }

  const isExpired = () => proposal && Date.now() > parseInt(proposal.endTime, 10) * 1000;

  async function handleVote(support) {
    if (!account) {
      alert("请先连接钱包");
      return;
    }
    if (hasVoted) {
      alert("您已投过票");
      return;
    }
    if (isExpired()) {
      alert("投票已结束");
      return;
    }

    let weight = 1;
    if (proposal.useWeight) {
      weight = parseInt(voteWeightInput, 10);
      if (!Number.isFinite(weight) || weight < 1 || weight > 1000) {
        alert("权重须为 1～1000 的整数");
        return;
      }
    }

    if (proposal.requiresPoints) {
      const pts = Number(await getUserPoints(account));
      if (pts < weight) {
        alert(`积分不足，本提案需质押 ${weight} 积分`);
        return;
      }
    }

    setIsVoting(true);
    try {
      await voteProposal(id, support, weight);
      alert("投票成功");
      await loadProposal();
      await refreshVoteState();
      setUserPoints(Number(await getUserPoints(account)));
      await refreshAccount();
    } catch (err) {
      const msg = err.message || "";
      if (msg.includes("用户取消")) alert("您已取消交易");
      else if (msg.includes("Insufficient")) alert("积分不足");
      else alert("投票失败：" + msg);
    } finally {
      setIsVoting(false);
    }
  }

  async function handleSettle() {
    if (!account) return;
    setSettling(true);
    try {
      await settleProposal(id);
      alert("链上结算完成");
      setUserPoints(Number(await getUserPoints(account)));
      await refreshVoteState();
    } catch (e) {
      alert("结算失败：" + (e.message || e));
    } finally {
      setSettling(false);
    }
  }

  if (!proposal) {
    return (
      <p style={{ textAlign: "center", color: "#64748b", padding: 40 }}>
        加载中…
      </p>
    );
  }

  const expired = isExpired();
  const badges = getProposalModeBadges(proposal);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <div>
          <h1 className="page-title" style={{ textAlign: "left", fontSize: 24, marginBottom: 8 }}>
            {proposal.title}
          </h1>
          <div className="badge-row">
            {badges.map((b) => (
              <span key={b.label} className="badge" style={{ background: b.bg, color: b.color }}>
                {b.label}
              </span>
            ))}
          </div>
        </div>
        <button type="button" className="btn-secondary" onClick={() => navigate("/proposals")}>
          ← 返回列表
        </button>
      </div>

      <div className="card" style={{ marginBottom: 24, maxWidth: 720, marginLeft: "auto", marginRight: "auto" }}>
        <h3 style={{ margin: "0 0 10px", color: "#0f172a" }}>提案描述</h3>
        <p style={{ margin: 0, color: "#334155", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
          {proposal.content?.trim() || "暂无描述"}
        </p>
        <p style={{ margin: "12px 0 0", fontSize: 13, color: "#64748b" }}>
          创建者 {proposal.creator?.slice(0, 6)}…{proposal.creator?.slice(-4)} · ID {proposal.id}
        </p>
      </div>

      <ProposalMarketSection
        yesVotes={proposal.yesVotes}
        noVotes={proposal.noVotes}
        expired={expired}
        userVoteType={hasVoted ? userVoteType : null}
        voteWeight={voteWeight}
        requiresPoints={proposal.requiresPoints}
        useWeight={proposal.useWeight}
        realSettlement={proposal.realSettlement}
        voteSettled={voteSettled}
        settling={settling}
        onSettle={handleSettle}
      />

      <p style={{ textAlign: "center", color: "#64748b", fontSize: 14, margin: "20px 0" }}>
        截止：{new Date(parseInt(proposal.endTime, 10) * 1000).toLocaleString("zh-CN")}
      </p>

      {!account ? (
        <div style={{ textAlign: "center" }}>
          <button type="button" className="btn-primary" onClick={handleConnect}>
            连接钱包后投票
          </button>
        </div>
      ) : !expired ? (
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          {proposal.useWeight && !hasVoted && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 600, color: "#0f172a" }}>
                投票权重（1～1000）
              </label>
              <input
                type="number"
                min={1}
                max={1000}
                value={voteWeightInput}
                onChange={(e) => setVoteWeightInput(e.target.value)}
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                  color: "#0f172a",
                }}
              />
              {proposal.requiresPoints && (
                <p style={{ fontSize: 13, color: "#64748b", margin: "6px 0 0" }}>
                  将质押 {voteWeightInput || 1} 积分
                </p>
              )}
            </div>
          )}
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button
              type="button"
              onClick={() => handleVote(true)}
              disabled={hasVoted || isVoting}
              style={voteBtnStyle("#dcfce7", "#166534", hasVoted)}
            >
              {hasVoted ? "已投票" : "支持 YES"}
            </button>
            <button
              type="button"
              onClick={() => handleVote(false)}
              disabled={hasVoted || isVoting}
              style={voteBtnStyle("#fee2e2", "#991b1b", hasVoted)}
            >
              {hasVoted ? "已投票" : "反对 NO"}
            </button>
          </div>
          {hasVoted && (
            <p style={{ textAlign: "center", marginTop: 12, color: "#334155" }}>
              您已投{" "}
              <strong style={{ color: userVoteType === "yes" ? "#16a34a" : "#dc2626" }}>
                {userVoteType === "yes" ? "YES" : "NO"}
              </strong>
              {voteWeight > 1 ? `，权重 ${voteWeight}` : ""}
            </p>
          )}
        </div>
      ) : (
        <p style={{ textAlign: "center", color: "#64748b" }}>投票已结束</p>
      )}

      <div className="card" style={{ maxWidth: 500, margin: "24px auto 0", fontSize: 14, color: "#475569" }}>
        <p style={{ margin: "0 0 6px" }}>地址：{account ? `${account.slice(0, 6)}…${account.slice(-4)}` : "未连接"}</p>
        <p style={{ margin: "0 0 6px" }}>积分：{userPoints}</p>
        <p style={{ margin: 0 }}>角色：{isAdmin ? "管理员" : "普通用户"}</p>
      </div>
    </div>
  );
}

function voteBtnStyle(bg, color, disabled) {
  return {
    padding: "12px 28px",
    background: bg,
    color,
    border: "none",
    borderRadius: 8,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.65 : 1,
    fontWeight: 600,
  };
}
