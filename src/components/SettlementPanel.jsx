import { calcProbability, getFundingRecommendation, simulateSettlement } from "../utils/probability.js";

export default function SettlementPanel({
  yesVotes,
  noVotes,
  userVoteType,
  voteWeight = 1,
  requiresPoints = false,
  useWeight = false,
}) {
  if (!userVoteType) {
    return (
      <section
        className="card"
        style={{ maxWidth: 520, margin: "24px auto 0", textAlign: "center", color: "#64748b", fontSize: 14 }}
      >
        投票已结束。您未参与本提案，可查看上方结果公示了解经费申请倾向。
      </section>
    );
  }

  const funding = getFundingRecommendation(yesVotes, noVotes);
  const settlement = simulateSettlement(yesVotes, noVotes, userVoteType, {
    requiresPoints,
    useWeight,
    stake: voteWeight,
  });
  const { yesRate, noRate } = calcProbability(yesVotes, noVotes);
  const win = settlement.result === "win";

  const fundingBg =
    funding.type === "pass" ? "#ecfdf5" : funding.type === "contested" ? "#fffbeb" : "#fef2f2";
  const fundingBorder =
    funding.type === "pass" ? "#6ee7b7" : funding.type === "contested" ? "#fcd34d" : "#fecaca";

  return (
    <section className="card" style={{ maxWidth: 520, margin: "24px auto 0" }}>
      <h3 style={{ margin: "0 0 12px", fontSize: 16, color: "#0f172a" }}>模拟结算</h3>

      <div
        style={{
          padding: "12px 14px",
          marginBottom: 14,
          borderRadius: 10,
          background: fundingBg,
          border: `1px solid ${fundingBorder}`,
        }}
      >
        <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#0f172a" }}>{funding.message}</p>
      </div>

      <p style={{ margin: "0 0 8px", fontSize: 14, color: "#334155" }}>
        最终通过率：同意 {yesRate}% / 不同意 {noRate}%
      </p>
      <p style={{ margin: "0 0 8px", fontSize: 14, color: "#334155" }}>
        您的选择：<strong>{userVoteType === "yes" ? "同意" : "不同意"}</strong>
        {voteWeight > 1 ? ` · 权重 ${voteWeight}` : ""}
      </p>
      <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: win ? "#047857" : "#b91c1c" }}>
        {settlement.message}
      </p>
      <p style={{ margin: "10px 0 0", fontSize: 12, color: "#64748b" }}>
        * 此为前端模拟，不会修改链上 userPoints；真实奖惩请使用「真实链上结算」提案
      </p>
    </section>
  );
}
