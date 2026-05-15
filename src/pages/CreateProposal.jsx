import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProposal } from "../utils/web3.js";

export default function CreateProposal() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [durationHours, setDurationHours] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title || !content || !durationHours) {
      alert("请填写所有字段！");
      return;
    }

    try {
      setLoading(true);
      const now = Math.floor(Date.now() / 1000);
      const endTime = now + Number(durationHours) * 3600;
      await createProposal(title, content, endTime);
      alert("✅ 提案创建成功！");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("❌ 创建失败：" + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: "100%",
      maxWidth: "900px",
      margin: "0 auto",
      padding: "40px 20px",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      boxSizing: "border-box"
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "32px",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <h1 style={{ 
          fontSize: "26px", 
          fontWeight: 700, 
          margin: 0,
          color: "#1f2937"
        }}>创建链上提案</h1>
        
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
          ← 返回首页
        </button>
      </div>

      <div style={{
        background: "#ffffff",
        border: "1px solid #f3f4f6",
        borderRadius: "18px",
        padding: "36px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.06)"
      }}>
        <div style={{ marginBottom: "24px" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "10px", 
            fontWeight: 600,
            color: "#1f2937",
            fontSize: "15px"
          }}>提案标题</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="输入提案标题"
            style={{
              width: "100%",
              padding: "14px 18px",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              fontSize: "15px",
              boxSizing: "border-box",
              outline: "none",
              transition: "all 0.2s"
            }}
            onFocus={(e) => e.target.style.borderColor = "#7c3aed"}
            onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "10px", 
            fontWeight: 600,
            color: "#1f2937",
            fontSize: "15px"
          }}>提案详细内容</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="6"
            placeholder="详细描述提案..."
            style={{
              width: "100%",
              padding: "14px 18px",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              fontSize: "15px",
              resize: "vertical",
              boxSizing: "border-box",
              outline: "none",
              transition: "all 0.2s"
            }}
            onFocus={(e) => e.target.style.borderColor = "#7c3aed"}
            onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
          />
        </div>

        <div style={{ marginBottom: "32px" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "10px", 
            fontWeight: 600,
            color: "#1f2937",
            fontSize: "15px"
          }}>投票时长（小时）</label>
          <input
            type="number"
            value={durationHours}
            onChange={(e) => setDurationHours(e.target.value)}
            placeholder="例如：24 / 48 / 72"
            style={{
              width: "100%",
              padding: "14px 18px",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              fontSize: "15px",
              boxSizing: "border-box",
              outline: "none",
              transition: "all 0.2s"
            }}
            onFocus={(e) => e.target.style.borderColor = "#7c3aed"}
            onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
          />
        </div>

        <button
          onClick={handleCreate}
          disabled={loading}
          style={{
            width: "100%",
            padding: "16px",
            backgroundColor: loading ? "#d8b4fe" : "#7c3aed",
            color: "#ffffff",
            border: "none",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            boxShadow: loading ? "none" : "0 4px 12px rgba(124,58,237,0.2)"
          }}
        >
          {loading ? "提交中..." : "✅ 创建提案"}
        </button>
      </div>
    </div>
  );
}