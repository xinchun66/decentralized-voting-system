import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function VotePieChart({ yesVotes, noVotes }) {
  const yes = Number(yesVotes) || 0;
  const no = Number(noVotes) || 0;
  const empty = yes + no === 0;

  const data = {
    labels: ["YES", "NO"],
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
            return `${ctx.label}: ${v} 票 (${pct}%)`;
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
      <h3 style={{ textAlign: "center", fontSize: "16px", margin: "0 0 16px 0" }}>
        投票分布（饼图）
      </h3>
      <section style={{ maxWidth: "260px", margin: "0 auto" }}>
        <Pie data={data} options={options} />
      </section>
      {empty && (
        <p style={{ textAlign: "center", fontSize: "12px", color: "#888", margin: "12px 0 0 0" }}>
          暂无投票，饼图为示意 50/50
        </p>
      )}
    </section>
  );
}
