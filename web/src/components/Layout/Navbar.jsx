import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { Web3Context } from "../../contexts/Web3Context";
import { shortenAddress } from "../../utils/helpers";
import logo from "../../../public/Logo.svg";
import coins from "../../assets/coins.svg";
import wallet from "../../assets/wallet.svg";

const Navbar = () => {
  const { account, isConnected, connectWallet, donationToken } = useContext(Web3Context);
  const location = useLocation();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center mr-2">
                <img src={logo} alt="Logo" className="w-8 h-8" />
              </div>
              <span className="font-bold text-black text-lg">
                Fund<span className="text-primary">raiser</span>
              </span>
            </Link>

            <nav className="flex space-x-6">
              <Link to="/" className={`${location.pathname === "/" ? "text-black border-b-2 border-primary font-medium" : "text-gray-600"} py-1`}>
                Campaign
              </Link>
              <Link to="/history" className={`${location.pathname === "/history" ? "text-black border-b-2 border-primary font-medium" : "text-gray-600"} py-1`}>
                History
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {isConnected ? (
              <>
                <div className="flex items-center bg-light-gray rounded-md border px-3 py-1.5">
                  <img src={coins} alt="Coins" className="w-5 h-5 text-yellow-500 mr-2" />
                  <span className="font-medium">{donationToken}</span>
                </div>

                <div className="flex items-center bg-light-gray rounded-md border px-3 py-1.5">
                  <img src={wallet} alt="Wallet" className="w-5 h-5 text-gray-600 mr-2" />
                  <span className="font-medium">{shortenAddress(account)}</span>
                </div>
              </>
            ) : (
              <button onClick={connectWallet} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
