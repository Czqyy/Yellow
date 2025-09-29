// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title Channel
 * @dev State channel contract for off-chain micro-payments between project owners and contributors
 */
contract Channel {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;
    
    struct ChannelState {
        uint256 ownerBalance;
        uint256 contributorBalance;
        uint256 nonce;
        bool isFinalized;
    }
    
    address public immutable owner;
    address public immutable contributor;
    IERC20 public token;
    uint256 public immutable challengePeriod;
    
    ChannelState public state;
    uint256 public challengeDeadline;
    address public challenger;
    
    event ChannelOpened(address indexed owner, address indexed contributor, address token, uint256 amount);
    event StateUpdated(uint256 ownerBalance, uint256 contributorBalance, uint256 nonce);
    event ChallengeStarted(address indexed challenger, uint256 deadline);
    event ChannelSettled(uint256 ownerBalance, uint256 contributorBalance);
    event ChannelClosed();
    
    modifier onlyParticipant() {
        require(msg.sender == owner || msg.sender == contributor, "Not a participant");
        _;
    }
    
    modifier onlyDuringChallenge() {
        require(challengeDeadline > 0 && block.timestamp < challengeDeadline, "Not in challenge period");
        _;
    }
    
    modifier onlyAfterChallenge() {
        require(challengeDeadline > 0 && block.timestamp >= challengeDeadline, "Still in challenge period");
        _;
    }
    
    constructor(address _owner, address _contributor) {
        owner = _owner;
        contributor = _contributor;
        challengePeriod = 7 days; // 7 day challenge period
    }
    
    /**
     * @dev Open the channel by depositing tokens
     * @param _token The ERC20 token to use for payments
     * @param amount The amount to deposit
     */
    function openChannel(address _token, uint256 amount) external {
        require(msg.sender == owner, "Only owner can open channel");
        require(address(token) == address(0), "Channel already opened");
        require(amount > 0, "Amount must be positive");
        
        IERC20(_token).safeTransferFrom(owner, address(this), amount);
        token = IERC20(_token);
        
        state.ownerBalance = amount;
        state.contributorBalance = 0;
        state.nonce = 0;
        state.isFinalized = false;
        
        emit ChannelOpened(owner, contributor, _token, amount);
    }
    
    /**
     * @dev Update the channel state with a new signed state
     * @param newOwnerBalance New owner balance
     * @param newContributorBalance New contributor balance
     * @param newNonce New nonce
     * @param ownerSignature Owner's signature of the state
     * @param contributorSignature Contributor's signature of the state
     */
    function updateState(
        uint256 newOwnerBalance,
        uint256 newContributorBalance,
        uint256 newNonce,
        bytes memory ownerSignature,
        bytes memory contributorSignature
    ) external onlyParticipant {
        require(!state.isFinalized, "Channel is finalized");
        require(newNonce > state.nonce, "Nonce must be higher");
        require(newOwnerBalance + newContributorBalance <= state.ownerBalance + state.contributorBalance, "Total balance exceeded");
        
        // Verify signatures
        bytes32 stateHash = keccak256(abi.encodePacked(
            address(this),
            newOwnerBalance,
            newContributorBalance,
            newNonce
        ));
        
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked(
            "\x19Ethereum Signed Message:\n32",
            stateHash
        ));
        
        address ownerSigner = ethSignedMessageHash.recover(ownerSignature);
        address contributorSigner = ethSignedMessageHash.recover(contributorSignature);
        
        require(ownerSigner == owner, "Invalid owner signature");
        require(contributorSigner == contributor, "Invalid contributor signature");
        
        state.ownerBalance = newOwnerBalance;
        state.contributorBalance = newContributorBalance;
        state.nonce = newNonce;
        
        // Reset challenge if any
        challengeDeadline = 0;
        challenger = address(0);
        
        emit StateUpdated(newOwnerBalance, newContributorBalance, newNonce);
    }
    
    /**
     * @dev Start a challenge period for the current state
     */
    function startChallenge() external onlyParticipant {
        require(!state.isFinalized, "Channel is finalized");
        require(challengeDeadline == 0, "Challenge already started");
        
        challengeDeadline = block.timestamp + challengePeriod;
        challenger = msg.sender;
        
        emit ChallengeStarted(msg.sender, challengeDeadline);
    }
    
    /**
     * @dev Settle the channel after challenge period or with final state
     */
    function settle() external {
        require(!state.isFinalized, "Channel already settled");
        
        if (challengeDeadline > 0) {
            require(block.timestamp >= challengeDeadline, "Challenge period not ended");
        }
        
        state.isFinalized = true;
        
        // Transfer balances
        if (state.ownerBalance > 0) {
            token.safeTransfer(owner, state.ownerBalance);
        }
        if (state.contributorBalance > 0) {
            token.safeTransfer(contributor, state.contributorBalance);
        }
        
        emit ChannelSettled(state.ownerBalance, state.contributorBalance);
        emit ChannelClosed();
    }
    
    /**
     * @dev Get the current channel state
     */
    function getState() external view returns (
        uint256 ownerBalance,
        uint256 contributorBalance,
        uint256 nonce,
        bool isFinalized,
        uint256 _challengeDeadline
    ) {
        return (
            state.ownerBalance,
            state.contributorBalance,
            state.nonce,
            state.isFinalized,
            challengeDeadline
        );
    }
}
