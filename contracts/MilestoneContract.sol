// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title MilestoneContract - Polygon Optimized
 * @dev Manages campaign milestones with verification system
 * Optimized for Polygon's low gas costs and fast confirmations
 */
contract MilestoneContract is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _milestoneIds;

    enum MilestoneStatus {
        Pending,
        Submitted,
        Verified,
        Rejected,
        FundsReleased
    }

    struct Milestone {
        uint256 id;
        uint256 campaignId;
        string title;
        string description;
        uint256 targetAmount;
        uint256 deadline;
        MilestoneStatus status;
        string[] proofDocuments; // IPFS hashes
        uint256 submittedAt;
        uint256 verifiedAt;
        address verifier;
        string rejectionReason;
        uint256 order;
    }

    // Storage mappings
    mapping(uint256 => Milestone) public milestones;
    mapping(uint256 => uint256[]) public campaignMilestones; // campaignId => milestoneIds[]
    mapping(address => bool) public verifiers;
    mapping(uint256 => bool) public fundsReleased;

    // Main donation contract reference
    address public donationContract;

    // Events
    event MilestoneCreated(
        uint256 indexed milestoneId,
        uint256 indexed campaignId,
        string title,
        uint256 targetAmount,
        uint256 deadline
    );

    event MilestoneSubmitted(
        uint256 indexed milestoneId,
        uint256 indexed campaignId,
        string[] proofDocuments,
        uint256 timestamp
    );

    event MilestoneVerified(
        uint256 indexed milestoneId,
        uint256 indexed campaignId,
        bool approved,
        address verifier,
        uint256 timestamp
    );

    event FundsReleased(
        uint256 indexed milestoneId,
        uint256 indexed campaignId,
        uint256 amount,
        address recipient
    );

    modifier onlyVerifier() {
        require(verifiers[msg.sender] || msg.sender == owner(), "Not authorized verifier");
        _;
    }

    modifier onlyDonationContract() {
        require(msg.sender == donationContract, "Only donation contract");
        _;
    }

    modifier milestoneExists(uint256 _milestoneId) {
        require(_milestoneId > 0 && _milestoneId <= _milestoneIds.current(), "Milestone doesn't exist");
        _;
    }

    constructor(address _donationContract) {
        donationContract = _donationContract;
        verifiers[msg.sender] = true; // Contract deployer is verifier
    }

    /**
     * @dev Create milestone for campaign
     */
    function createMilestone(
        uint256 _campaignId,
        string memory _title,
        string memory _description,
        uint256 _targetAmount,
        uint256 _deadline,
        uint256 _order
    ) external returns (uint256) {
        require(bytes(_title).length > 0, "Title required");
        require(bytes(_description).length > 0, "Description required");
        require(_targetAmount > 0, "Target amount must be positive");
        require(_deadline > block.timestamp, "Deadline must be future");
        require(_order > 0, "Order must be positive");

        _milestoneIds.increment();
        uint256 newMilestoneId = _milestoneIds.current();

        string[] memory emptyDocs;
        milestones[newMilestoneId] = Milestone({
            id: newMilestoneId,
            campaignId: _campaignId,
            title: _title,
            description: _description,
            targetAmount: _targetAmount,
            deadline: _deadline,
            status: MilestoneStatus.Pending,
            proofDocuments: emptyDocs,
            submittedAt: 0,
            verifiedAt: 0,
            verifier: address(0),
            rejectionReason: "",
            order: _order
        });

        campaignMilestones[_campaignId].push(newMilestoneId);

        emit MilestoneCreated(newMilestoneId, _campaignId, _title, _targetAmount, _deadline);
        return newMilestoneId;
    }

    /**
     * @dev Submit milestone with proof documents
     */
    function submitMilestone(
        uint256 _milestoneId,
        string[] memory _proofDocuments
    ) external milestoneExists(_milestoneId) {
        Milestone storage milestone = milestones[_milestoneId];
        require(milestone.status == MilestoneStatus.Pending, "Milestone already submitted");
        require(_proofDocuments.length > 0, "Proof documents required");
        require(block.timestamp <= milestone.deadline, "Milestone deadline passed");

        milestone.status = MilestoneStatus.Submitted;
        milestone.proofDocuments = _proofDocuments;
        milestone.submittedAt = block.timestamp;

        emit MilestoneSubmitted(_milestoneId, milestone.campaignId, _proofDocuments, block.timestamp);
    }

    /**
     * @dev Verify milestone - Verifier only
     */
    function verifyMilestone(
        uint256 _milestoneId,
        bool _approved,
        string memory _rejectionReason
    ) external onlyVerifier milestoneExists(_milestoneId) {
        Milestone storage milestone = milestones[_milestoneId];
        require(milestone.status == MilestoneStatus.Submitted, "Milestone not submitted");

        if (_approved) {
            milestone.status = MilestoneStatus.Verified;
        } else {
            milestone.status = MilestoneStatus.Rejected;
            milestone.rejectionReason = _rejectionReason;
        }

        milestone.verifier = msg.sender;
        milestone.verifiedAt = block.timestamp;

        emit MilestoneVerified(_milestoneId, milestone.campaignId, _approved, msg.sender, block.timestamp);
    }

    /**
     * @dev Release funds for verified milestone
     */
    function releaseMilestoneFunds(
        uint256 _milestoneId
    ) external payable milestoneExists(_milestoneId) nonReentrant {
        Milestone storage milestone = milestones[_milestoneId];
        require(milestone.status == MilestoneStatus.Verified, "Milestone not verified");
        require(!fundsReleased[_milestoneId], "Funds already released");
        require(msg.value >= milestone.targetAmount, "Insufficient funds");

        fundsReleased[_milestoneId] = true;
        milestone.status = MilestoneStatus.FundsReleased;

        // Transfer funds to campaign creator (would integrate with donation contract)
        payable(msg.sender).transfer(msg.value);

        emit FundsReleased(_milestoneId, milestone.campaignId, msg.value, msg.sender);
    }

    /**
     * @dev Get milestone details
     */
    function getMilestoneDetails(uint256 _milestoneId)
        external
        view
        milestoneExists(_milestoneId)
        returns (
            uint256 campaignId,
            string memory title,
            string memory description,
            uint256 targetAmount,
            uint256 deadline,
            MilestoneStatus status,
            string[] memory proofDocuments,
            uint256 submittedAt,
            uint256 verifiedAt,
            address verifier,
            string memory rejectionReason,
            uint256 order
        )
    {
        Milestone storage milestone = milestones[_milestoneId];
        return (
            milestone.campaignId,
            milestone.title,
            milestone.description,
            milestone.targetAmount,
            milestone.deadline,
            milestone.status,
            milestone.proofDocuments,
            milestone.submittedAt,
            milestone.verifiedAt,
            milestone.verifier,
            milestone.rejectionReason,
            milestone.order
        );
    }

    /**
     * @dev Get campaign milestones
     */
    function getCampaignMilestones(uint256 _campaignId) external view returns (uint256[] memory) {
        return campaignMilestones[_campaignId];
    }

    /**
     * @dev Get milestone count
     */
    function getMilestoneCount() external view returns (uint256) {
        return _milestoneIds.current();
    }

    /**
     * @dev Add verifier - Owner only
     */
    function addVerifier(address _verifier) external onlyOwner {
        verifiers[_verifier] = true;
    }

    /**
     * @dev Remove verifier - Owner only
     */
    function removeVerifier(address _verifier) external onlyOwner {
        verifiers[_verifier] = false;
    }

    /**
     * @dev Update donation contract - Owner only
     */
    function updateDonationContract(address _newContract) external onlyOwner {
        donationContract = _newContract;
    }

    /**
     * @dev Get pending milestones for verification
     */
    function getPendingMilestones() external view returns (uint256[] memory) {
        uint256 pendingCount = 0;
        
        // Count pending milestones
        for (uint256 i = 1; i <= _milestoneIds.current(); i++) {
            if (milestones[i].status == MilestoneStatus.Submitted) {
                pendingCount++;
            }
        }
        
        // Build pending milestones array
        uint256[] memory pendingMilestones = new uint256[](pendingCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= _milestoneIds.current(); i++) {
            if (milestones[i].status == MilestoneStatus.Submitted) {
                pendingMilestones[index] = i;
                index++;
            }
        }
        
        return pendingMilestones;
    }

    /**
     * @dev Check if milestone is overdue
     */
    function isMilestoneOverdue(uint256 _milestoneId) external view milestoneExists(_milestoneId) returns (bool) {
        Milestone storage milestone = milestones[_milestoneId];
        return (milestone.status == MilestoneStatus.Pending && block.timestamp > milestone.deadline);
    }

    /**
     * @dev Fallback function
     */
    receive() external payable {}
}
