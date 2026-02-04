// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ProtocolFeeRouter
 * @notice Central payment infrastructure for ClawWorks agent economy.
 * @dev Handles payments between agents/users with protocol fee deduction.
 *      Design Philosophy: Simple, Auditable, Real Money Flow.
 */
contract ProtocolFeeRouter is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // --- State Variables ---

    IERC20 public immutable paymentToken; // AUSD
    address public protocolTreasury;
    uint256 public protocolFeeBps; // Basis points (e.g., 1500 = 15%)

    uint256 public constant MAX_BPS = 10000;

    // --- Events ---

    event PaymentProcessed(
        address indexed payer,
        address indexed recipient,
        uint256 grossAmount,
        uint256 feeAmount,
        uint256 netAmount,
        string referenceId
    );

    event ProtocolSettingsUpdated(
        address indexed newTreasury,
        uint256 newFeeBps
    );

    // --- Constructor ---

    constructor(
        address _paymentToken,
        address _protocolTreasury,
        uint256 _protocolFeeBps
    ) Ownable(msg.sender) {
        require(_paymentToken != address(0), "Invalid token");
        require(_protocolTreasury != address(0), "Invalid treasury");
        require(_protocolFeeBps <= 1500, "Fee too high"); // Max 15%

        paymentToken = IERC20(_paymentToken);
        protocolTreasury = _protocolTreasury;
        protocolFeeBps = _protocolFeeBps;
    }

    // --- Core Logic ---

    /**
     * @notice Execute a payment from msg.sender to a recipient agent.
     * @param recipient The agent/address receiving funds.
     * @param amount The gross amount of AUSD to pay.
     * @param referenceId metadata/jobID for the payment.
     */
    function processPayment(
        address recipient,
        uint256 amount,
        string calldata referenceId
    ) external nonReentrant {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Zero amount");

        // Calculate Fee
        uint256 fee = (amount * protocolFeeBps) / MAX_BPS;
        uint256 net = amount - fee;

        // Transfer from Payer (msg.sender)
        // Payer must have approved this contract.
        // We use transferFrom to pull funds.
        paymentToken.safeTransferFrom(msg.sender, address(this), amount);

        // Disburse Fee
        if (fee > 0) {
            paymentToken.safeTransfer(protocolTreasury, fee);
        }

        // Disburse Payment
        paymentToken.safeTransfer(recipient, net);

        emit PaymentProcessed(
            msg.sender,
            recipient,
            amount,
            fee,
            net,
            referenceId
        );
    }

    // --- Admin ---

    function updateProtocolSettings(
        address _protocolTreasury,
        uint256 _protocolFeeBps
    ) external onlyOwner {
        require(_protocolTreasury != address(0), "Invalid treasury");
        require(_protocolFeeBps <= 1500, "Fee too high");
        
        protocolTreasury = _protocolTreasury;
        protocolFeeBps = _protocolFeeBps;

        emit ProtocolSettingsUpdated(_protocolTreasury, _protocolFeeBps);
    }
}
