// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title DilSeDaanContract - Complete Polygon Charity Platform
 * @dev Main contract for DilSeDaan charity platform optimized for Polygon
 * Features: Campaigns, Donations, Volunteers, Milestones, Multi-token support
 */
contract DilSeDaanContract is ReentrancyGuard, Ownable, Pausable {
    using Counters for Counters.Counter;
    using SafeERC20 for IERC20;

    // Counters
    Counters.Counter private _campaignIds;
    Counters.Counter private _donationIds;
    Counters.Counter private _volunteerIds;
    Counters.Counter private _milestoneIds;

    // Supported tokens on Polygon
    address public constant USDC = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174; // USDC on Polygon
    address public constant USDT = 0xc2132D05D31c914a87C6611C10748AEb04B58e8F; // USDT on Polygon
    
    // Platform settings
    uint256 public platformFeePercentage = 250; // 2.5%
    uint256 public constant MAX_FEE = 500; // 5% max fee
    address public feeRecipient;
    
    // Campaign categories
    enum CampaignCategory {
        EDUCATION,
        HEALTHCARE,
        FOOD_NUTRITION,
        SHELTER,
        ENVIRONMENT,
        DISASTER_RELIEF,
        WOMEN_EMPOWERMENT,
        CHILD_WELFARE
    }

    // Campaign status
    enum CampaignStatus {
        DRAFT,
        ACTIVE,
        PAUSED,
        COMPLETED,
        CANCELLED
    }

    // Volunteer status
    enum VolunteerStatus {
        PENDING,
        APPROVED,
        ACTIVE,
        SUSPENDED
    }

    // Structures
    struct Campaign {
        uint256 id;
        string title;
        string description;
        uint256 targetAmount;
        uint256 raisedAmount;
        uint256 deadline;
        address payable creator;
        CampaignCategory category;
        CampaignStatus status;
        string ipfsHash; // For images and documents
        uint256 donorCount;
        uint256 createdAt;
        bool isVerified;
        uint256[] milestoneIds;
        string location;
        uint256 beneficiaryCount;
    }

    struct Donation {
        uint256 id;
        uint256 campaignId;
        address donor;
        uint256 amount;
        address token; // address(0) for MATIC
        uint256 timestamp;
        string message;
        bool isAnonymous;
        bool isRefunded;
    }

    struct Volunteer {
        uint256 id;
        address volunteer;
        string name;
        string email;
        string skills;
        string location;
        VolunteerStatus status;
        uint256 hoursContributed;
        uint256[] assignedCampaigns;
        uint256 joinedAt;
        string ipfsProfile; // Profile picture and documents
    }

    struct Milestone {
        uint256 id;
        uint256 campaignId;
        string title;
        string description;
        uint256 targetAmount;
        uint256 currentAmount;
        uint256 deadline;
        bool isCompleted;
        string proofHash; // IPFS hash for proof of completion
        uint256 createdAt;
    }

    // Storage mappings
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => Donation) public donations;
    mapping(uint256 => Volunteer) public volunteers;
    mapping(uint256 => Milestone) public milestones;
    
    mapping(address => uint256[]) public donorCampaigns;
    mapping(address => uint256) public volunteerIdByAddress;
    mapping(uint256 => uint256[]) public campaignDonations;
    mapping(address => bool) public verifiedCreators;
    mapping(address => bool) public supportedTokens;

    // Events
    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed creator,
        string title,
        uint256 targetAmount,
        CampaignCategory category
    );

    event DonationMade(
        uint256 indexed donationId,
        uint256 indexed campaignId,
        address indexed donor,
        uint256 amount,
        address token
    );

    event VolunteerRegistered(
        uint256 indexed volunteerId,
        address indexed volunteer,
        string name
    );

    event VolunteerApproved(
        uint256 indexed volunteerId,
        address indexed volunteer
    );

    event MilestoneCreated(
        uint256 indexed milestoneId,
        uint256 indexed campaignId,
        string title,
        uint256 targetAmount
    );

    event MilestoneCompleted(
        uint256 indexed milestoneId,
        uint256 indexed campaignId,
        string proofHash
    );

    event CampaignCompleted(uint256 indexed campaignId, uint256 totalRaised);
    event FundsWithdrawn(uint256 indexed campaignId, address creator, uint256 amount);

    constructor(address _feeRecipient) {
        feeRecipient = _feeRecipient;
        
        // Mark supported tokens
        supportedTokens[USDC] = true;
        supportedTokens[USDT] = true;
        supportedTokens[address(0)] = true; // MATIC
    }

    // Campaign Functions
    function createCampaign(
        string memory _title,
        string memory _description,
        uint256 _targetAmount,
        uint256 _deadline,
        CampaignCategory _category,
        string memory _ipfsHash,
        string memory _location,
        uint256 _beneficiaryCount
    ) external whenNotPaused returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_targetAmount > 0, "Target amount must be greater than 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(bytes(_location).length > 0, "Location cannot be empty");

        _campaignIds.increment();
        uint256 newCampaignId = _campaignIds.current();

        campaigns[newCampaignId] = Campaign({
            id: newCampaignId,
            title: _title,
            description: _description,
            targetAmount: _targetAmount,
            raisedAmount: 0,
            deadline: _deadline,
            creator: payable(msg.sender),
            category: _category,
            status: CampaignStatus.ACTIVE,
            ipfsHash: _ipfsHash,
            donorCount: 0,
            createdAt: block.timestamp,
            isVerified: verifiedCreators[msg.sender],
            milestoneIds: new uint256[](0),
            location: _location,
            beneficiaryCount: _beneficiaryCount
        });

        emit CampaignCreated(newCampaignId, msg.sender, _title, _targetAmount, _category);
        return newCampaignId;
    }

    function donate(
        uint256 _campaignId,
        string memory _message,
        bool _isAnonymous,
        address _token
    ) external payable nonReentrant whenNotPaused {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.id != 0, "Campaign does not exist");
        require(campaign.status == CampaignStatus.ACTIVE, "Campaign is not active");
        require(block.timestamp < campaign.deadline, "Campaign has ended");

        uint256 donationAmount;
        
        if (_token == address(0)) {
            // MATIC donation
            require(msg.value > 0, "Donation amount must be greater than 0");
            donationAmount = msg.value;
        } else {
            // ERC20 token donation
            require(supportedTokens[_token], "Token not supported");
            require(msg.value == 0, "Cannot send MATIC with token donation");
            
            IERC20 token = IERC20(_token);
            donationAmount = token.allowance(msg.sender, address(this));
            require(donationAmount > 0, "No token allowance");
            
            token.safeTransferFrom(msg.sender, address(this), donationAmount);
        }

        // Calculate platform fee
        uint256 platformFee = (donationAmount * platformFeePercentage) / 10000;
        uint256 netDonation = donationAmount - platformFee;

        // Create donation record
        _donationIds.increment();
        uint256 newDonationId = _donationIds.current();

        donations[newDonationId] = Donation({
            id: newDonationId,
            campaignId: _campaignId,
            donor: msg.sender,
            amount: donationAmount,
            token: _token,
            timestamp: block.timestamp,
            message: _message,
            isAnonymous: _isAnonymous,
            isRefunded: false
        });

        // Update campaign
        campaign.raisedAmount += netDonation;
        if (donorCampaigns[msg.sender].length == 0 || 
            donorCampaigns[msg.sender][donorCampaigns[msg.sender].length - 1] != _campaignId) {
            campaign.donorCount++;
            donorCampaigns[msg.sender].push(_campaignId);
        }
        
        campaignDonations[_campaignId].push(newDonationId);

        // Transfer platform fee
        if (platformFee > 0) {
            if (_token == address(0)) {
                payable(feeRecipient).transfer(platformFee);
            } else {
                IERC20(_token).safeTransfer(feeRecipient, platformFee);
            }
        }

        emit DonationMade(newDonationId, _campaignId, msg.sender, donationAmount, _token);

        // Check if campaign target is reached
        if (campaign.raisedAmount >= campaign.targetAmount) {
            campaign.status = CampaignStatus.COMPLETED;
            emit CampaignCompleted(_campaignId, campaign.raisedAmount);
        }
    }

    // Volunteer Functions
    function registerVolunteer(
        string memory _name,
        string memory _email,
        string memory _skills,
        string memory _location,
        string memory _ipfsProfile
    ) external returns (uint256) {
        require(volunteerIdByAddress[msg.sender] == 0, "Already registered as volunteer");
        require(bytes(_name).length > 0, "Name cannot be empty");

        _volunteerIds.increment();
        uint256 newVolunteerId = _volunteerIds.current();

        volunteers[newVolunteerId] = Volunteer({
            id: newVolunteerId,
            volunteer: msg.sender,
            name: _name,
            email: _email,
            skills: _skills,
            location: _location,
            status: VolunteerStatus.PENDING,
            hoursContributed: 0,
            assignedCampaigns: new uint256[](0),
            joinedAt: block.timestamp,
            ipfsProfile: _ipfsProfile
        });

        volunteerIdByAddress[msg.sender] = newVolunteerId;

        emit VolunteerRegistered(newVolunteerId, msg.sender, _name);
        return newVolunteerId;
    }

    function approveVolunteer(uint256 _volunteerId) external onlyOwner {
        Volunteer storage volunteer = volunteers[_volunteerId];
        require(volunteer.id != 0, "Volunteer does not exist");
        require(volunteer.status == VolunteerStatus.PENDING, "Volunteer not pending approval");

        volunteer.status = VolunteerStatus.APPROVED;
        emit VolunteerApproved(_volunteerId, volunteer.volunteer);
    }

    function assignVolunteerToCampaign(uint256 _volunteerId, uint256 _campaignId) external onlyOwner {
        require(volunteers[_volunteerId].id != 0, "Volunteer does not exist");
        require(campaigns[_campaignId].id != 0, "Campaign does not exist");
        require(volunteers[_volunteerId].status == VolunteerStatus.APPROVED, "Volunteer not approved");

        volunteers[_volunteerId].assignedCampaigns.push(_campaignId);
        volunteers[_volunteerId].status = VolunteerStatus.ACTIVE;
    }

    // Milestone Functions
    function createMilestone(
        uint256 _campaignId,
        string memory _title,
        string memory _description,
        uint256 _targetAmount,
        uint256 _deadline
    ) external returns (uint256) {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.id != 0, "Campaign does not exist");
        require(msg.sender == campaign.creator || msg.sender == owner(), "Not authorized");

        _milestoneIds.increment();
        uint256 newMilestoneId = _milestoneIds.current();

        milestones[newMilestoneId] = Milestone({
            id: newMilestoneId,
            campaignId: _campaignId,
            title: _title,
            description: _description,
            targetAmount: _targetAmount,
            currentAmount: 0,
            deadline: _deadline,
            isCompleted: false,
            proofHash: "",
            createdAt: block.timestamp
        });

        campaign.milestoneIds.push(newMilestoneId);

        emit MilestoneCreated(newMilestoneId, _campaignId, _title, _targetAmount);
        return newMilestoneId;
    }

    function completeMilestone(uint256 _milestoneId, string memory _proofHash) external {
        Milestone storage milestone = milestones[_milestoneId];
        Campaign storage campaign = campaigns[milestone.campaignId];
        
        require(milestone.id != 0, "Milestone does not exist");
        require(msg.sender == campaign.creator || msg.sender == owner(), "Not authorized");
        require(!milestone.isCompleted, "Milestone already completed");

        milestone.isCompleted = true;
        milestone.proofHash = _proofHash;

        emit MilestoneCompleted(_milestoneId, milestone.campaignId, _proofHash);
    }

    // Withdrawal Functions
    function withdrawFunds(uint256 _campaignId, address _token) external nonReentrant {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.creator == msg.sender, "Not campaign creator");
        require(campaign.status == CampaignStatus.COMPLETED || block.timestamp > campaign.deadline, "Cannot withdraw yet");

        uint256 withdrawableAmount;
        
        if (_token == address(0)) {
            withdrawableAmount = address(this).balance;
        } else {
            withdrawableAmount = IERC20(_token).balanceOf(address(this));
        }

        require(withdrawableAmount > 0, "No funds to withdraw");

        if (_token == address(0)) {
            campaign.creator.transfer(withdrawableAmount);
        } else {
            IERC20(_token).safeTransfer(campaign.creator, withdrawableAmount);
        }

        emit FundsWithdrawn(_campaignId, campaign.creator, withdrawableAmount);
    }

    // View Functions
    function getAllCampaigns() external view returns (Campaign[] memory) {
        uint256 totalCampaigns = _campaignIds.current();
        Campaign[] memory allCampaigns = new Campaign[](totalCampaigns);
        
        for (uint256 i = 1; i <= totalCampaigns; i++) {
            allCampaigns[i - 1] = campaigns[i];
        }
        
        return allCampaigns;
    }

    function getCampaignDonations(uint256 _campaignId) external view returns (Donation[] memory) {
        uint256[] memory donationIds = campaignDonations[_campaignId];
        Donation[] memory campaignDonationList = new Donation[](donationIds.length);
        
        for (uint256 i = 0; i < donationIds.length; i++) {
            campaignDonationList[i] = donations[donationIds[i]];
        }
        
        return campaignDonationList;
    }

    function getVolunteersByStatus(VolunteerStatus _status) external view returns (Volunteer[] memory) {
        uint256 totalVolunteers = _volunteerIds.current();
        uint256 count = 0;
        
        // Count volunteers with matching status
        for (uint256 i = 1; i <= totalVolunteers; i++) {
            if (volunteers[i].status == _status) {
                count++;
            }
        }
        
        // Create array with matching volunteers
        Volunteer[] memory filteredVolunteers = new Volunteer[](count);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= totalVolunteers; i++) {
            if (volunteers[i].status == _status) {
                filteredVolunteers[index] = volunteers[i];
                index++;
            }
        }
        
        return filteredVolunteers;
    }

    function getCampaignMilestones(uint256 _campaignId) external view returns (Milestone[] memory) {
        uint256[] memory milestoneIds = campaigns[_campaignId].milestoneIds;
        Milestone[] memory campaignMilestones = new Milestone[](milestoneIds.length);
        
        for (uint256 i = 0; i < milestoneIds.length; i++) {
            campaignMilestones[i] = milestones[milestoneIds[i]];
        }
        
        return campaignMilestones;
    }

    // Admin Functions
    function setPlatformFee(uint256 _newFeePercentage) external onlyOwner {
        require(_newFeePercentage <= MAX_FEE, "Fee too high");
        platformFeePercentage = _newFeePercentage;
    }

    function setFeeRecipient(address _newFeeRecipient) external onlyOwner {
        require(_newFeeRecipient != address(0), "Invalid address");
        feeRecipient = _newFeeRecipient;
    }

    function addSupportedToken(address _token) external onlyOwner {
        supportedTokens[_token] = true;
    }

    function removeSupportedToken(address _token) external onlyOwner {
        supportedTokens[_token] = false;
    }

    function verifyCreator(address _creator) external onlyOwner {
        verifiedCreators[_creator] = true;
    }

    function pauseCampaign(uint256 _campaignId) external onlyOwner {
        campaigns[_campaignId].status = CampaignStatus.PAUSED;
    }

    function unpauseCampaign(uint256 _campaignId) external onlyOwner {
        campaigns[_campaignId].status = CampaignStatus.ACTIVE;
    }

    function emergencyWithdraw(address _token) external onlyOwner {
        if (_token == address(0)) {
            payable(owner()).transfer(address(this).balance);
        } else {
            IERC20 token = IERC20(_token);
            token.safeTransfer(owner(), token.balanceOf(address(this)));
        }
    }

    // Pause/Unpause
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // Get contract stats
    function getContractStats() external view returns (
        uint256 totalCampaigns,
        uint256 totalDonations,
        uint256 totalVolunteers,
        uint256 totalMilestones
    ) {
        return (
            _campaignIds.current(),
            _donationIds.current(),
            _volunteerIds.current(),
            _milestoneIds.current()
        );
    }
}
