// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/ChannelFactory.sol";
import "../src/Channel.sol";
import "../src/MockERC20.sol";

contract ChannelTest is Test {
    ChannelFactory public factory;
    MockERC20 public token;
    address public owner;
    address public contributor;
    Channel public channel;
    
    // Private keys for test addresses
    uint256 private ownerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80; // address(0x1)
    uint256 private contributorPrivateKey = 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d; // address(0x2)
    
    function setUp() public {
        factory = new ChannelFactory();
        token = new MockERC20("Test Token", "TEST");
        owner = vm.addr(ownerPrivateKey);
        contributor = vm.addr(contributorPrivateKey);
        
        // Mint tokens to owner
        token.mint(owner, 1000 ether);
        
        // Create channel
        vm.prank(owner);
        address channelAddress = factory.createChannel(contributor);
        channel = Channel(channelAddress);
    }
    
    function testChannelCreation() public {
        assertEq(channel.owner(), owner);
        assertEq(channel.contributor(), contributor);
        assertEq(factory.getChannel(owner, contributor), address(channel));
    }
    
    function testOpenChannel() public {
        uint256 depositAmount = 100 ether;
        
        vm.startPrank(owner);
        token.approve(address(channel), depositAmount);
        channel.openChannel(address(token), depositAmount);
        vm.stopPrank();
        
        (uint256 ownerBalance, uint256 contributorBalance, uint256 nonce, bool isFinalized,) = channel.getState();
        assertEq(ownerBalance, depositAmount);
        assertEq(contributorBalance, 0);
        assertEq(nonce, 0);
        assertFalse(isFinalized);
    }
    
    function testUpdateState() public {
        // First open channel
        uint256 depositAmount = 100 ether;
        vm.startPrank(owner);
        token.approve(address(channel), depositAmount);
        channel.openChannel(address(token), depositAmount);
        vm.stopPrank();
        
        // Create new state: owner keeps 80, contributor gets 20
        uint256 newOwnerBalance = 80 ether;
        uint256 newContributorBalance = 20 ether;
        uint256 newNonce = 1;
        
        // Sign the state update
        bytes32 stateHash = keccak256(abi.encodePacked(
            address(channel),
            newOwnerBalance,
            newContributorBalance,
            newNonce
        ));
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked(
            "\x19Ethereum Signed Message:\n32",
            stateHash
        ));
        
        (uint8 v1, bytes32 r1, bytes32 s1) = vm.sign(ownerPrivateKey, ethSignedMessageHash);
        (uint8 v2, bytes32 r2, bytes32 s2) = vm.sign(contributorPrivateKey, ethSignedMessageHash);
        
        bytes memory ownerSignature = abi.encodePacked(r1, s1, v1);
        bytes memory contributorSignature = abi.encodePacked(r2, s2, v2);
        
        // Update state (call as owner)
        vm.prank(owner);
        channel.updateState(
            newOwnerBalance,
            newContributorBalance,
            newNonce,
            ownerSignature,
            contributorSignature
        );
        
        (uint256 ownerBalance, uint256 contributorBalance, uint256 nonce, bool isFinalized,) = channel.getState();
        assertEq(ownerBalance, newOwnerBalance);
        assertEq(contributorBalance, newContributorBalance);
        assertEq(nonce, newNonce);
    }
    
    function testSettleChannel() public {
        // Open channel and update state
        uint256 depositAmount = 100 ether;
        vm.startPrank(owner);
        token.approve(address(channel), depositAmount);
        channel.openChannel(address(token), depositAmount);
        vm.stopPrank();
        
        // Update state
        uint256 newOwnerBalance = 80 ether;
        uint256 newContributorBalance = 20 ether;
        uint256 newNonce = 1;
        
        bytes32 stateHash = keccak256(abi.encodePacked(
            address(channel),
            newOwnerBalance,
            newContributorBalance,
            newNonce
        ));
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked(
            "\x19Ethereum Signed Message:\n32",
            stateHash
        ));
        
        (uint8 v1, bytes32 r1, bytes32 s1) = vm.sign(ownerPrivateKey, ethSignedMessageHash);
        (uint8 v2, bytes32 r2, bytes32 s2) = vm.sign(contributorPrivateKey, ethSignedMessageHash);
        
        bytes memory ownerSignature = abi.encodePacked(r1, s1, v1);
        bytes memory contributorSignature = abi.encodePacked(r2, s2, v2);
        
        vm.prank(owner);
        channel.updateState(
            newOwnerBalance,
            newContributorBalance,
            newNonce,
            ownerSignature,
            contributorSignature
        );
        
        // Settle channel
        vm.prank(owner);
        channel.settle();
        
        (,,, bool isFinalized,) = channel.getState();
        assertTrue(isFinalized);
        assertEq(token.balanceOf(owner), 1000 ether - 100 ether + 80 ether);
        assertEq(token.balanceOf(contributor), 20 ether);
    }
}