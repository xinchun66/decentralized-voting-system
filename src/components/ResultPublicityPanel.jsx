import { calcProbability, getFundingRecommendation } from "../utils/probability.js";
import { getDisplayStatus, STATUS_LABELS } from "../utils/proposalModes.js";

export default function ResultPublicityPanel({ yesVotes, noVotes, chainStatus, endTime }) {
  const yes = Number(yesVotes) || 0;
  const no = Number(noVotes) || 0;
  const { yesRate } = calcProbability(yes, no);
  const funding = getFundingRecommendation(yes, no);
  const displayStatus = getDisplayStatus(chainStatus, endTime);
  const statusText = STATUS_LABELS[displayStatus] ?? "未知";

  const recommendText = funding.recommendPass ? "建议通过" : funding.type === "contested" ? "暂不建议（存在争议）" : "暂不建议通过";

  const recommendColor =
    funding.type === "pass" ? "#047857" : funding.type === "contested" ? "#b45309" : "#b91c1c";

  return (
    <section
      className="card"
      style={{
        maxWidth: 560,
        margin: "0 auto 24px",
        border: "1px solid #c4b5fd",
        background: "linear-gradient(180deg, #faf5ff 0%, #ffffff 100%)",
      }}
    >
      <h3 style={{ margin: "0 0 4px", fontSize: 17, color: "#5b21b6", textAlign: "center" }}>
        结果公示
      </h3>
      <p style={{ margin: "0 0 18px", fontSize: 12, color: "#64748b", textAlign: "center" }}>
        基于积分权重的学生事务预测与投票结果可视化
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <StatItem label="当前同意票数" value={`${yes} 票权`} />
        <StatItem label="当前不同意票数" value={`${no} 票权`} />
        <StatItem label="经费申请通过率" value={`${yesRate}%`} highlight />
        <StatItem label="当前投票状态" value={statusText} />
      </div>

      <div
        style={{
          padding: "14px 16px",
          borderRadius: 10,
          background: "#fff",
          border: `1px solid ${funding.type === "pass" ? "#6ee7b7" : funding.type === "contested" ? "#fcd34d" : "#fecaca"}`,
        }}
      >
        <p style={{ margin: "0 0 6px", fontSize: 13, color: "#64748b" }}>是否建议通过</p>
        <p style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: recommendColor }}>
          {recommendText}
        </p>
        <p style={{ margin: 0, fontSize: 14, color: "#334155", lineHeight: 1.5 }}>{funding.message}</p>
      </div>
    </section>
  );
}

function StatItem({ label, value, highlight }) {
  return (
    <div
      style={{
        padding: "12px",
        background: "#fff",
        borderRadius: 8,
        border: "1px solid #e2e8f0",
        textAlign: "center",
      }}
    >
      <p style={{ margin: "0 0 4px", fontSize: 12, color: "#64748b" }}>{label}</p>
      <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: highlight ? "#5b21b6" : "#0f172a" }}>{value}</p>
    </div>
  );
}
