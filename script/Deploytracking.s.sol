// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/tracking.sol";

contract DeployTracking is Script {
    function run() external {
        vm.startBroadcast();

        tracking tracker = new tracking();

        console.log("Deployed tracking contract at:", address(tracker));

        vm.stopBroadcast();
    }
}
