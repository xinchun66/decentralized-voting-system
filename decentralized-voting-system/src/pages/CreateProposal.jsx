import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProposal } from "../utils/web3.js";

export default function CreateProposal() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [durationHours, setDurationHours] = useState("24"); // 小时数，默认24小时
  const [requiresPoints, setRequiresPoints] = useState(false); // 是否需要积分投票
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title || !durationHours) {
      alert("请填写所有必填字段！");
      return;
    }

    try {
      setLoading(true);
      alert("请在MetaMask中确认交易签名");

      // 调用合约创建提案：标题 + 持续时长(小时) + 是否需要积分
      await createProposal(title, Number(durationHours), requiresPoints);

      alert("✅ 提案创建成功！");
      navigate("/");
    } catch (err) {
      console.error(err);
      if (err.message.includes("用户取消")) {
        alert("您已取消交易");
      } else if (err.message.includes("Not admin")) {
        alert("只有管理员才能创建提案");
      } else {
        alert("❌ 创建失败：" + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: "100%",
      maxWidth: "900px",
      margin: "0 auto",
      padding: "60px 20px",
      boxSizing: "border-box"
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px"
      }}>
        <h1 style={{ fontSize: "26px", margin: 0 }}>创建链上提案</h1>
        <button 
          onClick={() => navigate("/")}
          style={{
            padding: "8px 16px",
            background: "#aa3bff0b",
            color: "#0e0c0cbd",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold" 
          }}
        >
          返回首页
        </button>
      </div>

      <div style={{
        background: "#ffffff",
        border: "1px solid #e5e4e7",
        borderRadius: "12px",
        padding: "36px",
        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)"
      }}>
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>提案标题</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="输入提案标题"
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              fontSize: "16px",
              boxSizing: "border-box"
            }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>投票时长（小时）</label>
          <input
            type="number"
            value={durationHours}
            onChange={(e) => setDurationHours(e.target.value)}
            placeholder="例如：24 / 48 / 72"
            min="1"
            max="720"
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              fontSize: "16px",
              boxSizing: "border-box"
            }}
          />
        </div>

        <div style={{ marginBottom: "28px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "12px", fontWeight: 500 }}>
            <input
              type="checkbox"
              checked={requiresPoints}
              onChange={(e) => setRequiresPoints(e.target.checked)}
              style={{ width: "18px", height: "18px" }}
            />
            需要积分投票
          </label>
          <p style={{ color: "#666", fontSize: "14px", margin: "8px 0 0 30px" }}>
            勾选后，用户需要消耗1积分才能投票
          </p>
        </div>

        <button
          onClick={handleCreate}
          disabled={loading}
          style={{
            width: "100%",
            padding: "16px",
            backgroundColor: "#aa3bff",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "提交中..." : "✅ 创建提案"}
        </button>
      </div>
    </div>
  );
}