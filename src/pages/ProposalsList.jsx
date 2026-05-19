import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { connectWallet, getAllProposals } from "../utils/web3.js";
import { calcProbability } from "../utils/probability.js";
import {
  getProposalModeBadges,
  getDisplayStatus,
  getStatusBadgeStyle,
  STATUS_LABELS,
} from "../utils/proposalModes.js";

export default function ProposalsList() {
  const [account, setAccount] = useState("");
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    tryRestoreAccount();
  }, []);

  useEffect(() => {
    if (account) loadProposals();
  }, [account]);

  async function tryRestoreAccount() {
    if (!window.ethereum) return;
    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      if (accounts[0]) setAccount(accounts[0]);
    } catch {
      /* ignore */
    }
  }

  async function handleConnect() {
    setConnecting(true);
    try {
      const addr = await connectWallet();
      setAccount(addr);
    } catch (e) {
      alert(e.message);
    } finally {
      setConnecting(false);
    }
  }

  async function loadProposals() {
    setLoading(true);
    try {
      const data = await getAllProposals();
      setProposals(
        data.map((p, index) => ({
          id: index,
          title: p.title || "",
          description: p.description || p.content || "",
          yesVotes: p.yesVotes?.toString() ?? "0",
          noVotes: p.noVotes?.toString() ?? "0",
          endTime: p.endTime?.toString() ?? "0",
          status: p.status !== undefined ? Number(p.status) : 0,
          creator: p.creator || "",
          requiresPoints: Boolean(p.requiresPoints),
          useWeight: Boolean(p.useWeight),
          realSettlement: Boolean(p.realSettlement),
        }))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="page-title">链上提案列表</h1>
      <p className="page-subtitle">查看所有提案的市场概率与投票模式</p>

      {!account ? (
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <p style={{ color: "#64748b", marginBottom: 16 }}>请先连接钱包以加载链上提案</p>
          <button type="button" className="btn-primary" onClick={handleConnect} disabled={connecting}>
            {connecting ? "连接中…" : "连接钱包"}
          </button>
        </div>
      ) : (
        <>
          <p style={{ textAlign: "center", color: "#475569", fontSize: 14, marginBottom: 20 }}>
            钱包 {account.slice(0, 6)}…{account.slice(-4)}
            <button type="button" className="btn-secondary" style={{ marginLeft: 12 }} onClick={loadProposals}>
              刷新
            </button>
          </p>

          {loading ? (
            <p style={{ textAlign: "center", color: "#64748b" }}>加载中…</p>
          ) : proposals.length === 0 ? (
            <p style={{ textAlign: "center", color: "#64748b" }}>暂无提案，管理员可前往创建</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {proposals.map((item) => {
                const rates = calcProbability(item.yesVotes, item.noVotes);
                const badges = getProposalModeBadges(item);
                const displayStatus = getDisplayStatus(item.status, item.endTime);
                return (
                  <Link key={item.id} to={`/proposal/${item.id}`} className="proposal-card">
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
                      <h3>{item.title}</h3>
                      <span className="badge" style={getStatusBadgeStyle(displayStatus)}>
                        {STATUS_LABELS[displayStatus] ?? "未知"}
                      </span>
                    </div>
                    <div className="badge-row" style={{ marginBottom: 10 }}>
                      {badges.map((b) => (
                        <span key={b.label} className="badge" style={{ background: b.bg, color: b.color }}>
                          {b.label}
                        </span>
                      ))}
                    </div>
                    {item.description ? (
                      <p style={{ fontSize: 14, color: "#475569", margin: "0 0 10px", lineHeight: 1.5 }}>{item.description}</p>
                    ) : null}
                    <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 12px" }}>
                      截止 {new Date(parseInt(item.endTime, 10) * 1000).toLocaleString("zh-CN")}
                    </p>
                    <div style={{ display: "flex", gap: 32, justifyContent: "center" }}>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ color: "#16a34a", fontWeight: 700, margin: 0 }}>YES {rates.yesRate}%</p>
                        <p style={{ fontSize: 13, color: "#64748b", margin: 4 }}>{item.yesVotes} 权</p>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ color: "#dc2626", fontWeight: 700, margin: 0 }}>NO {rates.noRate}%</p>
                        <p style={{ fontSize: 13, color: "#64748b", margin: 4 }}>{item.noVotes} 权</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
