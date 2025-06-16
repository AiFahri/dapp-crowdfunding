import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Web3Provider } from "./contexts/Web3Context";
import Navbar from "./components/Layout/Navbar";
import Footer from "./components/Layout/Footer";
import AllCampaigns from "./pages/AllCampaigns";
import History from "./pages/History";

function App() {
  return (
    <Web3Provider>
      <Router>
        <div className="flex flex-col min-h-screen ">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<AllCampaigns />} />
              <Route path="/history" element={<History />} />
            </Routes>
          </main>
          {/* <Footer /> */}
        </div>
      </Router>
    </Web3Provider>
  );
}

export default App;
