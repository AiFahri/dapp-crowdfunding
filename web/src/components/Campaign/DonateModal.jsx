import React, { useState, useContext } from "react";
import { ethers } from "ethers";
import { Web3Context } from "../../contexts/Web3Context";
import { shortenAddress } from "../../utils/helpers";
import Modal from "../UI/Modal";
import StatusModal from "../UI/StatusModal";

const DonateModal = ({ isOpen, onClose, campaign }) => {
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { handleDonate, showStatusModal } = useContext(Web3Context);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      showStatusModal("Error", "Please enter a valid amount", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await handleDonate(campaign.address, amount);
      
      if (success) {
        setAmount("");
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error("Donation failed:", error);
      showStatusModal("Error", "Donation failed: " + error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    onClose();
  };

  if (!isOpen || !campaign) return null;

  return (
    <>
      <Modal
        isOpen={isOpen && !showSuccessModal}
        onClose={onClose}
        title="Donate to Campaign"
      >
        <div className="mb-6">
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="font-medium mb-1">{campaign.title || "Campaign"}</h3>
            <p className="text-sm text-gray-600 mb-2">{shortenAddress(campaign.address)}</p>
            <p className="text-sm text-gray-700 mb-3">
              {campaign.description || "Campaign description"}
            </p>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Target:</span>
              <span>{ethers.formatEther(campaign.target)} ETH</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Donated:</span>
              <span>{ethers.formatEther(campaign.donated)} ETH</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Donation Amount (ETH)
            </label>
            <input
              type="text"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 bg-light-gray border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="1"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              For every 0.001 ETH donated, you'll receive 1 donation token.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Donate"}
            </button>
          </div>
        </form>
      </Modal>

      <StatusModal
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        title="Thank You!"
        message="Your donation has been processed successfully. Thank you for your generosity!"
        type="success"
      />
    </>
  );
};

export default DonateModal;


