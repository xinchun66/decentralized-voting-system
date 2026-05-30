const MAX_SECONDS = 30 * 24 * 3600; // 30 天

export const DURATION_UNITS = [
  { value: "seconds", label: "秒" },
  { value: "minutes", label: "分钟" },
  { value: "hours", label: "小时" },
  { value: "days", label: "天" },
];

/** 用户输入 → 合约 durationSeconds */
export function toContractSeconds(value, unit) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error("请输入有效的投票时长");
  }

  let seconds;
  switch (unit) {
    case "seconds":
      seconds = Math.ceil(n);
      break;
    case "minutes":
      seconds = Math.ceil(n * 60);
      break;
    case "hours":
      seconds = Math.ceil(n * 3600);
      break;
    case "days":
      seconds = Math.ceil(n * 86400);
      break;
    default:
      throw new Error("未知的时间单位");
  }

  if (seconds < 1 || seconds > MAX_SECONDS) {
    throw new Error("投票时长须在 1 秒 至 30 天 之间");
  }
  return seconds;
}

export function getDurationInputHints(unit) {
  switch (unit) {
    case "seconds":
      return { min: 1, max: MAX_SECONDS, placeholder: "例如：60 / 300 / 3600", step: 1 };
    case "minutes":
      return { min: 1, max: 43200, placeholder: "例如：5 / 30 / 1440", step: 1 };
    case "hours":
      return { min: 1, max: 720, placeholder: "例如：1 / 24 / 72", step: 1 };
    case "days":
      return { min: 1, max: 30, placeholder: "例如：1 / 7 / 30", step: 1 };
    default:
      return { min: 1, max: MAX_SECONDS, placeholder: "", step: 1 };
  }
}

/** 秒数 → 可读文案（用于创建页预览） */
export function formatDurationSeconds(totalSeconds) {
  if (totalSeconds == null || !Number.isFinite(totalSeconds)) return null;

  const s = Math.floor(totalSeconds);
  const parts = [];
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;

  if (days > 0) parts.push(`${days} 天`);
  if (hours > 0) parts.push(`${hours} 小时`);
  if (minutes > 0) parts.push(`${minutes} 分钟`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds} 秒`);

  return parts.join(" ");
}

export function previewContractSeconds(value, unit) {
  try {
    return toContractSeconds(value, unit);
  } catch {
    return null;
  }
}
