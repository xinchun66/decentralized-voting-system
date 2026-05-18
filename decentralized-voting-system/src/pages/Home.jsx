import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Link } from "react-router-dom";
import heroImage from "../assets/hero.png";
import reactLogo from "../assets/react.svg";
import viteLogo from "../assets/vite.svg";

import { connectWallet, getAllProposals, voteProposal, checkNetwork } from "../utils/web3.js";

function Home() {
  const [account, setAccount] = useState("");
  const [proposals, setProposals] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);

  // ✅ 页面加载时，只要有账户，就加载提案
  useEffect(() => {
    if (account) {
      loadProposals();
    }
  }, [account]);

  // ✅ 页面挂载时也加载一次，解决从创建页返回不刷新的问题
  useEffect(() => {
    if (account) {
      loadProposals();
    }
  }, []);

  async function handleConnectWallet() {
    if (!window.ethereum) {
      alert("请安装MetaMask");
      return;
    }

    setIsConnecting(true);

    try {
      const addr = await connectWallet();
      setAccount(addr);
    } catch (error) {
      console.error("连接钱包失败:", error);
      alert(error.message);
    } finally {
      setIsConnecting(false);
    }
  }

  function disconnectWallet() {
    setAccount("");
    setProposals([]);
  }

  async function switchAccount() {
    if (!window.ethereum) {
      alert("请安装MetaMask");
      return;
    }

    setIsConnecting(true);

    try {
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }]
      });

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
      });

      if (accounts[0] !== account) {
        setAccount(accounts[0]);
      }
    } catch (error) {
      console.error("切换账户失败:", error);
    } finally {
      setIsConnecting(false);
    }
  }

  async function loadProposals() {
    if (!account) return;

    try {
      const data = await getAllProposals();
      const list = data.map((p, index) => ({
        id: index,
        title: p.title || "",
        yesVotes: p.yesVotes ? p.yesVotes.toString() : "0",
        noVotes: p.noVotes ? p.noVotes.toString() : "0",
        endTime: p.endTime ? p.endTime.toString() : "0",
        exists: p.exists || false,
        status: p.status !== undefined ? Number(p.status) : 0,
        creator: p.creator || "",
        requiresPoints: Boolean(p.requiresPoints)
      }));
      setProposals(list);
    } catch (err) {
      console.error("加载提案失败", err);
    }
  }

  async function vote(index) {
    if (!account) return alert("请先连接钱包");
    try {
      alert("请在MetaMask中确认交易签名");
      await voteProposal(index, true);
      alert("投票成功！");
      loadProposals();
    } catch (error) {
      console.error("投票失败:", error);
      if (error.message.includes("用户取消")) {
        alert("您已取消交易");
      } else if (error.message.includes("Insufficient")) {
        alert("积分不足，请先获取积分");
      } else if (error.message.includes("Voted already")) {
        alert("您已经投过票了");
      } else {
        alert("投票失败: " + error.message);
      }
    }
  }

  return (
    <div style={{
      padding: "40px 20px",
      textAlign: "center",
      minHeight: "100vh"
    }}>

      <div style={{ marginBottom: "30px" }}>
        <img
          src={heroImage}
          alt="Hero"
          style={{
            width: "150px",
            height: "150px",
            objectFit: "contain"
          }}
        />
      </div>

      <h1 style={{
        fontSize: "32px",
        color: "#111",
        marginBottom: "30px"
      }}>去中心化投票治理系统</h1>

      <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "30px" }}>
        <img src={reactLogo} alt="React" style={{ width: "40px", height: "40px" }} />
        <img src={viteLogo} alt="Vite" style={{ width: "40px", height: "40px" }} />
      </div>

      {!account ? (
        <button onClick={handleConnectWallet} disabled={isConnecting} style={{
          padding: "12px 32px",
          fontSize: "16px",
          background: "#7c3aed",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: isConnecting ? "not-allowed" : "pointer",
          opacity: isConnecting ? 0.7 : 1
        }}>
          {isConnecting ? "连接中..." : "连接钱包"}
        </button>
      ) : (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px"
        }}>
          <p style={{
            marginTop: "16px",
            color: "#333",
            fontSize: "16px"
          }}>
            钱包: {account.slice(0, 6)}...{account.slice(-4)}
          </p>
          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={switchAccount} disabled={isConnecting} style={{
              padding: "10px 20px",
              fontSize: "14px",
              background: "#f3f4f6",
              border: "1px solid #ddd",
              borderRadius: "6px",
              cursor: "pointer"
            }}>
              {isConnecting ? "切换中..." : "🔄 切换账户"}
            </button>
            <button onClick={disconnectWallet} style={{
              padding: "10px 20px",
              fontSize: "14px",
              background: "#fee2e2",
              color: "#dc2626",
              border: "1px solid #fecaca",
              borderRadius: "6px",
              cursor: "pointer"
            }}>
              📴 断开连接
            </button>
          </div>
        </div>
      )}

      <hr style={{ margin: "30px 0", borderTop: "1px solid #eee" }} />

      <Link to="/create">
        <button style={{
          marginBottom: "24px",
          padding: "12px 24px",
          fontSize: "16px",
          backgroundColor: "#7c3aed",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer"
        }}>
          ✨ 创建新提案
        </button>
      </Link>

      <h2 style={{ fontSize: "24px", marginBottom: "24px" }}>链上提案列表</h2>

      {!account ? (
        <p style={{ color: "#999" }}>请连接钱包查看提案</p>
      ) : proposals.length === 0 ? (
        <p style={{ color: "#666" }}>暂无提案</p>
      ) : (
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          maxWidth: "600px",
          margin: "0 auto"
        }}>
          {proposals.map((item, index) => (
            <Link key={index} to={`/proposal/${index}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{
                border: "1px solid #eee",
                borderRadius: "12px",
                padding: "24px",
                background: "#fff",
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                cursor: "pointer"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <h3 style={{ fontSize: "20px", margin: 0 }}>{item.title}</h3>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <span style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      background: item.requiresPoints ? "#fef3c7" : "#d1fae5",
                      color: item.requiresPoints ? "#92400e" : "#065f46"
                    }}>
                      {item.requiresPoints ? "💰 需要积分" : "🆓 免费投票"}
                    </span>
                    <span style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      background: item.status === 1 ? "#dbeafe" : "#f3f4f6",
                      color: item.status === 1 ? "#1e40af" : "#6b7280"
                    }}>
                      {item.status === 1 ? "✅ 进行中" : item.status === 2 ? "⏰ 已结束" : "❌ 未开始"}
                    </span>
                  </div>
                </div>
                
                <p style={{ fontSize: "12px", color: "#666", margin: "0 0 8px 0" }}>
                  创建者: {item.creator ? `${item.creator.slice(0, 6)}...${item.creator.slice(-4)}` : "未知"}
                </p>
                
                <p style={{ fontSize: "12px", color: "#666", margin: "0 0 16px 0" }}>
                  结束时间: {item.endTime ? new Date(parseInt(item.endTime) * 1000).toLocaleString("zh-CN") : "未知"}
                </p>

                <div style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "32px",
                  marginBottom: "20px"
                }}>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ color: "#22c55e", fontSize: "28px", fontWeight: "bold", margin: 0 }}>{item.yesVotes}</p>
                    <p style={{ color: "#666", fontSize: "14px" }}>支持票</p>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ color: "#ef4444", fontSize: "28px", fontWeight: "bold", margin: 0 }}>{item.noVotes}</p>
                    <p style={{ color: "#666", fontSize: "14px" }}>反对票</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
}

export default Home;