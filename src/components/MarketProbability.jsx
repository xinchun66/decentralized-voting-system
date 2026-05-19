import { calcProbability } from "../utils/probability.js";

export default function MarketProbability({ yesVotes, noVotes }) {
  const { yesRate, noRate } = calcProbability(yesVotes, noVotes);

  return (
    <section
      style={{
        background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
        borderRadius: "16px",
        padding: "24px 28px",
        color: "#fff",
        maxWidth: "520px",
        margin: "0 auto 24px auto",
        boxShadow: "0 8px 24px rgba(49, 46, 129, 0.35)",
      }}
    >
      <p
        style={{
          margin: "0 0 16px 0",
          fontSize: "13px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          opacity: 0.85,
          textAlign: "center",
        }}
      >
        市场概率（Polymarket 风格）
      </p>
      <section style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
        <section
          style={{
            flex: 1,
            textAlign: "center",
            padding: "16px",
            background: "rgba(34, 197, 94, 0.2)",
            borderRadius: "12px",
            border: "1px solid rgba(34, 197, 94, 0.5)",
          }}
        >
          <p style={{ fontSize: "12px", opacity: 0.9, margin: "0 0 6px 0" }}>YES</p>
          <p style={{ fontSize: "32px", fontWeight: 700, color: "#4ade80", margin: 0 }}>{yesRate}%</p>
        </section>
        <section
          style={{
            flex: 1,
            textAlign: "center",
            padding: "16px",
            background: "rgba(239, 68, 68, 0.2)",
            borderRadius: "12px",
            border: "1px solid rgba(239, 68, 68, 0.5)",
          }}
        >
          <p style={{ fontSize: "12px", opacity: 0.9, margin: "0 0 6px 0" }}>NO</p>
          <p style={{ fontSize: "32px", fontWeight: 700, color: "#f87171", margin: 0 }}>{noRate}%</p>
        </section>
      </section>
      <p style={{ margin: "14px 0 0 0", fontSize: "12px", textAlign: "center", opacity: 0.75 }}>
        概率 = 该选项票数 / 总票数 x 100%
      </p>
    </section>
  );
}
