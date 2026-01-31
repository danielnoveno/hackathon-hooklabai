// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {HookLabSubscription} from "../src/HookLabSubscription.sol";

contract DeployScript is Script {
    function run() external returns (HookLabSubscription) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        address tokenAddress = vm.envAddress("NEXT_PUBLIC_TOKEN_ADDRESS");
        HookLabSubscription subscription = new HookLabSubscription(tokenAddress);
        
        console.log("HookLabSubscription deployed to:", address(subscription));
        console.log("ETH Price:", subscription.MONTHLY_PRICE_ETH());
        console.log("HOOK Price:", subscription.MONTHLY_PRICE_HOOK());
        console.log("Month duration:", subscription.MONTH_DURATION());
        console.log("Owner:", subscription.owner());
        
        vm.stopBroadcast();
        
        return subscription;
    }
}
