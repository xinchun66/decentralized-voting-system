// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract VotingSystemEnhanced {
    enum ProposalStatus {
        PENDING,
        ACTIVE,
        ENDED,
        CLOSED
    }

    struct Proposal {
        string title;
        string description;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 endTime;
        bool exists;
        ProposalStatus status;
        address creator;
        bool requiresPoints;
        bool useWeight;
        bool realSettlement;
    }

    struct VoteRecord {
        bool voted;
        bool support;
        uint256 weight;
        bool settled;
    }

    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => mapping(address => VoteRecord)) public votes;
    Proposal[] public proposals;
    mapping(address => uint256) public userPoints;
    address public owner;
    mapping(address => bool) public isAdmin;
    uint256 public constant MAX_WEIGHT = 1000;
    bool public paused;

    event ProposalCreated(
        uint256 indexed proposalId,
        string title,
        uint256 endTime,
        address creator,
        bool requiresPoints,
        bool useWeight,
        bool realSettlement
    );
    event ProposalActivated(uint256 indexed proposalId);
    event ProposalClosed(uint256 indexed proposalId);
    event Voted(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight, uint256 stake);
    event VoteSettled(uint256 indexed proposalId, address indexed voter, bool won, int256 pointDelta);
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

    function createProposal(
        string calldata title,
        string calldata description,
        uint256 durationSeconds,
        bool requiresPoints,
        bool useWeight,
        bool realSettlement
    ) external onlyAdmin {
        require(bytes(title).length > 0 && bytes(title).length <= 200, "Invalid title");
        require(bytes(description).length <= 1000, "Description too long");
        require(durationSeconds >= 1 && durationSeconds <= 2592000, "Duration 1s-30d");

        uint256 endTime = block.timestamp + durationSeconds;

        proposals.push(
            Proposal({
                title: title,
                description: description,
                yesVotes: 0,
                noVotes: 0,
                endTime: endTime,
                exists: true,
                status: ProposalStatus.ACTIVE,
                creator: msg.sender,
                requiresPoints: requiresPoints,
                useWeight: useWeight,
                realSettlement: realSettlement
            })
        );

        uint256 proposalId = proposals.length - 1;
        emit ProposalCreated(
            proposalId,
            title,
            endTime,
            msg.sender,
            requiresPoints,
            useWeight,
            realSettlement
        );
        emit ProposalActivated(proposalId);
    }

    function closeProposal(uint256 proposalId) external onlyAdmin proposalExists(proposalId) {
        Proposal storage p = proposals[proposalId];
        require(p.status == ProposalStatus.ACTIVE, "Not active");
        p.status = ProposalStatus.CLOSED;
        emit ProposalClosed(proposalId);
    }

    function _updateProposalStatus(Proposal storage p) private {
        if (p.status == ProposalStatus.ACTIVE && block.timestamp >= p.endTime) {
            p.status = ProposalStatus.ENDED;
        }
    }

    function _marketWinner(Proposal storage p) private view returns (bool yesWins) {
        return p.yesVotes >= p.noVotes;
    }

    function vote(uint256 proposalId, bool support, uint256 weight) external notPaused proposalExists(proposalId) {
        Proposal storage p = proposals[proposalId];

        _updateProposalStatus(p);
        require(p.status == ProposalStatus.ACTIVE, "Voting not available");
        require(!hasVoted[proposalId][msg.sender], "Voted already");
        require(weight >= 1 && weight <= MAX_WEIGHT, "Invalid weight");

        if (!p.useWeight) {
            require(weight == 1, "Weight must be 1");
        }

        uint256 stake = 0;
        if (p.requiresPoints) {
            stake = weight;
            require(userPoints[msg.sender] >= stake, "Insufficient points");
            userPoints[msg.sender] -= stake;
        }

        if (support) {
            p.yesVotes += weight;
        } else {
            p.noVotes += weight;
        }

        hasVoted[proposalId][msg.sender] = true;
        votes[proposalId][msg.sender] = VoteRecord({
            voted: true,
            support: support,
            weight: weight,
            settled: false
        });

        emit Voted(proposalId, msg.sender, support, weight, stake);
    }

    /// @notice 真实链上结算：投票结束后由用户自行领取/扣除积分
    function settle(uint256 proposalId) external notPaused proposalExists(proposalId) {
        Proposal storage p = proposals[proposalId];
        _updateProposalStatus(p);
        require(p.status != ProposalStatus.ACTIVE, "Voting not ended");
        require(p.realSettlement, "Simulated only");

        VoteRecord storage v = votes[proposalId][msg.sender];
        require(v.voted, "Not voted");
        require(!v.settled, "Already settled");

        bool yesWins = _marketWinner(p);
        bool userWon = (v.support && yesWins) || (!v.support && !yesWins);
        int256 delta;

        if (userWon) {
            if (p.requiresPoints) {
                userPoints[msg.sender] += v.weight * 2;
                delta = int256(v.weight * 2);
            } else {
                userPoints[msg.sender] += v.weight;
                delta = int256(v.weight);
            }
        } else {
            if (p.requiresPoints) {
                userPoints[msg.sender] -= v.weight;
                delta = -int256(int256(v.weight));
            } else if (p.useWeight) {
                userPoints[msg.sender] -= v.weight;
                delta = -int256(int256(v.weight));
            } else {
                userPoints[msg.sender] -= 1;
                delta = -1;
            }
        }

        v.settled = true;
        emit VoteSettled(proposalId, msg.sender, userWon, delta);
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

    function getProposalDetail(uint256 proposalId)
        external
        view
        returns (
            string memory title,
            string memory description,
            uint256 yesVotes,
            uint256 noVotes,
            uint256 endTime,
            ProposalStatus status,
            address creator,
            bool requiresPoints,
            bool useWeight,
            bool realSettlement
        )
    {
        Proposal storage p = proposals[proposalId];
        require(p.exists, "Proposal not exist");
        return (
            p.title,
            p.description,
            p.yesVotes,
            p.noVotes,
            p.endTime,
            p.status,
            p.creator,
            p.requiresPoints,
            p.useWeight,
            p.realSettlement
        );
    }

    function getUserVote(uint256 proposalId, address user)
        external
        view
        returns (bool voted, bool support, uint256 weight, bool settled)
    {
        VoteRecord storage v = votes[proposalId][user];
        return (v.voted, v.support, v.weight, v.settled);
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
