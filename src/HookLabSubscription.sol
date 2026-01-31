// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface IHookToken is IERC20 {
    function mint(address to, uint256 amount) external;
}

/**
 * @title HookLabSubscription
 * @notice Handles monthly subscription payments for HookLab AI premium access
 * @dev Supports both ETH and $HOOK token payments. Implements Loyalty Rewards.
 */
contract HookLabSubscription {
    // ============ State Variables ============
    
    uint256 public constant MONTHLY_PRICE_ETH = 0.001 ether;
    uint256 public constant MONTHLY_PRICE_HOOK = 500 * 10**18; // 500 HOOK tokens
    uint256 public constant REWARD_PER_ETH_SUB = 100 * 10**18; // 100 HOOK cashback
    uint256 public constant MONTH_DURATION = 30 days;
    
    IHookToken public immutable hookToken;
    mapping(address => uint256) public premiumExpiry;
    address public owner;
    
    // ============ Events ============
    
    event Subscribed(address indexed user, uint256 expiry, uint256 amount, bool isToken);
    event Withdrawn(address indexed owner, uint256 amount, bool isToken);
    
    // ============ Errors ============
    
    error InsufficientPayment();
    error NotOwner();
    error WithdrawalFailed();
    error TransferFailed();
    
    // ============ Constructor ============
    
    constructor(address _token) {
        owner = msg.sender;
        hookToken = IHookToken(_token);
    }
    
    // ============ External Functions ============
    
    /**
     * @notice Subscribe using ETH and earn 100 $HOOK (Loyalty Reward)
     */
    function subscribeMonthly() external payable {
        if (msg.value < MONTHLY_PRICE_ETH) {
            revert InsufficientPayment();
        }
        _extendSubscription(msg.sender, MONTH_DURATION);
        
        // LOYALTY REWARD: Mint 100 $HOOK to the user
        try hookToken.mint(msg.sender, REWARD_PER_ETH_SUB) {
            // Success
        } catch {
            // If minting fails (e.g. role not set), we still allow the sub to process
        }
        
        emit Subscribed(msg.sender, premiumExpiry[msg.sender], msg.value, false);
    }

    /**
     * @notice Subscribe using $HOOK tokens (Redeem Loyalty)
     */
    function subscribeWithToken() external {
        bool success = hookToken.transferFrom(msg.sender, address(this), MONTHLY_PRICE_HOOK);
        if (!success) revert TransferFailed();

        _extendSubscription(msg.sender, MONTH_DURATION);
        emit Subscribed(msg.sender, premiumExpiry[msg.sender], MONTHLY_PRICE_HOOK, true);
    }
    
    function _extendSubscription(address user, uint256 duration) internal {
        uint256 currentExpiry = premiumExpiry[user];
        if (currentExpiry > block.timestamp) {
            premiumExpiry[user] = currentExpiry + duration;
        } else {
            premiumExpiry[user] = block.timestamp + duration;
        }
    }

    function isPremium(address user) external view returns (bool) {
        return premiumExpiry[user] > block.timestamp;
    }
    
    function withdrawETH() external {
        if (msg.sender != owner) revert NotOwner();
        uint256 balance = address(this).balance;
        (bool success, ) = owner.call{value: balance}("");
        if (!success) revert WithdrawalFailed();
        emit Withdrawn(owner, balance, false);
    }

    function withdrawTokens() external {
        if (msg.sender != owner) revert NotOwner();
        uint256 balance = hookToken.balanceOf(address(this));
        if (!hookToken.transfer(owner, balance)) revert TransferFailed();
        emit Withdrawn(owner, balance, true);
    }

    function getExpiry(address user) external view returns (uint256) {
        return premiumExpiry[user];
    }
}
