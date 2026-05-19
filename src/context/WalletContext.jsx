import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { connectWallet as connect, getUserPoints, isContractAdmin } from "../utils/web3.js";

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [account, setAccount] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async (addr) => {
    if (!addr) {
      setAccount("");
      setIsAdmin(false);
      setUserPoints(0);
      return;
    }
    setAccount(addr);
    setIsAdmin(await isContractAdmin(addr));
    setUserPoints(Number(await getUserPoints(addr)));
  }, []);

  useEffect(() => {
    async function init() {
      if (!window.ethereum) {
        setReady(true);
        return;
      }
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        await refresh(accounts[0] || "");
      } catch (e) {
        console.error(e);
      } finally {
        setReady(true);
      }
    }
    init();

    if (!window.ethereum) return undefined;
    const onAccounts = (accs) => refresh(accs[0] || "");
    window.ethereum.on("accountsChanged", onAccounts);
    return () => window.ethereum.removeListener("accountsChanged", onAccounts);
  }, [refresh]);

  async function connectWallet() {
    const addr = await connect();
    await refresh(addr);
    return addr;
  }

  return (
    <WalletContext.Provider
      value={{
        account,
        isAdmin,
        userPoints,
        ready,
        connectWallet,
        refreshAccount: () => refresh(account),
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet 须在 WalletProvider 内使用");
  return ctx;
}
