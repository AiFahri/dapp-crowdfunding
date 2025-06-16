import React, { useState, useEffect, useContext } from "react";
import { Web3Context } from "../contexts/Web3Context";
import CampaignCard from "../components/Campaign/CampaignCard";
import CreateCampaignModal from "../components/Campaign/CreateCampaignModal";
import DonateModal from "../components/Campaign/DonateModal";
import AcceptTokenModal from "../components/Campaign/AcceptTokenModal";
import StatusModal from "../components/UI/StatusModal";
import { ethers } from "ethers";
import { campaignABI } from "../utils/contract";

const AllCampaigns = () => {
  const { factory, provider, signer, account, isConnected, showStatusModal } = useContext(Web3Context);
  const [campaigns, setCampaigns] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [campaignToAccept, setCampaignToAccept] = useState(null);

  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  // const showLocalStatusModal = (title, message, type = "success") => {
  //   setStatusModal({
  //     isOpen: true,
  //     title,
  //     message,
  //     type
  //   });
  // };

  const closeStatusModal = () => {
    setStatusModal({
      ...statusModal,
      isOpen: false,
    });
  };

  useEffect(() => {
    if (factory) {
      fetchCampaigns();
    }
  }, [factory, activeTab, account]);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      let campaignAddresses = [];

      if (activeTab === "all") {
        campaignAddresses = await factory.getAllCampaigns();
      } else if (activeTab === "ongoing") {
        campaignAddresses = await factory.getActiveCampaigns();
      } else if (activeTab === "my") {
        campaignAddresses = await factory.getCampaignsByOwner(account);
      } else if (activeTab === "pending") {
        campaignAddresses = await factory.getInactiveCampaigns();
      }

      campaignAddresses = [...campaignAddresses].reverse();

      const campaignData = [];

      for (const address of campaignAddresses) {
        const campaign = new ethers.Contract(address, campaignABI, provider);

        const [title, description, target, donated, totalTokenApproved, deadline, owner, isActive] = await Promise.all([
          campaign.title(),
          campaign.description(),
          campaign.targetAmount(),
          campaign.totalTokenDonated(),
          campaign.totalTokenApproved(),
          campaign.deadline(),
          campaign.owner(),
          campaign.isActive(),
        ]);

        const minTokenApprover = 10;
        const totalApproved = Number(totalTokenApproved);

        const neededTokens = minTokenApprover - totalApproved;

        const canWithdraw = owner.toLowerCase() === account?.toLowerCase() && (Number(donated) >= Number(target) || Number(deadline) < Math.floor(Date.now() / 1000));

        let userDonation = ethers.parseEther("0");
        if (account) {
          try {
            const userDonations = await campaign.getDonors(account);
            if (userDonations && userDonations.length > 0) {
              userDonation = userDonations.reduce((total, amount) => total + BigInt(amount), BigInt(0));
            }
          } catch (error) {
            console.error("Failed to fetch user donations:", error);
          }
        }

        campaignData.push({
          address,
          title,
          description,
          target,
          donated,
          neededTokens,
          totalApproved,
          deadline: Number(deadline),
          owner,
          isActive,
          canWithdraw,
          userDonation,
        });
      }

      setCampaigns(campaignData);
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDonate = (address) => {
    const campaign = campaigns.find((c) => c.address === address);
    setSelectedCampaign(campaign);
    setIsDonateModalOpen(true);
  };

  const handleCreateCampaign = () => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }
    setIsModalOpen(true);
  };

  const handleCampaignCreated = () => {
    fetchCampaigns();
  };

  const handleWithdraw = async (address) => {
    try {
      if (!isConnected) {
        showStatusModal("Error", "Please connect your wallet first", "error");
        return;
      }

      if (!signer) {
        showStatusModal("Error", "Signer not available. Please reconnect your wallet.", "error");
        return;
      }

      const balance = await provider.getBalance(address);
      if (balance <= 0) {
        showStatusModal("Cannot Withdraw", "Campaign has no balance to withdraw.", "error");
        return;
      }

      const campaign = new ethers.Contract(address, campaignABI, signer);

      const withdrawable = await campaign.withdrawable();
      if (!withdrawable) {
        showStatusModal("Cannot Withdraw", "Campaign cannot be withdrawn yet. Target not reached or deadline not passed.", "error");
        return;
      }

      const tx = await campaign.withdraw();
      await tx.wait();

      showStatusModal("Withdrawal Successful", "Funds have been successfully withdrawn to your wallet.", "success");

      fetchCampaigns();
    } catch (error) {
      console.error("Withdraw failed:", error);

      if (error.code === "ACTION_REJECTED") {
        showStatusModal("Transaction Rejected", "You rejected the transaction", "error");
      } else {
        showStatusModal("Withdrawal Failed", error.message || "Unknown error occurred", "error");
      }
    }
  };

  const handleAcceptClick = (campaign) => {
    setCampaignToAccept(campaign);
    setIsAcceptModalOpen(true);
  };

  const handleAcceptSuccess = () => {
    setIsAcceptModalOpen(false);
    fetchCampaigns();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">All Campaign</h1>
        <button onClick={handleCreateCampaign} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center">
          <span className="mr-1">+</span> Create Campaign
        </button>
      </div>

      <div className="mb-8">
        <div className="flex space-x-10 ">
          <button
            className={`pb-2 ${activeTab === "all" ? "bg-light-gray border-b-2 border-primary text-primary" : "bg-light-gray text-gray-500"}`}
            onClick={() => setActiveTab("all")}
          >
            All
          </button>
          <button
            className={`pb-2 ${activeTab === "my" ? "bg-light-gray border-b-2 border-primary text-primary" : "bg-light-gray text-gray-500"}`}
            onClick={() => setActiveTab("my")}
          >
            My Campaigns
          </button>
          <button
            className={`pb-2 ${activeTab === "ongoing" ? "bg-light-gray border-b-2 border-primary text-primary" : "bg-light-gray text-gray-500"}`}
            onClick={() => setActiveTab("ongoing")}
          >
            Ongoing
          </button>
          <button
            className={`pb-2 ${activeTab === "pending" ? "bg-light-gray border-b-2 border-primary text-primary" : "bg-light-gray text-gray-500"}`}
            onClick={() => setActiveTab("pending")}
          >
            Pending Approval
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Loading campaigns...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No campaigns found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.address} campaign={campaign} onDonate={handleDonate} onAccept={handleAcceptClick} onWithdraw={handleWithdraw} />
          ))}
        </div>
      )}

      <CreateCampaignModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        onSubmit={handleCampaignCreated}
      />

      {selectedCampaign && (
        <DonateModal
          isOpen={isDonateModalOpen}
          onClose={() => {
            setIsDonateModalOpen(false);
            fetchCampaigns();
          }}
          campaign={selectedCampaign}
        />
      )}

      {campaignToAccept && <AcceptTokenModal isOpen={isAcceptModalOpen} onClose={() => setIsAcceptModalOpen(false)} campaign={campaignToAccept} onSuccess={handleAcceptSuccess} />}

      <StatusModal isOpen={statusModal.isOpen} onClose={closeStatusModal} title={statusModal.title} message={statusModal.message} type={statusModal.type} />
    </div>
  );
};

export default AllCampaigns;
