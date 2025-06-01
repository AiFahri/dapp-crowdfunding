// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./Campaign.sol";

contract CampaignFactory {
    // how many campaigns is auto approve
    // dev value = 2
    // prod value = 10
    uint public constant AUTO_APPROVE = 2;

    // all campaigns
    address[] public campaigns;

    // get campaigns from address X
    mapping(address => address[]) public campaignsByOwner;

    address[] public activeCampaigns;
    address[] public inactiveCampaigns;

    // index for reduce gas fee
    mapping(address => uint) public inactiveIndex;

    // get approver tokens for address X
    mapping(address => uint) public approverTokens;

    // get history donate n approve from address X
    mapping(address => address[]) public donatedCampaigns;
    mapping(address => address[]) public approvedCampaigns;

    // who belongs this campaign
    mapping(address => address) public ownerCampaign;

    function getAllCampaigns() external view returns (address[] memory) {
        return campaigns;
    }

    function getCampaignsByOwner(address owner) external view returns (address[] memory) {
        return campaignsByOwner[owner];
    }

    function getActiveCampaigns() external view returns (address[] memory) {
        return activeCampaigns;
    }

    function getInactiveCampaigns() external view returns (address[] memory) {
        return inactiveCampaigns;
    }

    function getDonatedCampaigns(address user) external view returns (address[] memory) {
        return donatedCampaigns[user];
    }

    function getApprovedCampaigns(address user) external view returns (address[] memory) {
        return approvedCampaigns[user];
    }

    function getApproverToken(address user) external view returns (uint) {
        return approverTokens[user];
    }

    function getInactiveIndex(address campaign) external view returns (uint) {
        return inactiveIndex[campaign];
    }

    function getOwnerCampaign(address campaign) external view returns (address) {
        return ownerCampaign[campaign];
    }

    function createCampaign(string memory _title, string memory _description, uint _targetAmount, uint _deadline) external {
        Campaign newCampaign = new Campaign(msg.sender, _title, _description, _targetAmount, _deadline);
        address newCampaignAddress = address(newCampaign);

        campaigns.push(newCampaignAddress);
        campaignsByOwner[msg.sender].push(newCampaignAddress);

        ownerCampaign[newCampaignAddress] = msg.sender;

        if (campaigns.length <= AUTO_APPROVE) {
            newCampaign.setTotalTokenApproved(newCampaign.getMinTokenApprover());
            activeCampaigns.push(newCampaignAddress);
        } else {
            inactiveCampaigns.push(newCampaignAddress);
            inactiveIndex[newCampaignAddress] = inactiveCampaigns.length - 1;
        }
    }

    function acceptCampaign(address campaignAddress, uint amount) external {
        Campaign campaign = Campaign(campaignAddress);
        require(campaign.getMinTokenApprover() > campaign.getTotalTokenApproved(), "Campaign is active");
        require(amount >= 1, "Amount at least 1");

        // user's approver token should be more or same with amount parameter
        require(approverTokens[msg.sender] >= amount, "Not enough donation tokens");
        campaign.accept(msg.sender, amount);
        approverTokens[msg.sender] -= amount;
        approvedCampaigns[msg.sender].push(campaignAddress);

        if (campaign.getTotalTokenApproved() >= campaign.getMinTokenApprover()) {
            uint index = inactiveIndex[address(campaign)];
            uint lastIndex = inactiveCampaigns.length - 1;

            if (index != lastIndex) {
                address lastCampaign = inactiveCampaigns[lastIndex];
                inactiveCampaigns[index] = lastCampaign;
                inactiveIndex[lastCampaign] = index;
            }

            inactiveCampaigns.pop();
            delete inactiveIndex[campaignAddress];

            activeCampaigns.push(campaignAddress);
        }
    }

    function addApproverTokens(address user, uint amount) external {
        require(ownerCampaign[msg.sender] != address(0), "Only campaigns can mint");
        approverTokens[user] += amount;
    }

    function logDonation(address user, address campaignAddress) external {
        require(ownerCampaign[msg.sender] != address(0), "Only campaigns can log donation");
        donatedCampaigns[user].push(campaignAddress);
    }
}
