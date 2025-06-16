import React, { useState, useEffect, useContext } from 'react';
import { Web3Context } from '../contexts/Web3Context';
import { ethers } from 'ethers';
import { formatDate } from '../utils/helpers';
import { campaignABI } from '../utils/contract';

const History = () => {
  const { factory, provider, account, isConnected } = useContext(Web3Context);
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (factory && isConnected && account) {
      fetchDonations();
    }
  }, [factory, isConnected, account]);

  const fetchDonations = async () => {
    setIsLoading(true);
    try {
      const donatedCampaigns = await factory.getDonatedCampaigns(account);
      
      const donationData = [];
      
      for (const address of donatedCampaigns) {
        const campaign = new ethers.Contract(address, campaignABI, provider);
        
        const [title, description, target, donated, deadline, owner, isActive] = await Promise.all([
          campaign.title(),
          campaign.description(),
          campaign.targetAmount(),
          campaign.totalTokenDonated(),
          campaign.deadline(),
          campaign.owner(),
          campaign.isActive()
        ]);
        
        const userDonations = await campaign.getDonors(account);
        
        donationData.push({
          address,
          title,
          description,
          target,
          donated,
          deadline: Number(deadline),
          owner,
          isActive,
          userDonations
        });
      }
      
      setDonations(donationData);
    } catch (error) {
      console.error("Failed to fetch donations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
        <p className="text-gray-600 mb-8">Please connect your wallet to view your donation history.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">My Donations</h1>
      
      {isLoading ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Loading donation history...</p>
        </div>
      ) : donations.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">You haven't made any donations yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {donations.map((campaign) => (
            <div key={campaign.address} className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-2">{campaign.title}</h2>
              <p className="text-sm text-gray-500 mb-4">Campaign Address: {campaign.address}</p>

              <p className="text-gray-700 mb-6 text-sm">{campaign.description}</p>

              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Target:</span> {ethers.formatEther(campaign.target)} ETH
                </p>
                <p>
                  <span className="font-medium">Donated:</span> {ethers.formatEther(campaign.donated)} ETH
                </p>
                <p>
                  <span className="font-medium">Your Donations:</span> {campaign.userDonations.map((donation) => ethers.formatEther(donation)).join(", ")} ETH
                </p>
                <p>
                  <span className="font-medium">Status:</span> {campaign.isActive ? "Active" : "Inactive"}
                </p>
                <p>
                  <span className="font-medium">Deadline:</span> {formatDate(campaign.deadline)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;

