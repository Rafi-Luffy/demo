// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title AuditContract - Polygon Optimized
 * @dev Transparent audit system for campaign verification
 * Optimized for Polygon's efficiency and low costs
 */
contract AuditContract is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _auditIds;

    enum AuditStatus {
        Pending,
        InProgress,
        Completed,
        Disputed,
        Resolved
    }

    enum AuditType {
        Campaign,
        Milestone,
        Financial,
        Impact,
        Compliance
    }

    struct Audit {
        uint256 id;
        uint256 targetId; // Campaign ID or Milestone ID
        AuditType auditType;
        AuditStatus status;
        address auditor;
        address requester;
        string findings;
        string ipfsReportHash;
        uint256 score; // 0-100
        uint256 requestedAt;
        uint256 completedAt;
        bool isPassed;
        string[] evidenceHashes;
    }

    struct Auditor {
        address auditorAddress;
        string name;
        string credentials;
        uint256 completedAudits;
        uint256 averageScore;
        bool isActive;
        uint256 registeredAt;
    }

    // Storage mappings
    mapping(uint256 => Audit) public audits;
    mapping(address => Auditor) public auditors;
    mapping(uint256 => uint256[]) public targetAudits; // targetId => auditIds[]
    mapping(address => uint256[]) public auditorAudits;
    mapping(address => bool) public approvedAuditors;

    // Audit parameters
    uint256 public constant MIN_AUDIT_SCORE = 70;
    uint256 public auditFee = 0.1 ether; // 0.1 MATIC
    address payable public platformWallet;

    // Events
    event AuditRequested(
        uint256 indexed auditId,
        uint256 indexed targetId,
        AuditType auditType,
        address requester,
        address auditor
    );

    event AuditCompleted(
        uint256 indexed auditId,
        uint256 indexed targetId,
        uint256 score,
        bool isPassed,
        string ipfsReportHash
    );

    event AuditorRegistered(
        address indexed auditor,
        string name,
        string credentials
    );

    event AuditDisputed(
        uint256 indexed auditId,
        address disputer,
        string reason
    );

    modifier onlyApprovedAuditor() {
        require(approvedAuditors[msg.sender], "Not approved auditor");
        _;
    }

    modifier auditExists(uint256 _auditId) {
        require(_auditId > 0 && _auditId <= _auditIds.current(), "Audit doesn't exist");
        _;
    }

    modifier onlyAuditor(uint256 _auditId) {
        require(audits[_auditId].auditor == msg.sender, "Not assigned auditor");
        _;
    }

    constructor(address payable _platformWallet) {
        platformWallet = _platformWallet;
        approvedAuditors[msg.sender] = true; // Contract deployer is approved
    }

    /**
     * @dev Register as auditor
     */
    function registerAuditor(
        string memory _name,
        string memory _credentials
    ) external {
        require(bytes(_name).length > 0, "Name required");
        require(bytes(_credentials).length > 0, "Credentials required");
        require(auditors[msg.sender].auditorAddress == address(0), "Already registered");

        auditors[msg.sender] = Auditor({
            auditorAddress: msg.sender,
            name: _name,
            credentials: _credentials,
            completedAudits: 0,
            averageScore: 0,
            isActive: false, // Needs approval
            registeredAt: block.timestamp
        });

        emit AuditorRegistered(msg.sender, _name, _credentials);
    }

    /**
     * @dev Approve auditor - Owner only
     */
    function approveAuditor(address _auditor) external onlyOwner {
        require(auditors[_auditor].auditorAddress != address(0), "Auditor not registered");
        approvedAuditors[_auditor] = true;
        auditors[_auditor].isActive = true;
    }

    /**
     * @dev Request audit
     */
    function requestAudit(
        uint256 _targetId,
        AuditType _auditType,
        address _auditor
    ) external payable returns (uint256) {
        require(msg.value >= auditFee, "Insufficient audit fee");
        require(approvedAuditors[_auditor], "Auditor not approved");
        require(auditors[_auditor].isActive, "Auditor not active");

        _auditIds.increment();
        uint256 newAuditId = _auditIds.current();

        string[] memory emptyEvidence;
        audits[newAuditId] = Audit({
            id: newAuditId,
            targetId: _targetId,
            auditType: _auditType,
            status: AuditStatus.Pending,
            auditor: _auditor,
            requester: msg.sender,
            findings: "",
            ipfsReportHash: "",
            score: 0,
            requestedAt: block.timestamp,
            completedAt: 0,
            isPassed: false,
            evidenceHashes: emptyEvidence
        });

        targetAudits[_targetId].push(newAuditId);
        auditorAudits[_auditor].push(newAuditId);

        // Transfer fee to platform
        platformWallet.transfer(msg.value);

        emit AuditRequested(newAuditId, _targetId, _auditType, msg.sender, _auditor);
        return newAuditId;
    }

    /**
     * @dev Start audit - Auditor only
     */
    function startAudit(uint256 _auditId) external auditExists(_auditId) onlyAuditor(_auditId) {
        Audit storage audit = audits[_auditId];
        require(audit.status == AuditStatus.Pending, "Audit not pending");

        audit.status = AuditStatus.InProgress;
    }

    /**
     * @dev Submit audit findings
     */
    function submitAuditFindings(
        uint256 _auditId,
        string memory _findings,
        string memory _ipfsReportHash,
        uint256 _score,
        string[] memory _evidenceHashes
    ) external auditExists(_auditId) onlyAuditor(_auditId) {
        require(_score <= 100, "Score must be 0-100");
        require(bytes(_findings).length > 0, "Findings required");
        require(bytes(_ipfsReportHash).length > 0, "Report hash required");

        Audit storage audit = audits[_auditId];
        require(audit.status == AuditStatus.InProgress, "Audit not in progress");

        audit.status = AuditStatus.Completed;
        audit.findings = _findings;
        audit.ipfsReportHash = _ipfsReportHash;
        audit.score = _score;
        audit.completedAt = block.timestamp;
        audit.isPassed = _score >= MIN_AUDIT_SCORE;
        audit.evidenceHashes = _evidenceHashes;

        // Update auditor statistics
        Auditor storage auditor = auditors[audit.auditor];
        auditor.completedAudits += 1;
        auditor.averageScore = ((auditor.averageScore * (auditor.completedAudits - 1)) + _score) / auditor.completedAudits;

        emit AuditCompleted(_auditId, audit.targetId, _score, audit.isPassed, _ipfsReportHash);
    }

    /**
     * @dev Dispute audit results
     */
    function disputeAudit(uint256 _auditId, string memory _reason) external auditExists(_auditId) {
        Audit storage audit = audits[_auditId];
        require(audit.status == AuditStatus.Completed, "Audit not completed");
        require(
            msg.sender == audit.requester || msg.sender == owner(),
            "Not authorized to dispute"
        );

        audit.status = AuditStatus.Disputed;
        emit AuditDisputed(_auditId, msg.sender, _reason);
    }

    /**
     * @dev Resolve dispute - Owner only
     */
    function resolveDispute(
        uint256 _auditId,
        bool _maintainResult,
        uint256 _newScore
    ) external onlyOwner auditExists(_auditId) {
        Audit storage audit = audits[_auditId];
        require(audit.status == AuditStatus.Disputed, "Audit not disputed");

        if (!_maintainResult) {
            require(_newScore <= 100, "Score must be 0-100");
            audit.score = _newScore;
            audit.isPassed = _newScore >= MIN_AUDIT_SCORE;
        }

        audit.status = AuditStatus.Resolved;
    }

    /**
     * @dev Get audit details
     */
    function getAuditDetails(uint256 _auditId)
        external
        view
        auditExists(_auditId)
        returns (
            uint256 targetId,
            AuditType auditType,
            AuditStatus status,
            address auditor,
            address requester,
            string memory findings,
            string memory ipfsReportHash,
            uint256 score,
            uint256 requestedAt,
            uint256 completedAt,
            bool isPassed
        )
    {
        Audit storage audit = audits[_auditId];
        return (
            audit.targetId,
            audit.auditType,
            audit.status,
            audit.auditor,
            audit.requester,
            audit.findings,
            audit.ipfsReportHash,
            audit.score,
            audit.requestedAt,
            audit.completedAt,
            audit.isPassed
        );
    }

    /**
     * @dev Get audits for target
     */
    function getTargetAudits(uint256 _targetId) external view returns (uint256[] memory) {
        return targetAudits[_targetId];
    }

    /**
     * @dev Get auditor details
     */
    function getAuditorDetails(address _auditor)
        external
        view
        returns (
            string memory name,
            string memory credentials,
            uint256 completedAudits,
            uint256 averageScore,
            bool isActive,
            uint256 registeredAt
        )
    {
        Auditor storage auditor = auditors[_auditor];
        return (
            auditor.name,
            auditor.credentials,
            auditor.completedAudits,
            auditor.averageScore,
            auditor.isActive,
            auditor.registeredAt
        );
    }

    /**
     * @dev Get pending audits for auditor
     */
    function getPendingAudits(address _auditor) external view returns (uint256[] memory) {
        uint256[] memory auditorAuditList = auditorAudits[_auditor];
        uint256 pendingCount = 0;

        // Count pending audits
        for (uint256 i = 0; i < auditorAuditList.length; i++) {
            if (audits[auditorAuditList[i]].status == AuditStatus.Pending) {
                pendingCount++;
            }
        }

        // Build pending audits array
        uint256[] memory pendingAudits = new uint256[](pendingCount);
        uint256 index = 0;

        for (uint256 i = 0; i < auditorAuditList.length; i++) {
            if (audits[auditorAuditList[i]].status == AuditStatus.Pending) {
                pendingAudits[index] = auditorAuditList[i];
                index++;
            }
        }

        return pendingAudits;
    }

    /**
     * @dev Update audit fee - Owner only
     */
    function updateAuditFee(uint256 _newFee) external onlyOwner {
        auditFee = _newFee;
    }

    /**
     * @dev Update platform wallet - Owner only
     */
    function updatePlatformWallet(address payable _newWallet) external onlyOwner {
        platformWallet = _newWallet;
    }

    /**
     * @dev Get audit count
     */
    function getAuditCount() external view returns (uint256) {
        return _auditIds.current();
    }

    /**
     * @dev Emergency withdraw - Owner only
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        platformWallet.transfer(balance);
    }

    /**
     * @dev Fallback function
     */
    receive() external payable {}
}
