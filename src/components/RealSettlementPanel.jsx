import { describeOnChainSettlement, getFundingRecommendation, getMarketWinner } from "../utils/probability.js";

export default function RealSettlementPanel({
  yesVotes,
  noVotes,
  userVoteType,
  voteWeight,
  settled,
  settling,
  onSettle,
  requiresPoints,
  useWeight,
}) {
  const funding = getFundingRecommendation(yesVotes, noVotes);

  if (!userVoteType) {
    return (
      <section className="card" style={{ maxWidth: 520, margin: "24px auto 0", textAlign: "center", color: "#64748b" }}>
        投票已结束。您未参与本提案。公示结论：{funding.message}
      </section>
    );
  }

  const winner = getMarketWinner(yesVotes, noVotes);
  const won = userVoteType === winner;
  const preview = describeOnChainSettlement({
    requiresPoints,
    useWeight,
    weight: voteWeight,
    won,
  });

  return (
    <section
      className="card"
      style={{
        maxWidth: 520,
        margin: "24px auto 0",
        borderColor: won ? "#6ee7b7" : "#fecaca",
        background: won ? "#ecfdf5" : "#fef2f2",
      }}
    >
      <h3 style={{ margin: "0 0 12px", fontSize: 16, color: "#0f172a" }}>真实链上结算</h3>
      <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600, color: "#334155" }}>{funding.message}</p>
      <p style={{ margin: "0 0 8px", fontSize: 14, color: "#334155" }}>
        您的方向：<strong>{userVoteType === "yes" ? "同意" : "不同意"}</strong>
        {voteWeight > 1 ? ` · 权重 ${voteWeight}` : ""}
      </p>
      <p style={{ margin: "0 0 16px", fontSize: 14, color: won ? "#047857" : "#b91c1c", fontWeight: 600 }}>
        {won ? "与公示结论一致" : "与公示结论不一致"} — {preview.message}
      </p>

      {settled ? (
        <p style={{ margin: 0, color: "#047857", fontWeight: 600 }}>✅ 已完成链上结算</p>
      ) : (
        <button type="button" className="btn-primary" onClick={onSettle} disabled={settling} style={{ width: "100%" }}>
          {settling ? "结算中…" : "执行链上结算"}
        </button>
      )}
    </section>
  );
}
