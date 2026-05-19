import { calcProbability, getMarketWinner, simulateSettlement } from "../utils/probability.js";

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
        投票已结束。您未参与本提案，无模拟结算结果。
      </section>
    );
  }

  const winner = getMarketWinner(yesVotes, noVotes);
  const settlement = simulateSettlement(yesVotes, noVotes, userVoteType, {
    requiresPoints,
    useWeight,
    stake: voteWeight,
  });
  const { yesRate, noRate } = calcProbability(yesVotes, noVotes);
  const win = settlement.result === "win";

  return (
    <section
      className="card"
      style={{
        maxWidth: 520,
        margin: "24px auto 0",
        borderColor: win ? "#6ee7b7" : "#fecaca",
        background: win ? "#f0fdf4" : "#fff1f2",
      }}
    >
      <h3 style={{ margin: "0 0 12px", fontSize: 16, color: "#0f172a" }}>模拟结算（预测市场）</h3>
      <p style={{ margin: "0 0 8px", fontSize: 14, color: "#334155" }}>
        最终市场概率：YES {yesRate}% / NO {noRate}%
      </p>
      <p style={{ margin: "0 0 8px", fontSize: 14, color: "#334155" }}>
        市场结果：<strong>{winner === "yes" ? "YES 胜出" : "NO 胜出"}</strong>
      </p>
      <p style={{ margin: "0 0 8px", fontSize: 14, color: "#334155" }}>
        您的预测：<strong>{userVoteType === "yes" ? "YES" : "NO"}</strong>
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
