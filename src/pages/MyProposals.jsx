import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { connectWallet, getAllProposals } from "../utils/web3.js";

function MyProposals() {
  const navigate = useNavigate();
  const [account, setAccount] = useState("");
  const [myProposals, setMyProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyProposals();
  }, [account]);

  async function loadMyProposals() {
    try {
      setLoading(true);
      let addr = account;
      if (!addr) {
        addr = await connectWallet();
        setAccount(addr);
      }

      const all = await getAllProposals();
      const mine = all
        .map((p, index) => ({
          id: index,
          title: p.title,
          content: p.content,
          yesVotes: p.yesVotes.toString(),
          noVotes: p.noVotes.toString(),
          endTime: p.endTime.toString(),
          creator: p.creator || "",
          exists: p.exists
        }))
        .filter(p => p.creator.toLowerCase() === addr.toLowerCase());

      setMyProposals(mine);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const formatRemainingTime = (endTime) => {
    const now = Math.floor(Date.now() / 1000);
    const left = Number(endTime) - now;
    if (left <= 0) return "已截止";
    const d = Math.floor(left / 86400);
    const h = Math.floor((left % 86400) / 3600);
    const m = Math.floor((left % 3600) / 60);
    if (d > 0) return `${d}天 ${h}时`;
    if (h > 0) return `${h}时 ${m}分`;
    if (m > 0) return `${m}分`;
    return "即将截止";
  };

  return (
    <div style={{
      width: "100%",
      minHeight: "100vh",
      padding: "40px 20px",
      background: "#f6f8fb",
      fontFamily: "'Inter', system-ui, sans-serif",
      boxSizing: "border-box"
    }}>
      <div style={{
        maxWidth: "800px",
        margin: "0 auto"
      }}>
        {/* 顶部 */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px"
        }}>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#7c3aed" }}>
            📋 我创建的提案
          </h1>
          <button
            onClick={() => navigate("/")}
            style={{
              padding: "10px 20px",
              background: "#f3e8ff",
              color: "#7e22ce",
              border: "none",
              borderRadius: "10px",
              fontSize: "15px",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            ← 返回首页
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: "36px" }}>⏳</div>
            <p style={{ color: "#666" }}>加载中...</p>
          </div>
        ) : myProposals.length === 0 ? (
          <div style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "60px 20px",
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
            <p style={{ fontSize: "16px", color: "#6b7280" }}>你还没有创建任何提案</p>
            <Link to="/create">
              <button style={{
                marginTop: "20px",
                padding: "12px 24px",
                background: "#16a34a",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: 600,
                cursor: "pointer"
              }}>✨ 去创建提案</button>
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {myProposals.map((item) => (
              <Link
                key={item.id}
                to={`/proposal/${item.id}`}
                style={{ textDecoration: "none" }}
              >
                <div style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "24px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  cursor: "pointer"
                }}>
                  <h3 style={{
                    fontSize: "18px",
                    margin: "0 0 12px 0",
                    color: "#111827",
                    fontWeight: 600,
                    textAlign: "center"
                  }}>{item.title}</h3>

                  <div style={{
                    textAlign: "center",
                    fontSize: "13px",
                    color: "#7c3aed",
                    marginBottom: "16px",
                    fontWeight: 500
                  }}>
                    ⏰ {formatRemainingTime(item.endTime)}
                  </div>

                  <div style={{ display: "flex", justifyContent: "center", gap: "40px" }}>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ color: "#16a34a", fontSize: "24px", fontWeight: "bold", margin: 0 }}>
                        {item.yesVotes}
                      </p>
                      <p style={{ color: "#6b7280", fontSize: "12px" }}>支持</p>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ color: "#dc2626", fontSize: "24px", fontWeight: "bold", margin: 0 }}>
                        {item.noVotes}
                      </p>
                      <p style={{ color: "#6b7280", fontSize: "12px" }}>反对</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyProposals;