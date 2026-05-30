import { Navigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext.jsx";

/** 仅链上管理员可访问；未连接或非管理员视为普通用户，跳转提案列表 */
export default function AdminRoute({ children }) {
  const { account, isAdmin, ready } = useWallet();

  if (!ready) {
    return <p style={{ textAlign: "center", color: "#64748b", padding: 40 }}>加载中…</p>;
  }

  if (!account || !isAdmin) {
    return <Navigate to="/proposals" replace />;
  }

  return children;
}
