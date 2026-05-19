import { NavLink, Outlet } from "react-router-dom";
import { useWallet } from "../context/WalletContext.jsx";
import "../styles/voting.css";

export default function Layout() {
  const { account, isAdmin } = useWallet();

  return (
    <div className="app-shell">
      <nav className="app-nav">
        <NavLink to="/" className="app-nav-brand">
          去中心化投票治理
        </NavLink>
        <div className="app-nav-links">
          <NavLink to="/" end>
            首页
          </NavLink>
          <NavLink to="/proposals">提案列表</NavLink>
          {account && isAdmin && (
            <>
              <NavLink to="/create">创建提案</NavLink>
              <NavLink to="/admin/mint">发放积分</NavLink>
            </>
          )}
        </div>
      </nav>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
