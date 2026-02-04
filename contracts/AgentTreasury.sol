// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title AgentTreasury
 * @notice Simple smart wallet for AI Agents.
 * @dev Allows the agent controller (owner) to execute arbitrary transactions.
 */
contract AgentTreasury is Ownable {
    using SafeERC20 for IERC20;

    event Execution(address indexed target, uint256 value, bytes data);
    event Received(address indexed sender, uint256 amount);

    constructor(address _owner) Ownable(_owner) {}

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    /**
     * @notice Execute a generic call.
     * @param target Contract or address to call.
     * @param value Native token value to send.
     * @param data Calldata.
     */
    function execute(
        address target,
        uint256 value,
        bytes calldata data
    ) external onlyOwner returns (bytes memory) {
        (bool success, bytes memory result) = target.call{value: value}(data);
        require(success, "Execution failed");
        emit Execution(target, value, data);
        return result;
    }

    /**
     * @notice Helper to approve a spender.
     */
    function approveToken(
        address token,
        address spender,
        uint256 amount
    ) external onlyOwner {
        IERC20(token).forceApprove(spender, amount);
    }
}
