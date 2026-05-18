// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract VotingSystemEnhanced {
    // ========== 状态枚举（放在最前面） ==========
    enum ProposalStatus {
        PENDING,
        ACTIVE,
        ENDED,
        CLOSED
    }

    // ========== 数据结构 ==========
    struct Proposal {
        string title;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 endTime;
        bool exists;
        ProposalStatus status;
        address creator;
        bool requiresPoints;   // true: 投票需要消耗1积分, false: 免费投票
    }

    mapping(uint256 => mapping(address => bool)) public hasVoted;
    Proposal[] public proposals;
    mapping(address => uint256) public userPoints;
    address public owner;

    mapping(address => bool) public isAdmin;
    uint256 public constant VOTE_COST = 1;
    bool public paused;

    event ProposalCreated(uint256 indexed proposalId, string title, uint256 endTime, address creator, bool requiresPoints);
    event ProposalActivated(uint256 indexed proposalId);
    event ProposalClosed(uint256 indexed proposalId);
    event Voted(uint256 indexed proposalId, address indexed voter, bool support, uint256 pointsUsed);
    event PointsMinted(address indexed to, uint256 amount);
    event PointsTransfered(address indexed from, address indexed to, uint256 amount);
    event PointsBurned(address indexed from, uint256 amount);
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    event SystemPaused(bool paused);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == owner || isAdmin[msg.sender], "Not admin");
        _;
    }

    modifier notPaused() {
        require(!paused, "System paused");
        _;
    }

    modifier proposalExists(uint256 proposalId) {
        require(proposalId < proposals.length && proposals[proposalId].exists, "Proposal not exist");
        _;
    }

    constructor() {
        owner = msg.sender;
        userPoints[msg.sender] = 1000;
        isAdmin[msg.sender] = true;
    }

    function addAdmin(address admin) external onlyOwner {
        require(admin != address(0), "Invalid address");
        isAdmin[admin] = true;
        emit AdminAdded(admin);
    }

    function removeAdmin(address admin) external onlyOwner {
        isAdmin[admin] = false;
        emit AdminRemoved(admin);
    }

    function togglePause() external onlyOwner {
        paused = !paused;
        emit SystemPaused(paused);
    }
    
    // ========== 创建提案（指定是否需要积分） ==========
    function createProposal(string calldata title, uint256 durationHours, bool usePoints) external onlyAdmin {
        require(bytes(title).length > 0 && bytes(title).length <= 200, "Invalid title");
        require(durationHours >= 1 && durationHours <= 720, "Duration 1h-30d");

        uint256 endTime = block.timestamp + (durationHours * 3600);
        
        proposals.push(Proposal({
            title: title,
            yesVotes: 0,
            noVotes: 0,
            endTime: endTime,
            exists: true,
            status: ProposalStatus.ACTIVE,
            creator: msg.sender,
            requiresPoints: usePoints
        }));

        uint256 proposalId = proposals.length - 1;
        emit ProposalCreated(proposalId, title, endTime, msg.sender, usePoints);
        emit ProposalActivated(proposalId);
    }
    function closeProposal(uint256 proposalId) external onlyAdmin proposalExists(proposalId) {
        Proposal storage p = proposals[proposalId];
        require(p.status == ProposalStatus.ACTIVE, "Not active");
        
        p.status = ProposalStatus.CLOSED;
        emit ProposalClosed(proposalId);
    }

    // 修复：移除 view 关键字，因为此函数会修改状态
    function _updateProposalStatus(Proposal storage p) private {
        if (p.status == ProposalStatus.ACTIVE && block.timestamp >= p.endTime) {
            p.status = ProposalStatus.ENDED;
        }
    }

    function vote(uint256 proposalId, bool support) external notPaused proposalExists(proposalId) {
        Proposal storage p = proposals[proposalId];
        
        _updateProposalStatus(p);
        require(p.status == ProposalStatus.ACTIVE, "Voting not available");
        require(!hasVoted[proposalId][msg.sender], "Voted already");

        // 只有需要积分的提案才检查并扣除积分
        if (p.requiresPoints) {
            require(userPoints[msg.sender] >= VOTE_COST, "Insufficient points");
            userPoints[msg.sender] -= VOTE_COST;
        }

        if (support) {
            p.yesVotes += VOTE_COST;
        } else {
            p.noVotes += VOTE_COST;
        }

        hasVoted[proposalId][msg.sender] = true;

        emit Voted(proposalId, msg.sender, support, p.requiresPoints ? VOTE_COST : 0);
    }

    function mintPoints(address to) external onlyAdmin {
        mintPoints(to, 10);
    }

    function mintPoints(address to, uint256 amount) public onlyAdmin {
        require(to != address(0), "Invalid address");
        require(amount > 0 && amount <= 10000, "Amount limit");
        userPoints[to] += amount;
        emit PointsMinted(to, amount);
    }

    function transferPoints(address to, uint256 amount) external notPaused {
        require(to != msg.sender && to != address(0), "Invalid transfer");
        require(userPoints[msg.sender] >= amount, "Insufficient points");
        
        userPoints[msg.sender] -= amount;
        userPoints[to] += amount;
        
        emit PointsTransfered(msg.sender, to, amount);
    }

    function burnPoints(uint256 amount) external {
        require(userPoints[msg.sender] >= amount, "Insufficient points");
        userPoints[msg.sender] -= amount;
        emit PointsBurned(msg.sender, amount);
    }

    function getProposalCount() external view returns (uint256) {
        return proposals.length;
    }

    function getProposalDetail(uint256 proposalId) external view returns (
        string memory title,
        uint256 yesVotes,
        uint256 noVotes,
        uint256 endTime,
        ProposalStatus status,
        address creator,
        bool requiresPoints
    ) {
        Proposal storage p = proposals[proposalId];
        require(p.exists, "Proposal not exist");
        return (p.title, p.yesVotes, p.noVotes, p.endTime, p.status, p.creator, p.requiresPoints);
    }

    function getVoteRate(uint256 proposalId) external view returns (uint256, uint256) {
        Proposal storage p = proposals[proposalId];
        require(p.exists, "Proposal not exist");
        
        uint256 total = p.yesVotes + p.noVotes;
        if (total == 0) return (50, 50);
        
        uint256 yesRate = (p.yesVotes * 100) / total;
        return (yesRate, 100 - yesRate);
    }

    function checkUserVoteStatus(uint256 proposalId, address user) external view returns (bool) {
        return hasVoted[proposalId][user];
    }

    function getProposalStatus(uint256 proposalId) external view proposalExists(proposalId) returns (ProposalStatus) {
        Proposal storage p = proposals[proposalId];
        if (p.status == ProposalStatus.ACTIVE && block.timestamp >= p.endTime) {
            return ProposalStatus.ENDED;
        }
        return p.status;
    }
}