import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProposal } from "../utils/web3.js";
import {
  DURATION_UNITS,
  formatDurationSeconds,
  getDurationInputHints,
  previewContractSeconds,
  toContractSeconds,
} from "../utils/duration.js";

export default function CreateProposal() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationValue, setDurationValue] = useState("24");
  const [durationUnit, setDurationUnit] = useState("hours");
  const [requiresPoints, setRequiresPoints] = useState(false);
  const [useWeight, setUseWeight] = useState(false);
  const [realSettlement, setRealSettlement] = useState(false);
  const [loading, setLoading] = useState(false);

  const hints = getDurationInputHints(durationUnit);
  const previewSeconds = previewContractSeconds(durationValue, durationUnit);

  const handleCreate = async () => {
    if (!title || !durationValue) {
      alert("请填写所有必填字段！");
      return;
    }

    let secondsOnChain;
    try {
      secondsOnChain = toContractSeconds(durationValue, durationUnit);
    } catch (err) {
      alert(err.message);
      return;
    }

    try {
      setLoading(true);
      alert("请在 MetaMask 中确认交易签名");
      await createProposal(title, description.trim(), secondsOnChain, requiresPoints, useWeight, realSettlement);
      alert("✅ 提案创建成功！");
      navigate("/proposals");
    } catch (err) {
      console.error(err);
      if (err.message?.includes("用户取消")) alert("您已取消交易");
      else if (err.message?.includes("Not admin")) alert("只有管理员才能创建提案");
      else alert("❌ 创建失败：" + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="page-title">创建链上提案</h1>
      <p className="page-subtitle">管理员可配置投票模式与结算方式</p>

      <div className="card" style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#0f172a" }}>提案标题</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="输入提案标题"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#0f172a" }}>提案描述</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="输入提案详细说明（选填，最多 1000 字）"
            rows={4}
            maxLength={1000}
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#0f172a" }}>投票时长</label>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              type="number"
              value={durationValue}
              onChange={(e) => setDurationValue(e.target.value)}
              placeholder={hints.placeholder}
              min={hints.min}
              max={hints.max}
              step={hints.step}
              style={{ ...inputStyle, flex: 1 }}
            />
            <select
              value={durationUnit}
              onChange={(e) => setDurationUnit(e.target.value)}
              style={{
                padding: "14px 12px",
                borderRadius: 8,
                border: "1px solid #cbd5e1",
                fontSize: 16,
                fontWeight: 500,
                backgroundColor: "#f8fafc",
                color: "#0f172a",
                colorScheme: "light",
                minWidth: 96,
              }}
            >
              {DURATION_UNITS.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
          <p style={{ color: "#64748b", fontSize: 13, margin: "8px 0 0" }}>
            {previewSeconds != null
              ? `链上时长：${formatDurationSeconds(previewSeconds)}（${previewSeconds} 秒）`
              : "请填写有效时长（1 秒～30 天）"}
          </p>
        </div>

        <Option
          checked={requiresPoints}
          onChange={setRequiresPoints}
          title="需要积分投票（质押）"
          desc="投票时按权重扣除积分作为质押；真实结算时胜方返还+奖励，败方额外罚分。"
        />
        <Option
          checked={useWeight}
          onChange={setUseWeight}
          title="按权重计票"
          desc="启用后用户可指定 1～1000 的票权权重；不启用则固定为一人一票（权重=1）。"
        />
        <Option
          checked={realSettlement}
          onChange={setRealSettlement}
          title="真实链上结算"
          desc="结束后用户点击「链上结算」修改 userPoints；不勾选则仅前端模拟结算，不改链上积分。"
        />

        <button type="button" className="btn-primary" style={{ width: "100%", marginTop: 8 }} onClick={handleCreate} disabled={loading}>
          {loading ? "提交中…" : "创建提案"}
        </button>
      </div>
    </>
  );
}

function Option({ checked, onChange, title, desc }) {
  return (
    <div
      style={{
        marginBottom: 16,
        padding: 14,
        background: "#f8fafc",
        borderRadius: 10,
        border: "1px solid #e2e8f0",
      }}
    >
      <label style={{ display: "flex", alignItems: "flex-start", gap: 12, fontWeight: 600, color: "#0f172a", cursor: "pointer" }}>
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ width: 18, height: 18, marginTop: 2 }} />
        {title}
      </label>
      <p style={{ color: "#64748b", fontSize: 13, margin: "8px 0 0 30px", lineHeight: 1.5 }}>{desc}</p>
    </div>
  );
}

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
