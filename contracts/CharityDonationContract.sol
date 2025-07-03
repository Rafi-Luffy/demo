// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title CharityDonationContract - Polygon Optimized
 * @dev Main donation contract optimized for Polygon network
 * Features: Low gas costs, fast confirmations, MATIC/USDC support
 */
contract CharityDonationContract is ReentrancyGuard, Ownable, Pausable {
    using Counters for Counters.Counter;

    Counters.Counter private _campaignIds;
    Counters.Counter private _donationIds;

    // Polygon-optimized structures
    struct Campaign {
        uint256 id;
        string title;
        uint256 targetAmount;
        uint256 raisedAmount;
        uint256 deadline;
        address payable creator;
        bool isActive;
        string ipfsHash;
        uint256 donorCount;
        uint256 createdAt;
        bool isVerified;
    }

    struct Donation {
        uint256 id;
        uint256 campaignId;
        address donor;
        uint256 amount;
        uint256 timestamp;
        string message;
        bool isAnonymous;
    }

    // Storage mappings optimized for Polygon
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => Donation) public donations;
    mapping(address => uint256[]) public donorCampaigns;
    mapping(uint256 => uint256[]) public campaignDonations;
    mapping(address => bool) public verifiedCreators;

    // Polygon-specific features
    uint256 public constant MIN_DONATION = 0.001 ether; // 0.001 MATIC
    uint256 public constant PLATFORM_FEE = 25; // 2.5% platform fee
    address payable public platformWallet;
    
    // Emergency controls
    mapping(uint256 => bool) public emergencyWithdrawn;
    
    // Events optimized for Polygon indexing
    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed creator,
        string title,
        uint256 targetAmount,
        uint256 deadline
    );
    
    event DonationMade(
        uint256 indexed campaignId,
        uint256 indexed donationId,
        address indexed donor,
        uint256 amount,
        uint256 timestamp
    );
    
    event CampaignCompleted(
        uint256 indexed campaignId,
        uint256 totalRaised,
        uint256 donorCount
    );
    
    event EmergencyWithdrawal(
        uint256 indexed campaignId,
        uint256 amount,
        address recipient,
        string reason
    );

    modifier onlyVerifiedCreator() {
        require(verifiedCreators[msg.sender], "Creator not verified");
        _;
    }

    modifier campaignExists(uint256 _campaignId) {
        require(_campaignId > 0 && _campaignId <= _campaignIds.current(), "Campaign doesn't exist");
        _;
    }

    modifier campaignActive(uint256 _campaignId) {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.isActive, "Campaign not active");
        require(block.timestamp <= campaign.deadline, "Campaign deadline passed");
        require(campaign.raisedAmount < campaign.targetAmount, "Campaign already funded");
        _;
    }

    constructor(address payable _platformWallet) {
        platformWallet = _platformWallet;
        verifiedCreators[msg.sender] = true; // Contract deployer is verified
    }

    /**
     * @dev Create a new campaign - Polygon optimized
     */
    function createCampaign(
        string memory _title,
        uint256 _targetAmount,
        uint256 _deadline,
        string memory _ipfsHash
    ) external onlyVerifiedCreator whenNotPaused returns (uint256) {
        require(bytes(_title).length > 0, "Title required");
        require(_targetAmount >= MIN_DONATION * 100, "Target too low"); // Min 0.1 MATIC
        require(_deadline > block.timestamp, "Deadline must be future");
        require(bytes(_ipfsHash).length > 0, "IPFS hash required");

        _campaignIds.increment();
        uint256 newCampaignId = _campaignIds.current();

        campaigns[newCampaignId] = Campaign({
            id: newCampaignId,
            title: _title,
            targetAmount: _targetAmount,
            raisedAmount: 0,
            deadline: _deadline,
            creator: payable(msg.sender),
            isActive: true,
            ipfsHash: _ipfsHash,
            donorCount: 0,
            createdAt: block.timestamp,
            isVerified: false
        });

        emit CampaignCreated(newCampaignId, msg.sender, _title, _targetAmount, _deadline);
        return newCampaignId;
    }

    /**
     * @dev Donate to campaign - Polygon optimized with low gas
     */
    function donate(uint256 _campaignId, string memory _message, bool _isAnonymous) 
        external 
        payable 
        campaignExists(_campaignId) 
        campaignActive(_campaignId) 
        nonReentrant 
        whenNotPaused 
    {
        require(msg.value >= MIN_DONATION, "Minimum donation not met");

        Campaign storage campaign = campaigns[_campaignId];
        
        // Calculate platform fee
        uint256 platformFeeAmount = (msg.value * PLATFORM_FEE) / 1000;
        uint256 donationAmount = msg.value - platformFeeAmount;

        // Update campaign
        campaign.raisedAmount += donationAmount;
        campaign.donorCount += 1;

        // Create donation record
        _donationIds.increment();
        uint256 newDonationId = _donationIds.current();
        
        donations[newDonationId] = Donation({
            id: newDonationId,
            campaignId: _campaignId,
            donor: msg.sender,
            amount: donationAmount,
            timestamp: block.timestamp,
            message: _message,
            isAnonymous: _isAnonymous
        });

        // Update mappings
        donorCampaigns[msg.sender].push(_campaignId);
        campaignDonations[_campaignId].push(newDonationId);

        // Transfer platform fee
        if (platformFeeAmount > 0) {
            platformWallet.transfer(platformFeeAmount);
        }

        emit DonationMade(_campaignId, newDonationId, msg.sender, donationAmount, block.timestamp);

        // Check if campaign is completed
        if (campaign.raisedAmount >= campaign.targetAmount) {
            campaign.isActive = false;
            emit CampaignCompleted(_campaignId, campaign.raisedAmount, campaign.donorCount);
        }
    }

    /**
     * @dev Withdraw funds - Only campaign creator
     */
    function withdrawFunds(uint256 _campaignId) 
        external 
        campaignExists(_campaignId) 
        nonReentrant 
    {
        Campaign storage campaign = campaigns[_campaignId];
        require(msg.sender == campaign.creator, "Only creator can withdraw");
        require(campaign.raisedAmount > 0, "No funds to withdraw");
        require(
            campaign.raisedAmount >= campaign.targetAmount || 
            block.timestamp > campaign.deadline,
            "Campaign still active"
        );

        uint256 amount = campaign.raisedAmount;
        campaign.raisedAmount = 0;
        campaign.isActive = false;

        campaign.creator.transfer(amount);
    }

    /**
     * @dev Emergency withdrawal - Owner only
     */
    function emergencyWithdraw(uint256 _campaignId, string memory _reason) 
        external 
        onlyOwner 
        campaignExists(_campaignId) 
    {
        Campaign storage campaign = campaigns[_campaignId];
        require(!emergencyWithdrawn[_campaignId], "Already withdrawn");
        require(campaign.raisedAmount > 0, "No funds");

        uint256 amount = campaign.raisedAmount;
        campaign.raisedAmount = 0;
        campaign.isActive = false;
        emergencyWithdrawn[_campaignId] = true;

        emit EmergencyWithdrawal(_campaignId, amount, campaign.creator, _reason);
        campaign.creator.transfer(amount);
    }

    /**
     * @dev Verify creator - Owner only
     */
    function verifyCreator(address _creator) external onlyOwner {
        verifiedCreators[_creator] = true;
    }

    /**
     * @dev Get campaign details
     */
    function getCampaignDetails(uint256 _campaignId) 
        external 
        view 
        campaignExists(_campaignId) 
        returns (
            string memory title,
            uint256 targetAmount,
            uint256 raisedAmount,
            uint256 deadline,
            address creator,
            bool isActive,
            string memory ipfsHash
        ) 
    {
        Campaign storage campaign = campaigns[_campaignId];
        return (
            campaign.title,
            campaign.targetAmount,
            campaign.raisedAmount,
            campaign.deadline,
            campaign.creator,
            campaign.isActive,
            campaign.ipfsHash
        );
    }

    /**
     * @dev Get donation history for address
     */
    function getDonationHistory(address _donor) 
        external 
        view 
        returns (uint256[] memory campaignIds, uint256[] memory amounts, uint256[] memory timestamps) 
    {
        uint256[] memory donorCampaignList = donorCampaigns[_donor];
        uint256 length = donorCampaignList.length;
        
        campaignIds = new uint256[](length);
        amounts = new uint256[](length);
        timestamps = new uint256[](length);
        
        for (uint256 i = 0; i < length; i++) {
            uint256 campaignId = donorCampaignList[i];
            uint256[] memory donationList = campaignDonations[campaignId];
            
            // Find donation by this donor
            for (uint256 j = 0; j < donationList.length; j++) {
                Donation storage donation = donations[donationList[j]];
                if (donation.donor == _donor) {
                    campaignIds[i] = campaignId;
                    amounts[i] = donation.amount;
                    timestamps[i] = donation.timestamp;
                    break;
                }
            }
        }
        
        return (campaignIds, amounts, timestamps);
    }

    /**
     * @dev Get total platform donations
     */
    function getTotalDonations() external view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 1; i <= _campaignIds.current(); i++) {
            total += campaigns[i].raisedAmount;
        }
        return total;
    }

    /**
     * @dev Get active campaigns
     */
    function getActiveCampaigns() external view returns (uint256[] memory) {
        uint256 activeCount = 0;
        
        // Count active campaigns
        for (uint256 i = 1; i <= _campaignIds.current(); i++) {
            if (campaigns[i].isActive && block.timestamp <= campaigns[i].deadline) {
                activeCount++;
            }
        }
        
        // Build active campaigns array
        uint256[] memory activeCampaigns = new uint256[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= _campaignIds.current(); i++) {
            if (campaigns[i].isActive && block.timestamp <= campaigns[i].deadline) {
                activeCampaigns[index] = i;
                index++;
            }
        }
        
        return activeCampaigns;
    }

    /**
     * @dev Get campaign count
     */
    function getCampaignCount() external view returns (uint256) {
        return _campaignIds.current();
    }

    /**
     * @dev Update platform wallet
     */
    function updatePlatformWallet(address payable _newWallet) external onlyOwner {
        platformWallet = _newWallet;
    }

    /**
     * @dev Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Get contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Fallback function to receive MATIC
     */
    receive() external payable {}
}
