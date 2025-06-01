// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface ICampaignFactory {
    function addApproverTokens(address user, uint amount) external;

    function logDonation(address user, address campaignAddress) external;
}

contract Campaign {
    // how many approver token needed for make campaign active
    // dev value = 10
    // prod value = 100
    uint public constant MIN_TOKEN_APPROVER = 10;

    address public factory;

    address public owner;
    string public title;
    string public description;
    uint public targetAmount;
    uint public deadline;

    uint public totalTokenDonated;
    uint public totalTokenApproved;

    mapping(address => uint[]) public donors;
    mapping(address => uint[]) public approver;

    modifier isFactory() {
        require(msg.sender == factory, "Not factory");
        _;
    }

    modifier isOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier canApprove() {
        require(MIN_TOKEN_APPROVER > totalTokenApproved, "Campaign is active");
        _;
    }

    modifier maxApprove(uint amount) {
        require(MIN_TOKEN_APPROVER >= totalTokenApproved + amount, "Max approve token exceeds the limit");
        _;
    }

    modifier canDonate() {
        require(totalTokenApproved >= MIN_TOKEN_APPROVER, "Campaign is not active");
        _;
    }

    modifier haventAchived() {
        require(targetAmount > totalTokenDonated, "Campaign has achived target amount");
        _;
    }

    modifier notExpired() {
        require(deadline > block.timestamp, "Campaign has ended");
        _;
    }

    modifier minOne(uint amount) {
        require(amount >= 1, "Amount at least 1");
        _;
    }

    modifier canWithdraw() {
        require(address(this).balance > 0, "Can't withdraw because balance is 0");
        _;
    }

    function getDonors(address user) external view returns (uint[] memory) {
        return donors[user];
    }

    function isActive() external view returns (bool) {
        return totalTokenApproved >= MIN_TOKEN_APPROVER;
    }

    function withdrawable() external view returns (bool) {
        return (totalTokenDonated >= targetAmount || block.timestamp >= deadline);
    }

    function getMinTokenApprover() external pure returns (uint) {
        return MIN_TOKEN_APPROVER;
    }

    function getTotalTokenApproved() external view returns (uint) {
        return totalTokenApproved;
    }

    function setTotalTokenApproved(uint amount) external {
        require(msg.sender == factory, "Only factory can set");
        totalTokenApproved = amount;
    }

    constructor(address _owner, string memory _title, string memory _description, uint _targetAmount, uint _deadline) {
        factory = msg.sender;

        owner = _owner;
        title = _title;
        description = _description;
        targetAmount = _targetAmount;
        deadline = _deadline;
    }

    function accept(address acceptor, uint amount) external isFactory canApprove minOne(amount) maxApprove(amount) {
        totalTokenApproved += amount;
        approver[acceptor].push(amount);
    }

    function donate() external payable canDonate haventAchived notExpired {
        require(msg.value > 0, "Amount should be more than 0");

        donors[msg.sender].push(msg.value);
        totalTokenDonated += msg.value;

        ICampaignFactory _factory = ICampaignFactory(factory);

        uint howManyApproverTokenUserGot = msg.value / 1e15;
        if (howManyApproverTokenUserGot > 0) {
            // increase user's approver token
            _factory.addApproverTokens(msg.sender, howManyApproverTokenUserGot);
        }

        _factory.logDonation(msg.sender, address(this));
    }

    function withdraw() external isOwner canWithdraw {
        require(totalTokenDonated >= targetAmount || block.timestamp >= deadline, "Campaign haven't hit target amount OR campaign is not over yet");

        payable(owner).transfer(address(this).balance);
    }
}
