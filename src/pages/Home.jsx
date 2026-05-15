import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import heroImage from "../assets/hero.png";
import reactLogo from "../assets/react.svg";
import viteLogo from "../assets/vite.svg";

import { connectWallet, getAllProposals } from "../utils/web3.js";

function Home() {
  const [account, setAccount] = useState("");
  const [proposals, setProposals] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);

  // 输入框临时值 + 真正检索用的关键词
  const [inputValue, setInputValue] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    if (account) loadProposals();
  }, [account]);

  useEffect(() => {
    if (account) loadProposals();
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
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts[0] !== account) setAccount(accounts[0]);
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
      const list = data.map((p) => ({
        title: p.title || "",
        yesVotes: p.yesVotes ? p.yesVotes.toString() : "0",
        noVotes: p.noVotes ? p.noVotes.toString() : "0",
        endTime: p.endTime ? p.endTime.toString() : "0",
        exists: p.exists || false,
        creator: p.creator || ""
      }));
      setProposals(list);
    } catch (err) {
      console.error("加载提案失败", err);
    }
  }

  // 点击搜索按钮
  function handleSearch() {
    setSearchKeyword(inputValue.trim());
  }

  const formatRemainingTime = (endTime) => {
    const now = Math.floor(Date.now() / 1000);
    const left = Number(endTime) - now;
    if (left <= 0) return "已截止";

    const d = Math.floor(left / 86400);
    const h = Math.floor((left % 86400) / 3600);
    const m = Math.floor((left % 3600) / 60);
    const s = left % 60;

    if (d > 0) return `${d}天 ${h}时`;
    if (h > 0) return `${h}时 ${m}分`;
    if (m > 0) return `${m}分 ${s}秒`;
    return `${s}秒`;
  };

  // 根据确认后的关键词过滤
  const filteredProposals = searchKeyword
    ? proposals.filter((item) =>
        item.title.toLowerCase().includes(searchKeyword.toLowerCase())
      )
    : [...proposals];

  const now = Math.floor(Date.now() / 1000);
  const endedProposals = filteredProposals.filter(p => Number(p.endTime) <= now);
  const ongoingProposals = filteredProposals.filter(p => Number(p.endTime) > now);

  return (
    <div style={{
      width: "100%",
      minHeight: "100vh",
      padding: "0 20px 60px 20px",
      textAlign: "center",
      background: "#f6f8fb",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      boxSizing: "border-box",
      position: "relative"
    }}>

      {account && (
        <div style={{
          position: "absolute",
          top: "30px",
          right: "40px",
          zIndex: 999,
          background: "#ffffff",
          padding: "12px 20px",
          borderRadius: "12px",
          boxShadow: "0 4px 14px rgba(0,0,0,0.07)",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          alignItems: "center",
          border: "1px solid #f3f4f6"
        }}>
          <div style={{
            fontSize: "14px",
            color: "#374151",
            fontWeight: 600,
            whiteSpace: "nowrap"
          }}>
            👤 {account.slice(0, 6)}...{account.slice(-4)}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={switchAccount} disabled={isConnecting} style={{
              padding: "6px 12px",
              fontSize: "12px",
              background: "#f3f4f6",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              color: "#374151",
              whiteSpace: "nowrap"
            }}>
              {isConnecting ? "切换中..." : "切换"}
            </button>
            <button onClick={disconnectWallet} style={{
              padding: "6px 12px",
              fontSize: "12px",
              background: "#fee2e2",
              color: "#dc2626",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              whiteSpace: "nowrap"
            }}>
              断开
            </button>
          </div>
        </div>
      )}

      <div style={{ padding: "60px 0 30px 0" }}>
        <img
          src={heroImage}
          alt="Hero"
          style={{ width: "160px", height: "160px", objectFit: "contain", marginBottom: "20px" }}
        />
        <h1 style={{
          fontSize: "28px",
          color: "#7c3aed",
          margin: "0 0 10px 0",
          fontWeight: 700,
          lineHeight: 1.3
        }}>去中心化投票治理系统</h1>
        <p style={{ color: "#6b7280", fontSize: "15px", margin: "0 auto 24px auto" }}>
          基于区块链的透明、安全、不可篡改的链上投票平台
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
          <div style={{ background: "#fff", borderRadius: "10px", padding: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <img src={reactLogo} alt="React" style={{ width: "32px", height: "32px" }} />
          </div>
          <div style={{ background: "#fff", borderRadius: "10px", padding: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <img src={viteLogo} alt="Vite" style={{ width: "32px", height: "32px" }} />
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "30px" }}>
        {!account ? (
          <button onClick={handleConnectWallet} disabled={isConnecting} style={{
            padding: "12px 36px",
            fontSize: "16px",
            fontWeight: 600,
            background: "#7c3aed",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            cursor: isConnecting ? "not-allowed" : "pointer",
            opacity: isConnecting ? 0.7 : 1,
            boxShadow: "0 4px 12px rgba(124, 58, 237, 0.2)",
            transition: "all 0.2s"
          }}
          onMouseOver={e => { if (!isConnecting) e.target.style.transform = "translateY(-2px)"; }}
          onMouseOut={e => e.target.style.transform = "translateY(0)"}
          >{isConnecting ? "⏳ 连接中..." : "🔗 连接钱包"}</button>
        ) : null}
      </div>

      <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "0 auto 30px auto", maxWidth: "600px" }} />

      {/* 搜索栏 + 搜索按钮 */}
      {account && (
        <div style={{
          maxWidth: "600px",
          margin: "0 auto 30px auto",
          display: "flex",
          gap: "10px"
        }}>
          <input
            type="text"
            placeholder="🔍 输入提案标题关键词"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            style={{
              flex: 1,
              padding: "14px 20px",
              fontSize: "15px",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              outline: "none",
              boxSizing: "border-box",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              transition: "all 0.2s"
            }}
            onFocus={(e) => e.target.style.borderColor = "#7c3aed"}
            onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
          />
          <button
            onClick={handleSearch}
            style={{
              padding: "14px 24px",
              fontSize: "15px",
              fontWeight: 600,
              backgroundColor: "#7c3aed",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(124, 58, 237, 0.2)"
            }}
          >
            搜索
          </button>
        </div>
      )}

      {/* 按钮组：创建提案 + 我创建的提案 */}
      <div style={{
        display:"flex",
        gap:"16px",
        justifyContent:"center",
        marginBottom:"40px",
        flexWrap:"wrap"
      }}>
        <Link to="/create">
          <button style={{
            padding: "12px 24px",
            fontSize: "15px",
            fontWeight: 600,
            backgroundColor: "#16a34a",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(22, 163, 74, 0.2)",
            transition: "0.2s"
          }}>✨ 创建新提案</button>
        </Link>

        <Link to="/my-proposals">
          <button style={{
            padding: "12px 24px",
            fontSize: "15px",
            fontWeight: 600,
            backgroundColor: "#7c3aed",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(124, 58, 237, 0.2)",
            transition: "0.2s"
          }}>📋 我创建的提案</button>
        </Link>
      </div>

      {!account ? (
        <div style={{ padding: "40px", color: "#9ca3af", fontSize: "15px" }}>请连接钱包以查看提案</div>
      ) : (
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "30px",
          justifyContent: "center",
          alignItems: "flex-start",
          width: "100%",
          maxWidth: "1000px",
          margin: "0 auto"
        }}>
          <div style={{
            flex: 1,
            minWidth: "320px",
            maxWidth: "480px",
            width: "100%"
          }}>
            <h2 style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "#991b1b",
              margin: "0 0 16px 0",
              textAlign: "left"
            }}>🔴 已截止</h2>

            {endedProposals.length === 0 ? (
              <div style={{
                padding: "40px 20px",
                color: "#6b7280",
                background: "#fff",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
              }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>📭</div>
                <p>{searchKeyword ? "未找到相关提案" : "暂无已截止提案"}</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {endedProposals.map((item) => {
                  const realIndex = proposals.findIndex(p => p === item);
                  return (
                    <Link key={realIndex} to={`/proposal/${realIndex}`} style={{ textDecoration: "none" }}>
                      <div style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: "12px",
                        padding: "24px",
                        background: "#fff",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}>
                        <h3 style={{
                          fontSize: "18px",
                          margin: "0 0 16px 0",
                          color: "#111827",
                          fontWeight: 600,
                          textAlign: "center"
                        }}>{item.title}</h3>
                        <div style={{
                          marginBottom: "16px",
                          fontSize: "13px",
                          color: "#991b1b",
                          fontWeight: 500
                        }}>
                          ⏰ {formatRemainingTime(item.endTime)}
                        </div>
                        <div style={{ display: "flex", justifyContent: "center", gap: "40px" }}>
                          <div style={{ textAlign: "center" }}>
                            <p style={{ color: "#16a34a", fontSize: "28px", fontWeight: "bold", margin: "0 0 4px 0" }}>{item.yesVotes}</p>
                            <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>支持票</p>
                          </div>
                          <div style={{ textAlign: "center" }}>
                            <p style={{ color: "#dc2626", fontSize: "28px", fontWeight: "bold", margin: "0 0 4px 0" }}>{item.noVotes}</p>
                            <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>反对票</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{
            flex: 1,
            minWidth: "320px",
            maxWidth: "480px",
            width: "100%"
          }}>
            <h2 style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "#16a34a",
              margin: "0 0 16px 0",
              textAlign: "left"
            }}>🟢 正在进行</h2>

            {ongoingProposals.length === 0 ? (
              <div style={{
                padding: "40px 20px",
                color: "#6b7280",
                background: "#fff",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
              }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>📭</div>
                <p>{searchKeyword ? "未找到相关提案" : "暂无进行中提案"}</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {ongoingProposals.map((item) => {
                  const realIndex = proposals.findIndex(p => p === item);
                  return (
                    <Link key={realIndex} to={`/proposal/${realIndex}`} style={{ textDecoration: "none" }}>
                      <div style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: "12px",
                        padding: "24px",
                        background: "#fff",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}>
                        <h3 style={{
                          fontSize: "18px",
                          margin: "0 0 16px 0",
                          color: "#111827",
                          fontWeight: 600,
                          textAlign: "center"
                        }}>{item.title}</h3>
                        <div style={{
                          marginBottom: "16px",
                          fontSize: "13px",
                          color: "#16a34a",
                          fontWeight: 500
                        }}>
                          ⏰ 剩余时间：{formatRemainingTime(item.endTime)}
                        </div>
                        <div style={{ display: "flex", justifyContent: "center", gap: "40px" }}>
                          <div style={{ textAlign: "center" }}>
                            <p style={{ color: "#16a34a", fontSize: "28px", fontWeight: "bold", margin: "0 0 4px 0" }}>{item.yesVotes}</p>
                            <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>支持票</p>
                          </div>
                          <div style={{ textAlign: "center" }}>
                            <p style={{ color: "#dc2626", fontSize: "28px", fontWeight: "bold", margin: "0 0 4px 0" }}>{item.noVotes}</p>
                            <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>反对票</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;