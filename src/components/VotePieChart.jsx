import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { calcProbability } from "../utils/probability.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function VotePieChart({ yesVotes, noVotes }) {
  const yes = Number(yesVotes) || 0;
  const no = Number(noVotes) || 0;
  const empty = yes + no === 0;
  const { yesRate, noRate } = calcProbability(yes, no);

  const data = {
    labels: ["同意", "不同意"],
    datasets: [
      {
        data: empty ? [1, 1] : [yes, no],
        backgroundColor: ["#22c55e", "#ef4444"],
        borderColor: ["#fff", "#fff"],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: { padding: 16, font: { size: 13 } },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            if (empty) return `${ctx.label}: 暂无投票`;
            const total = yes + no;
            const v = ctx.raw;
            const pct = ((v / total) * 100).toFixed(2);
            return `${ctx.label}: ${v} 票权 (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <section
      style={{
        background: "#fff",
        borderRadius: "12px",
        padding: "24px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        maxWidth: "320px",
        margin: "0 auto",
      }}
    >
      <h3 style={{ textAlign: "center", fontSize: 16, margin: "0 0 16px 0", color: "#0f172a" }}>
        投票分布（饼图）
      </h3>
      <section style={{ maxWidth: "260px", margin: "0 auto" }}>
        <Pie data={data} options={options} />
      </section>
      {empty ? (
        <p style={{ textAlign: "center", fontSize: 12, color: "#888", margin: "12px 0 0" }}>
          暂无投票，饼图为示意
        </p>
      ) : (
        <p style={{ textAlign: "center", fontSize: 12, color: "#64748b", margin: "12px 0 0" }}>
          同意 {yesRate}% · 不同意 {noRate}%
        </p>
      )}
    </section>
  );
}
