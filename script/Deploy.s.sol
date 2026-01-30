// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {HookLabSubscription} from "../src/HookLabSubscription.sol";

contract DeployScript is Script {
    function run() external returns (HookLabSubscription) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        HookLabSubscription subscription = new HookLabSubscription();
        
        console.log("HookLabSubscription deployed to:", address(subscription));
        console.log("Monthly price:", subscription.MONTHLY_PRICE());
        console.log("Month duration:", subscription.MONTH_DURATION());
        console.log("Owner:", subscription.owner());
        
        vm.stopBroadcast();
        
        return subscription;
    }
}
