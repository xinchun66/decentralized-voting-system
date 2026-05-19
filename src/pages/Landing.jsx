import { useState } from "react";
import { Link } from "react-router-dom";
import heroImage from "../assets/hero.png";
import { useWallet } from "../context/WalletContext.jsx";

export default function Landing() {
  const { account, isAdmin, connectWallet } = useWallet();
  const [connecting, setConnecting] = useState(false);

  async function handleConnect() {
    if (!window.ethereum) {
      alert("请安装 MetaMask");
      return;
    }
    setConnecting(true);
    try {
      await connectWallet();
    } catch (e) {
      alert(e.message);
    } finally {
      setConnecting(false);
    }
  }

  return (
    <div className="landing-hero">
      <img src={heroImage} alt="" style={{ width: 140, height: 140, objectFit: "contain" }} />
      <h1 className="page-title" style={{ fontSize: 36 }}>
        去中心化投票治理系统
      </h1>
      <p className="page-subtitle">
        支持一人一票 / 按权重计票，模拟或真实链上结算，透明可验证
      </p>

      {!account ? (
        <button type="button" className="btn-primary" onClick={handleConnect} disabled={connecting}>
          {connecting ? "连接中…" : "连接钱包"}
        </button>
      ) : (
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#334155", marginBottom: 20 }}>
            已连接：<code style={{ color: "#5b21b6" }}>{account.slice(0, 6)}…{account.slice(-4)}</code>
            <span style={{ marginLeft: 8, fontSize: 14, color: isAdmin ? "#7c3aed" : "#64748b" }}>
              （{isAdmin ? "管理员" : "普通用户"}）
            </span>
          </p>

          {isAdmin ? (
            <div className="landing-cta-grid">
              <Link to="/proposals" className="landing-cta-card">
                <strong>浏览提案</strong>
                <span>查看链上投票与市场概率</span>
              </Link>
              <Link to="/create" className="landing-cta-card">
                <strong>创建提案</strong>
                <span>配置权重、结算模式等</span>
              </Link>
              <Link to="/admin/mint" className="landing-cta-card">
                <strong>发放积分</strong>
                <span>向用户地址铸造任意数量积分</span>
              </Link>
            </div>
          ) : (
            <Link to="/proposals" className="btn-primary" style={{ display: "inline-block", textDecoration: "none" }}>
              进入提案列表 →
            </Link>
          )}
        </div>
      )}

      <div className="landing-features">
        <div className="feature-card">
          <h3>一人一票 / 权重投票</h3>
          <p>创建提案时可选择是否按权重计票；不启用时每人仅 1 票权。</p>
        </div>
        <div className="feature-card">
          <h3>模拟 vs 真实结算</h3>
          <p>模拟结算仅前端演示；真实结算在结束后链上领取奖惩，结合权重差异化奖罚。</p>
        </div>
        <div className="feature-card">
          <h3>市场概率与图表</h3>
          <p>实时 YES/NO 概率、饼图与柱状图，便于预测市场分析。</p>
        </div>
      </div>
    </div>
  );
}
