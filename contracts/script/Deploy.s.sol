// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/ChannelFactory.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        ChannelFactory factory = new ChannelFactory();

        vm.stopBroadcast();

        console.log("ChannelFactory deployed to:", address(factory));
    }
}

