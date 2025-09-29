// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Channel.sol";

/**
 * @title ChannelFactory
 * @dev Factory contract for creating state channels between project owners and contributors
 */
contract ChannelFactory {
    mapping(address => mapping(address => address)) public channels;
    mapping(address => bool) public isChannel;
    
    event ChannelCreated(address indexed owner, address indexed contributor, address channel);
    
    /**
     * @dev Create a new state channel between owner and contributor
     * @param contributor The address of the contributor
     * @return channel The address of the created channel
     */
    function createChannel(address contributor) external returns (address channel) {
        require(contributor != address(0), "Invalid contributor address");
        require(channels[msg.sender][contributor] == address(0), "Channel already exists");
        
        channel = address(new Channel(msg.sender, contributor));
        channels[msg.sender][contributor] = channel;
        isChannel[channel] = true;
        
        emit ChannelCreated(msg.sender, contributor, channel);
    }
    
    /**
     * @dev Get the channel address for a given owner-contributor pair
     * @param owner The project owner address
     * @param contributor The contributor address
     * @return The channel address, or address(0) if not found
     */
    function getChannel(address owner, address contributor) external view returns (address) {
        return channels[owner][contributor];
    }
}

