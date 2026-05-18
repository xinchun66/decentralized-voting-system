import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import ProposalDetail from "./pages/ProposalDetail";
import CreateProposal from "./pages/CreateProposal";

function App(){

return(
<BrowserRouter>

<Routes>

<Route
 path="/"
 element={<Home/>}
/>

<Route
 path="/proposal/:id"
 element={<ProposalDetail/>}
/>

<Route
 path="/create"
 element={<CreateProposal/>}
/>

</Routes>

</BrowserRouter>
)

}

export default App