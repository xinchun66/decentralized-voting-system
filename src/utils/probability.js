/** 同意 / 不同意 通过率（按票权加权） */
export function calcProbability(yes, no) {
  const y = Number(yes) || 0;
  const n = Number(no) || 0;
  const total = y + n;
  if (total === 0) {
    return { yesRate: "0.00", noRate: "0.00", yesNum: 0, noNum: 0 };
  }
  const yesRate = ((y / total) * 100).toFixed(2);
  const noRate = ((n / total) * 100).toFixed(2);
  return {
    yesRate,
    noRate,
    yesNum: parseFloat(yesRate),
    noNum: parseFloat(noRate),
  };
}

/** 判定胜出方（同意票权 ≥ 不同意则倾向通过） */
export function getMarketWinner(yes, no) {
  const y = Number(yes) || 0;
  const n = Number(no) || 0;
  if (y >= n) return "yes";
  return "no";
}

/** 两边票权差距小于该百分点视为「存在争议」 */
export const CONTEST_GAP_PERCENT = 10;

/**
 * 经费申请倾向 / 模拟结算建议文案
 * @returns {{ type: 'pass'|'reject'|'contested', message: string, recommendPass: boolean }}
 */
export function getFundingRecommendation(yes, no) {
  const y = Number(yes) || 0;
  const n = Number(no) || 0;
  const total = y + n;

  if (total === 0) {
    return {
      type: "contested",
      message: "暂无投票数据，请待更多同学参与后再判断",
      recommendPass: false,
    };
  }

  const { yesNum, noNum } = calcProbability(yes, no);
  const gap = Math.abs(yesNum - noNum);

  if (gap < CONTEST_GAP_PERCENT) {
    return {
      type: "contested",
      message: "当前结果存在争议",
      recommendPass: false,
    };
  }

  if (y > n) {
    return {
      type: "pass",
      message: "该经费申请倾向通过",
      recommendPass: true,
    };
  }

  return {
    type: "reject",
    message: "该经费申请暂不建议通过",
    recommendPass: false,
  };
}

/**
 * 模拟积分结算（前端演示，不上链）
 */
export function simulateSettlement(yes, no, userBetSide, opts = {}) {
  const { requiresPoints = false, useWeight = false, stake = 1 } = opts;
  const weight = Math.max(1, Number(stake) || 1);
  const winner = getMarketWinner(yes, no);
  const side = userBetSide === "yes" ? "yes" : "no";
  const funding = getFundingRecommendation(yes, no);
  const win = side === winner;

  if (win) {
    let delta;
    let msg;
    if (requiresPoints) {
      delta = weight * 2;
      msg = `预测与公示结论一致，模拟返还质押并奖励，净增约 +${weight} 积分`;
    } else {
      delta = weight;
      msg = `预测与公示结论一致，模拟奖励 +${weight} 积分`;
    }
    return {
      result: "win",
      winner,
      delta,
      message: `${funding.message}。${msg}`,
      funding,
    };
  }

  let delta;
  let msg;
  if (requiresPoints) {
    delta = -weight * 2;
    msg = `预测与公示结论不一致，模拟额外扣除 ${weight} 积分（投票时已扣质押 ${weight}）`;
  } else if (useWeight) {
    delta = -weight;
    msg = `预测与公示结论不一致，模拟扣除 ${weight} 积分（按权重罚分）`;
  } else {
    delta = -1;
    msg = "预测与公示结论不一致，模拟扣除 1 积分";
  }
  return {
    result: "lose",
    winner,
    delta,
    message: `${funding.message}。${msg}`,
    funding,
  };
}

/** 链上真实结算预期说明（与合约 settle 逻辑一致） */
export function describeOnChainSettlement({ requiresPoints, useWeight, weight, won }) {
  const w = Math.max(1, Number(weight) || 1);
  if (won) {
    if (requiresPoints) {
      return { delta: w * 2, message: `链上将增加 ${w * 2} 积分（返还质押 ${w} + 奖励 ${w}）` };
    }
    return { delta: w, message: `链上将奖励 +${w} 积分` };
  }
  if (requiresPoints) {
    return { delta: -w, message: `链上将再扣除 ${w} 积分（投票时已扣质押 ${w}）` };
  }
  if (useWeight) {
    return { delta: -w, message: `链上将扣除 ${w} 积分` };
  }
  return { delta: -1, message: "链上将扣除 1 积分" };
}
