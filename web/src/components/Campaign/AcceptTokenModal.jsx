import React, { useState, useContext } from "react";
import { Web3Context } from "../../contexts/Web3Context";
import Modal from "../UI/Modal";
import { shortenAddress } from "../../utils/helpers";

const AcceptTokenModal = ({ isOpen, onClose, campaign, onSuccess }) => {
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { handleAccept, donationToken } = useContext(Web3Context);
  const neededTokens = campaign?.neededTokens || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const tokenAmount = parseInt(amount);
    
    if (isNaN(tokenAmount) || tokenAmount <= 0) {
      alert("Please enter a valid number");
      return;
    }
    
    if (tokenAmount > neededTokens) {
      alert(`This campaign only needs ${neededTokens} more tokens`);
      return;
    }
    
    if (tokenAmount > donationToken) {
      alert(`You only have ${donationToken} donation tokens`);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await handleAccept(campaign.address, tokenAmount);
      if (success) {
        setAmount("");
        onSuccess();
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Approve Campaign">
      <div className="mb-4">
        <h3 className="text-lg font-medium">{campaign?.title}</h3>
        <p className="text-sm text-gray-600">Campaign Address: {campaign ? shortenAddress(campaign.address) : ""}</p>
      </div>

      <div className="mb-4">
        <p className="text-sm">
          This campaign needs <span className="font-medium">{neededTokens}</span> more approval tokens to become active.
        </p>
        <p className="text-sm">
          You have <span className="font-medium">{donationToken}</span> approval tokens available.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            How many tokens would you like to contribute?
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="1"
            max={Math.min(neededTokens, donationToken)}
            className="w-full p-2 bg-light-gray border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter token amount"
            required
          />
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
            {isSubmitting ? "Processing..." : "Accept"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AcceptTokenModal;


