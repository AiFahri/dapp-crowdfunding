import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { formatDate, shortenAddress } from "../../utils/helpers";
import { useContext } from "react";
import { Web3Context } from "../../contexts/Web3Context";
import "../../index.css";
import ETHlogo from "../../assets/ETH.svg";
import WithdrawLogo from "../../assets/withdraw.svg";
import ApproveLogo from "../../assets/approve.svg";

const CampaignCard = ({ campaign, onDonate, onAccept, onWithdraw }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hasBalance, setHasBalance] = useState(true);
  const { account, provider } = useContext(Web3Context);

  const { address, title, description, target, donated, neededTokens, totalApproved, deadline, owner, isActive, canWithdraw, userDonation } = campaign;

  const deadlineDate = new Date(deadline * 1000);
  const isExpired = deadlineDate < new Date();
  const isOwner = owner.toLowerCase() === account?.toLowerCase();
  const isFunded = Number(donated) >= Number(target);
  const isWithdrawn = !canWithdraw && isOwner && (isFunded || isExpired);

  useEffect(() => {
    const checkBalance = async () => {
      if (provider && address) {
        try {
          const balance = await provider.getBalance(address);
          setHasBalance(balance > 0);
        } catch (error) {
          console.error("Failed to check balance:", error);
          setHasBalance(false);
        }
      }
    };

    checkBalance();
  }, [provider, address]);

  return (
    <div className="campaign-card-wrapper">
      <div className="campaign-card" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        <div className="card-content">
          <div className="mb-3">
            <h3 className="text-sm text-gray-600">Smart Contract {shortenAddress(address)}</h3>
            <h2 className="text-lg font-medium">{title || "Smart Contract Keren"}</h2>
          </div>

          <p className="text-gray-700 mb-6 text-sm line-clamp-3">
            {description || "Lorem ipsum lorem enim nisl tincidunt aliquet vitae et neque tristique in massa tortor bibendum."}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center mb-1">
                <img src={ETHlogo} alt="ETH" className="icon" />
                <span className="text-sm text-gray-600">{isActive ? "Target" : "Need"}</span>
              </div>
              <div className="text-lg font-medium">{isActive ? `${ethers.formatEther(target)} ETH` : `${neededTokens} ETH`}</div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center mb-1">
                <img src={ETHlogo} alt="ETH" className="icon" />
                <span className="text-sm text-gray-600">{isActive ? "Donated" : "Approved"}</span>
              </div>
              <div className="text-lg font-medium">{isActive ? `${ethers.formatEther(donated)} ETH` : `${totalApproved} ETH`}</div>
            </div>
          </div>

          <div className="space-y-4 mt-auto border rounded-md p-3">
            <div className="info-row">
              <span className="info-label">Deadline</span>
              <span className="info-value">{formatDate(deadline)}</span>
            </div>

            <div className="info-row">
              <span className="info-label">Owner</span>
              <span className="info-value">{shortenAddress(owner)}</span>
            </div>

            {userDonation && Number(userDonation) > 0 ? (
              <div className="info-row">
                <span className="info-label">You donate</span>
                <span className="info-value font-medium">{ethers.formatEther(userDonation)} ETH</span>
              </div>
            ) : null}

            {isWithdrawn && <div className="mt-2 text-sm text-green-600 font-medium">Funds have been withdrawn</div>}
          </div>
        </div>

        <div className={`button-container ${isHovered ? "visible" : ""}`}>
          {isOwner && canWithdraw && hasBalance ? (
            <button onClick={() => onWithdraw(address)} className="action-button primary">
              <img src={WithdrawLogo} alt="Withdraw" className="icon" />
              Withdraw
            </button>
          ) : isOwner && isWithdrawn ? (
            <button className="action-button disabled" disabled>
              <img src={WithdrawLogo} alt="Withdrawn" className="icon" />
              Withdrawn
            </button>
          ) : isOwner && canWithdraw && !hasBalance ? (
            <button className="action-button disabled" disabled>
              <img src={WithdrawLogo} alt="No Balance" className="icon" />
              No Balance
            </button>
          ) : isActive ? (
            !isFunded && !isExpired ? (
              <button onClick={() => onDonate(address)} className="action-button primary">
                <img src={WithdrawLogo} alt="Donate" className="icon" />
                Donate
              </button>
            ) : (
              <button className="action-button disabled" disabled>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="icon">
                  <path d="M10.464 8.746c.227-.18.497-.311.786-.394v2.795a2.252 2.252 0 01-.786-.393c-.394-.313-.546-.681-.546-1.004 0-.323.152-.691.546-1.004z" />
                  <path d="M12.75 15.662v-2.824c.596.347 1.198.689 1.716 1.078.145.109.277.225.394.352.225.243.461.582.461 1.003 0 .42-.236.76-.461 1.003-.117.127-.25.243-.394.352-.518.388-1.12.73-1.716 1.078z" />
                  <path
                    fillRule="evenodd"
                    d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v.816a3.836 3.836 0 00-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.685 1.719.81v.433c-.55.066-1.066.207-1.494.418a.75.75 0 00.692 1.327c.712-.352 1.69-.526 2.677-.526.987 0 1.964.174 2.677.526a.75.75 0 00.692-1.327c-.428-.211-.944-.352-1.493-.418v-.434c.616-.124 1.216-.41 1.719-.809.712-.566 1.112-1.35 1.112-2.178 0-.829-.4-1.612-1.113-2.178A3.836 3.836 0 0012.75 6.816V6z"
                    clipRule="evenodd"
                  />
                </svg>
                Donate
              </button>
            )
          ) : (
            <button onClick={() => onAccept(campaign)} className="action-button primary">
              <img src={ApproveLogo} alt="Approve" className="icon" />
              Approve
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;



