import React, { useState, useContext } from "react";
import { Web3Context } from "../../contexts/Web3Context";
import { ethers } from "ethers";
import Modal from "../UI/Modal";
import StatusModal from "../UI/StatusModal";

const CreateCampaignModal = ({ isOpen, onClose, onSubmit }) => {
  const { factory } = useContext(Web3Context);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [deadlineTime, setDeadlineTime] = useState("23:59");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !target || !deadlineDate || !deadlineTime) {
      alert("Please fill all fields");
      return;
    }

    const targetRegex = /^\d+(\.\d{0,18})?$/;
    if (!targetRegex.test(target)) {
      alert("Target amount must be a number (max 18 decimal places)");
      return;
    }

    if (parseFloat(target) <= 0) {
      alert("Target amount must be greater than 0");
      return;
    }

    const [hours, minutes] = deadlineTime.split(':').map(Number);
    const selectedDate = new Date(deadlineDate);
    selectedDate.setHours(hours, minutes, 0);
    
    const deadlineTimestamp = Math.floor(selectedDate.getTime() / 1000);
    const now = Math.floor(Date.now() / 1000);

    if (deadlineTimestamp <= now) {
      alert("Deadline must be in the future");
      return;
    }

    setIsSubmitting(true);

    try {
      const tx = await factory.createCampaign(title, description, ethers.parseEther(target), deadlineTimestamp);

      await tx.wait();

      setTitle("");
      setDescription("");
      setTarget("");
      setDeadlineDate("");
      setDeadlineTime("23:59");
      
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Failed to create campaign:", error);
      alert("Failed to create campaign: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    onSubmit();
    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen && !showSuccessModal}
        onClose={onClose}
        title="Create New Campaign"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border bg-light-gray border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Campaign title"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border bg-light-gray border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Campaign description"
                rows="4"
                required
              ></textarea>
            </div>

            <div>
              <label className="block text-gray-700 bg-light-gray text-sm font-medium mb-2">Target Amount (ETH)</label>
              <input
                type="number"
                step="1"
                min="0"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full px-3 py-2 border bg-light-gray border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0.0"
                required
              />
            </div>

            <div className="flex flex-col md:flex-row md:space-x-4">
              <div className="w-full md:w-1/2 mb-4 md:mb-0">
                <label className="block text-gray-700 text-sm font-medium mb-2">Deadline Date</label>
                <input
                  type="date"
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  className="date-input w-full px-3 py-2 border bg-light-gray border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="w-full md:w-1/2">
                <label className="block text-gray-700 text-sm font-medium mb-2">Deadline Time</label>
                <input
                  type="time"
                  value={deadlineTime}
                  onChange={(e) => setDeadlineTime(e.target.value)}
                  className="w-full px-3 py-2 border bg-light-gray border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Set the exact time (hours:minutes) when the campaign will end
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-purple-700 transition flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating...
                </>
              ) : (
                "Create Campaign"
              )}
            </button>
          </div>
        </form>
      </Modal>
      <StatusModal
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        title="Campaign Created Successfully"
        message="Your campaign has been successfully created! You can now manage it from the campaigns section."
        type="success"
      />
    </>
  );
};

export default CreateCampaignModal;


