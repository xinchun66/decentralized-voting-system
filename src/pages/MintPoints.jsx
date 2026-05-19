import { useState } from "react";
import { useWallet } from "../context/WalletContext.jsx";
import { mintPoints } from "../utils/web3.js";

const inputStyle = {
  width: "100%",
  padding: 14,
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  fontSize: 16,
  boxSizing: "border-box",
  backgroundColor: "#ffffff",
  color: "#0f172a",
};

export default function MintPoints() {
  const { account, userPoints, refreshAccount } = useWallet();
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("10");
  const [loading, setLoading] = useState(false);

  async function handleMint() {
    const n = parseInt(amount, 10);
    if (!toAddress.trim()) {
      alert("请输入接收方钱包地址");
      return;
    }
    if (!Number.isFinite(n) || n < 1 || n > 10000) {
      alert("发放数量须为 1～10000 的整数");
      return;
    }

    setLoading(true);
    try {
      alert("请在 MetaMask 中确认交易");
      await mintPoints(toAddress.trim(), n);
      alert(`已成功发放 ${n} 积分`);
      setToAddress("");
      await refreshAccount();
    } catch (e) {
      alert("发放失败：" + (e.message || e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="page-title">发放积分</h1>
      <p className="page-subtitle">管理员向指定地址铸造链上积分（单次最多 10000）</p>

      <div className="card" style={{ maxWidth: 520, margin: "0 auto" }}>
        <p style={{ margin: "0 0 20px", fontSize: 14, color: "#475569" }}>
          当前账户：{account ? `${account.slice(0, 6)}…${account.slice(-4)}` : "—"} · 您的积分余额：{" "}
          <strong style={{ color: "#5b21b6" }}>{userPoints}</strong>
        </p>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#0f172a" }}>
            接收地址
          </label>
          <input
            type="text"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            placeholder="0x…"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#0f172a" }}>
            发放数量
          </label>
          <input
            type="number"
            min={1}
            max={10000}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="输入积分数量"
            style={inputStyle}
          />
        </div>

        <button type="button" className="btn-primary" style={{ width: "100%" }} onClick={handleMint} disabled={loading}>
          {loading ? "提交中…" : "确认发放"}
        </button>
      </div>
    </>
  );
}
