// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/**
 * @title HookLabSubscription
 * @notice Handles monthly subscription payments for HookLab AI premium access
 * @dev This contract ONLY manages subscriptions and premium status.
 *      It does NOT handle: AI, quota, or content.
 */
contract HookLabSubscription {
    // ============ State Variables ============
    
    /// @notice Monthly subscription price (0.001 ETH for hackathon demo)
    uint256 public constant MONTHLY_PRICE = 0.001 ether;
    
    /// @notice Duration of one month in seconds (30 days)
    uint256 public constant MONTH_DURATION = 30 days;
    
    /// @notice Mapping of user address to premium expiry timestamp
    mapping(address => uint256) public premiumExpiry;
    
    /// @notice Contract owner (for withdrawals)
    address public owner;
    
    // ============ Events ============
    
    /// @notice Emitted when a user subscribes
    /// @param user Address of the subscriber
    /// @param expiry Timestamp when premium expires
    /// @param amount Amount paid
    event Subscribed(address indexed user, uint256 expiry, uint256 amount);
    
    /// @notice Emitted when owner withdraws funds
    /// @param owner Address of the owner
    /// @param amount Amount withdrawn
    event Withdrawn(address indexed owner, uint256 amount);
    
    // ============ Errors ============
    
    error InsufficientPayment();
    error NotOwner();
    error WithdrawalFailed();
    
    // ============ Constructor ============
    
    constructor() {
        owner = msg.sender;
    }
    
    // ============ External Functions ============
    
    /**
     * @notice Subscribe to monthly premium access
     * @dev Extends existing subscription or starts new one
     *      Follows x402 payment standard (simple payable function)
     */
    function subscribeMonthly() external payable {
        if (msg.value < MONTHLY_PRICE) {
            revert InsufficientPayment();
        }
        
        uint256 currentExpiry = premiumExpiry[msg.sender];
        uint256 newExpiry;
        
        // If already premium, extend from current expiry
        // Otherwise, extend from now
        if (currentExpiry > block.timestamp) {
            newExpiry = currentExpiry + MONTH_DURATION;
        } else {
            newExpiry = block.timestamp + MONTH_DURATION;
        }
        
        premiumExpiry[msg.sender] = newExpiry;
        
        emit Subscribed(msg.sender, newExpiry, msg.value);
    }
    
    /**
     * @notice Check if a user has active premium subscription
     * @param user Address to check
     * @return bool True if user is premium, false otherwise
     */
    function isPremium(address user) external view returns (bool) {
        return premiumExpiry[user] > block.timestamp;
    }
    
    /**
     * @notice Get premium expiry timestamp for a user
     * @param user Address to check
     * @return uint256 Expiry timestamp (0 if never subscribed)
     */
    function getExpiry(address user) external view returns (uint256) {
        return premiumExpiry[user];
    }
    
    /**
     * @notice Owner can withdraw collected subscription fees
     * @dev Only callable by contract owner
     */
    function withdraw() external {
        if (msg.sender != owner) {
            revert NotOwner();
        }
        
        uint256 balance = address(this).balance;
        
        (bool success, ) = owner.call{value: balance}("");
        if (!success) {
            revert WithdrawalFailed();
        }
        
        emit Withdrawn(owner, balance);
    }
    
    /**
     * @notice Get contract balance
     * @return uint256 Current contract balance
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
