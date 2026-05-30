export function getProposalModeBadges(p) {
  const badges = [];
  badges.push({
    label: p.requiresPoints ? "积分投票" : "免费投票",
    bg: p.requiresPoints ? "#fef3c7" : "#d1fae5",
    color: p.requiresPoints ? "#92400e" : "#065f46",
  });
  badges.push({
    label: p.useWeight ? "按权重计票" : "一人一票",
    bg: p.useWeight ? "#ede9fe" : "#e0e7ff",
    color: p.useWeight ? "#5b21b6" : "#3730a3",
  });
  badges.push({
    label: p.realSettlement ? "真实链上结算" : "模拟结算",
    bg: p.realSettlement ? "#fce7f3" : "#f3f4f6",
    color: p.realSettlement ? "#9d174d" : "#4b5563",
  });
  return badges;
}

export const STATUS_LABELS = {
  0: "未开始",
  1: "进行中",
  2: "已结束",
  3: "已关闭",
};

/** 结合链上 status 与截止时间，得到界面展示用状态（链上 ACTIVE 到期后仍可能为 1） */
export function getDisplayStatus(status, endTime) {
  const s = Number(status);
  if (s === 3) return 3;
  const endMs = Number(endTime) * 1000;
  if (endMs > 0 && Date.now() >= endMs) return 2;
  return s;
}

export function getStatusBadgeStyle(displayStatus) {
  switch (displayStatus) {
    case 1:
      return { background: "#dbeafe", color: "#1d4ed8" };
    case 2:
      return { background: "#f1f5f9", color: "#64748b" };
    case 3:
      return { background: "#fee2e2", color: "#991b1b" };
    default:
      return { background: "#f1f5f9", color: "#64748b" };
  }
}
