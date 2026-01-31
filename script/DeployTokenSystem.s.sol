// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {HookToken} from "../src/HookToken.sol";
import {HookLabSubscription} from "../src/HookLabSubscription.sol";

contract DeployTokenSystem is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Deploy Token
        HookToken token = new HookToken();
        console.log("HookToken deployed to:", address(token));
        
        // 2. Deploy Subscription (V2 with Loyalty)
        HookLabSubscription subscription = new HookLabSubscription(address(token));
        console.log("HookLabSubscription deployed to:", address(subscription));
        
        // 3. Setup Roles
        // Authorize Subscription contract to mint loyalty tokens
        token.addMinter(address(subscription));
        console.log("Authorized Subscription to mint loyalty tokens");
        
        vm.stopBroadcast();
    }
}
