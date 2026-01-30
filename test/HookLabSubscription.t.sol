// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {HookLabSubscription} from "../src/HookLabSubscription.sol";

contract HookLabSubscriptionTest is Test {
    HookLabSubscription public subscription;
    
    address public owner;
    address public user1;
    address public user2;
    
    uint256 constant MONTHLY_PRICE = 0.001 ether;
    uint256 constant MONTH_DURATION = 30 days;
    
    event Subscribed(address indexed user, uint256 expiry, uint256 amount);
    event Withdrawn(address indexed owner, uint256 amount);
    
    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        
        subscription = new HookLabSubscription();
        
        // Fund test users
        vm.deal(user1, 10 ether);
        vm.deal(user2, 10 ether);
    }
    
    // Receive function to accept ETH from withdrawals
    receive() external payable {}
    
    // ============ Subscription Tests ============
    
    function test_SubscribeMonthly() public {
        vm.startPrank(user1);
        
        uint256 expectedExpiry = block.timestamp + MONTH_DURATION;
        
        vm.expectEmit(true, false, false, true);
        emit Subscribed(user1, expectedExpiry, MONTHLY_PRICE);
        
        subscription.subscribeMonthly{value: MONTHLY_PRICE}();
        
        assertTrue(subscription.isPremium(user1));
        assertEq(subscription.getExpiry(user1), expectedExpiry);
        
        vm.stopPrank();
    }
    
    function test_SubscribeMonthly_RevertsOnInsufficientPayment() public {
        vm.startPrank(user1);
        
        vm.expectRevert(HookLabSubscription.InsufficientPayment.selector);
        subscription.subscribeMonthly{value: 0.0001 ether}();
        
        vm.stopPrank();
    }
    
    function test_SubscribeMonthly_ExtendsExistingSubscription() public {
        vm.startPrank(user1);
        
        // First subscription
        subscription.subscribeMonthly{value: MONTHLY_PRICE}();
        uint256 firstExpiry = subscription.getExpiry(user1);
        
        // Second subscription (should extend from first expiry)
        subscription.subscribeMonthly{value: MONTHLY_PRICE}();
        uint256 secondExpiry = subscription.getExpiry(user1);
        
        assertEq(secondExpiry, firstExpiry + MONTH_DURATION);
        assertTrue(subscription.isPremium(user1));
        
        vm.stopPrank();
    }
    
    function test_SubscribeMonthly_AcceptsExcessPayment() public {
        vm.startPrank(user1);
        
        subscription.subscribeMonthly{value: 1 ether}();
        
        assertTrue(subscription.isPremium(user1));
        assertEq(subscription.getBalance(), 1 ether);
        
        vm.stopPrank();
    }
    
    // ============ Premium Status Tests ============
    
    function test_IsPremium_ReturnsFalseForNonSubscriber() public view {
        assertFalse(subscription.isPremium(user1));
    }
    
    function test_IsPremium_ReturnsTrueForActiveSubscriber() public {
        vm.prank(user1);
        subscription.subscribeMonthly{value: MONTHLY_PRICE}();
        
        assertTrue(subscription.isPremium(user1));
    }
    
    function test_IsPremium_ReturnsFalseAfterExpiry() public {
        vm.prank(user1);
        subscription.subscribeMonthly{value: MONTHLY_PRICE}();
        
        // Fast forward past expiry
        vm.warp(block.timestamp + MONTH_DURATION + 1);
        
        assertFalse(subscription.isPremium(user1));
    }
    
    function test_IsPremium_MultipleUsers() public {
        vm.prank(user1);
        subscription.subscribeMonthly{value: MONTHLY_PRICE}();
        
        assertTrue(subscription.isPremium(user1));
        assertFalse(subscription.isPremium(user2));
        
        vm.prank(user2);
        subscription.subscribeMonthly{value: MONTHLY_PRICE}();
        
        assertTrue(subscription.isPremium(user1));
        assertTrue(subscription.isPremium(user2));
    }
    
    // ============ Expiry Tests ============
    
    function test_GetExpiry_ReturnsZeroForNonSubscriber() public view {
        assertEq(subscription.getExpiry(user1), 0);
    }
    
    function test_GetExpiry_ReturnsCorrectTimestamp() public {
        vm.prank(user1);
        subscription.subscribeMonthly{value: MONTHLY_PRICE}();
        
        uint256 expectedExpiry = block.timestamp + MONTH_DURATION;
        assertEq(subscription.getExpiry(user1), expectedExpiry);
    }
    
    // ============ Withdrawal Tests ============
    
    function test_Withdraw_OwnerCanWithdraw() public {
        // User subscribes
        vm.prank(user1);
        subscription.subscribeMonthly{value: MONTHLY_PRICE}();
        
        uint256 ownerBalanceBefore = owner.balance;
        uint256 contractBalance = subscription.getBalance();
        
        vm.expectEmit(true, false, false, true);
        emit Withdrawn(owner, contractBalance);
        
        subscription.withdraw();
        
        assertEq(subscription.getBalance(), 0);
        assertEq(owner.balance, ownerBalanceBefore + contractBalance);
    }
    
    function test_Withdraw_RevertsForNonOwner() public {
        vm.prank(user1);
        subscription.subscribeMonthly{value: MONTHLY_PRICE}();
        
        vm.prank(user2);
        vm.expectRevert(HookLabSubscription.NotOwner.selector);
        subscription.withdraw();
    }
    
    function test_Withdraw_MultipleSubscriptions() public {
        vm.prank(user1);
        subscription.subscribeMonthly{value: MONTHLY_PRICE}();
        
        vm.prank(user2);
        subscription.subscribeMonthly{value: MONTHLY_PRICE}();
        
        assertEq(subscription.getBalance(), MONTHLY_PRICE * 2);
        
        subscription.withdraw();
        
        assertEq(subscription.getBalance(), 0);
    }
    
    // ============ Edge Cases ============
    
    function test_SubscribeAfterExpiry_StartsNewSubscription() public {
        vm.startPrank(user1);
        
        // First subscription
        subscription.subscribeMonthly{value: MONTHLY_PRICE}();
        
        // Fast forward past expiry
        vm.warp(block.timestamp + MONTH_DURATION + 1 days);
        
        assertFalse(subscription.isPremium(user1));
        
        // Subscribe again
        subscription.subscribeMonthly{value: MONTHLY_PRICE}();
        
        uint256 expectedExpiry = block.timestamp + MONTH_DURATION;
        assertEq(subscription.getExpiry(user1), expectedExpiry);
        assertTrue(subscription.isPremium(user1));
        
        vm.stopPrank();
    }
    
    function test_GetBalance_ReturnsCorrectAmount() public {
        assertEq(subscription.getBalance(), 0);
        
        vm.prank(user1);
        subscription.subscribeMonthly{value: MONTHLY_PRICE}();
        
        assertEq(subscription.getBalance(), MONTHLY_PRICE);
    }
    
    // ============ Fuzz Tests ============
    
    function testFuzz_SubscribeMonthly(uint256 payment) public {
        vm.assume(payment >= MONTHLY_PRICE);
        vm.assume(payment <= 100 ether);
        
        vm.deal(user1, payment);
        
        vm.prank(user1);
        subscription.subscribeMonthly{value: payment}();
        
        assertTrue(subscription.isPremium(user1));
        assertEq(subscription.getBalance(), payment);
    }
    
    function testFuzz_IsPremium_AfterTimeWarp(uint256 timeWarp) public {
        vm.assume(timeWarp > 0);
        vm.assume(timeWarp < 365 days);
        
        vm.prank(user1);
        subscription.subscribeMonthly{value: MONTHLY_PRICE}();
        
        vm.warp(block.timestamp + timeWarp);
        
        if (timeWarp < MONTH_DURATION) {
            assertTrue(subscription.isPremium(user1));
        } else {
            assertFalse(subscription.isPremium(user1));
        }
    }
}
