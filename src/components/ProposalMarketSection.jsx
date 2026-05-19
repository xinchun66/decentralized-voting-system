import MarketProbability from "./MarketProbability.jsx";
import VotePieChart from "./VotePieChart.jsx";
import SettlementPanel from "./SettlementPanel.jsx";
import RealSettlementPanel from "./RealSettlementPanel.jsx";
import { calcProbability } from "../utils/probability.js";

export default function ProposalMarketSection({
  yesVotes,
  noVotes,
  expired,
  userVoteType,
  voteWeight = 1,
  requiresPoints = false,
  useWeight = false,
  realSettlement = false,
  voteSettled = false,
  settling = false,
  onSettle,
}) {
  const yes = Number(yesVotes) || 0;
  const no = Number(noVotes) || 0;
  const total = yes + no;
  const rates = calcProbability(yes, no);

  return (
    <>
      <MarketProbability yesVotes={yes} noVotes={no} />

      <section
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 24,
          justifyContent: "center",
          alignItems: "flex-start",
          marginBottom: 30,
        }}
      >
        <VotePieChart yesVotes={yes} noVotes={no} />

        <section
          className="card"
          style={{ minWidth: 280, maxWidth: 360, flex: "1 1 280px", margin: 0 }}
        >
          <h3 style={{ textAlign: "center", fontSize: 16, margin: "0 0 20px", color: "#0f172a" }}>
            票权与柱状分布
          </h3>

          <section style={{ marginBottom: 15 }}>
            <header style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ color: "#16a34a", fontWeight: 600 }}>YES（支持）</span>
              <span style={{ color: "#334155" }}>
                {yes} 权 · {rates.yesRate}%
              </span>
            </header>
            <section style={{ height: 12, background: "#e2e8f0", borderRadius: 6, overflow: "hidden" }}>
              <section
                style={{
                  height: "100%",
                  width: `${rates.yesNum}%`,
                  background: "#22c55e",
                  transition: "width 0.4s ease",
                }}
              />
            </section>
          </section>

          <section style={{ marginBottom: 15 }}>
            <header style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ color: "#dc2626", fontWeight: 600 }}>NO（反对）</span>
              <span style={{ color: "#334155" }}>
                {no} 权 · {rates.noRate}%
              </span>
            </header>
            <section style={{ height: 12, background: "#e2e8f0", borderRadius: 6, overflow: "hidden" }}>
              <section
                style={{
                  height: "100%",
                  width: `${rates.noNum}%`,
                  background: "#ef4444",
                  transition: "width 0.4s ease",
                }}
              />
            </section>
          </section>

          <footer
            style={{
              display: "flex",
              justifyContent: "space-between",
              borderTop: "1px solid #e2e8f0",
              paddingTop: 15,
              fontSize: 14,
              color: "#475569",
            }}
          >
            <span>总票权</span>
            <span style={{ fontWeight: "bold", color: "#0f172a" }}>{total}</span>
          </footer>
        </section>
      </section>

      {expired &&
        (realSettlement ? (
          <RealSettlementPanel
            yesVotes={yes}
            noVotes={no}
            userVoteType={userVoteType}
            voteWeight={voteWeight}
            settled={voteSettled}
            settling={settling}
            onSettle={onSettle}
            requiresPoints={requiresPoints}
            useWeight={useWeight}
          />
        ) : (
          <SettlementPanel
            yesVotes={yes}
            noVotes={no}
            userVoteType={userVoteType}
            voteWeight={voteWeight}
            requiresPoints={requiresPoints}
            useWeight={useWeight}
          />
        ))}
    </>
  );
}
