import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "./context/WalletContext.jsx";
import Layout from "./components/Layout.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import Landing from "./pages/Landing.jsx";
import ProposalsList from "./pages/ProposalsList.jsx";
import ProposalDetail from "./pages/ProposalDetail.jsx";
import CreateProposal from "./pages/CreateProposal.jsx";
import MintPoints from "./pages/MintPoints.jsx";

function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/proposals" element={<ProposalsList />} />
            <Route path="/proposal/:id" element={<ProposalDetail />} />
            <Route
              path="/create"
              element={
                <AdminRoute>
                  <CreateProposal />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/mint"
              element={
                <AdminRoute>
                  <MintPoints />
                </AdminRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </WalletProvider>
  );
}

export default App;
