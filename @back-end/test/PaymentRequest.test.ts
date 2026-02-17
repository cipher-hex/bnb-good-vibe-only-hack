import { expect } from "chai";
import { ethers } from "hardhat";
import { PaymentRequest } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("PaymentRequest", function () {
  let paymentRequest: PaymentRequest;
  let owner: HardhatEthersSigner;
  let merchant: HardhatEthersSigner;
  let payer: HardhatEthersSigner;
  let other: HardhatEthersSigner;

  // Test constants
  const USDC_SYMBOL = "USDC";
  const USDT_SYMBOL = "USDT";
  const INVALID_TOKEN_SYMBOL = "INVALID";
  const POLYGON_CHAIN_ID = 137;
  const ETHEREUM_CHAIN_ID = 1;
  const INVALID_CHAIN_ID = 999999;
  const TEST_AMOUNT = ethers.parseUnits("100", 6); // 100 USDC/USDT (6 decimals)

  beforeEach(async function () {
    // Get signers
    [owner, merchant, payer, other] = await ethers.getSigners();

    // Deploy contract
    const PaymentRequestFactory = await ethers.getContractFactory(
      "PaymentRequest"
    );
    paymentRequest = await PaymentRequestFactory.deploy();
    await paymentRequest.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await paymentRequest.owner()).to.equal(owner.address);
    });

    it("Should start with payment ID 1000", async function () {
      expect(await paymentRequest.nextPaymentId()).to.equal(1000);
    });

    it("Should return correct supported tokens and chains", async function () {
      expect(await paymentRequest.isTokenSupported(USDC_SYMBOL)).to.be.true;
      expect(await paymentRequest.isTokenSupported(USDT_SYMBOL)).to.be.true;
      expect(await paymentRequest.isTokenSupported(INVALID_TOKEN_SYMBOL)).to.be
        .false;

      expect(await paymentRequest.isChainSupported(POLYGON_CHAIN_ID)).to.be
        .true;
      expect(await paymentRequest.isChainSupported(ETHEREUM_CHAIN_ID)).to.be
        .true;
      expect(await paymentRequest.isChainSupported(INVALID_CHAIN_ID)).to.be
        .false;
    });
  });

  describe("Payment Request Creation", function () {
    it("Should create a payment request with USDC", async function () {
      const tx = await paymentRequest.createPaymentRequest(
        merchant.address,
        USDC_SYMBOL,
        POLYGON_CHAIN_ID,
        TEST_AMOUNT
      );

      await expect(tx)
        .to.emit(paymentRequest, "PaymentRequestCreated")
        .withArgs(
          1000,
          merchant.address,
          USDC_SYMBOL,
          POLYGON_CHAIN_ID,
          TEST_AMOUNT,
          await getBlockTimestamp()
        );

      const request = await paymentRequest.getPaymentRequest(1000);
      expect(request.merchant).to.equal(merchant.address);
      expect(request.tokenSymbol).to.equal(USDC_SYMBOL);
      expect(request.chainId).to.equal(POLYGON_CHAIN_ID);
      expect(request.amount).to.equal(TEST_AMOUNT);
      expect(request.status).to.equal(0); // Pending
      expect(request.payer).to.equal(ethers.ZeroAddress);
      expect(request.paidAt).to.equal(0);
    });

    it("Should create a payment request with USDT", async function () {
      await expect(
        paymentRequest.createPaymentRequest(
          merchant.address,
          USDT_SYMBOL,
          POLYGON_CHAIN_ID,
          TEST_AMOUNT
        )
      ).to.emit(paymentRequest, "PaymentRequestCreated");
    });

    it("Should increment payment ID for each request", async function () {
      await paymentRequest.createPaymentRequest(
        merchant.address,
        USDC_SYMBOL,
        POLYGON_CHAIN_ID,
        TEST_AMOUNT
      );
      await paymentRequest.createPaymentRequest(
        merchant.address,
        USDT_SYMBOL,
        ETHEREUM_CHAIN_ID,
        TEST_AMOUNT
      );

      expect(await paymentRequest.nextPaymentId()).to.equal(1002);
      expect(await paymentRequest.getCurrentPaymentId()).to.equal(1002);
    });

    it("Should revert with invalid token", async function () {
      await expect(
        paymentRequest.createPaymentRequest(
          merchant.address,
          INVALID_TOKEN_SYMBOL,
          POLYGON_CHAIN_ID,
          TEST_AMOUNT
        )
      ).to.be.revertedWithCustomError(paymentRequest, "InvalidTokenSymbol");
    });

    it("Should revert with invalid chain", async function () {
      await expect(
        paymentRequest.createPaymentRequest(
          merchant.address,
          USDC_SYMBOL,
          INVALID_CHAIN_ID,
          TEST_AMOUNT
        )
      ).to.be.revertedWithCustomError(paymentRequest, "InvalidChainId");
    });

    it("Should revert with zero amount", async function () {
      await expect(
        paymentRequest.createPaymentRequest(
          merchant.address,
          USDC_SYMBOL,
          POLYGON_CHAIN_ID,
          0
        )
      ).to.be.revertedWithCustomError(paymentRequest, "InvalidAmount");
    });

    it("Should revert with zero merchant address", async function () {
      await expect(
        paymentRequest.createPaymentRequest(
          ethers.ZeroAddress,
          USDC_SYMBOL,
          POLYGON_CHAIN_ID,
          TEST_AMOUNT
        )
      ).to.be.revertedWithCustomError(paymentRequest, "InvalidMerchant");
    });
  });

  describe("Payment Request Retrieval", function () {
    beforeEach(async function () {
      await paymentRequest.createPaymentRequest(
        merchant.address,
        USDC_SYMBOL,
        POLYGON_CHAIN_ID,
        TEST_AMOUNT
      );
    });

    it("Should retrieve existing payment request", async function () {
      const request = await paymentRequest.getPaymentRequest(1000);
      expect(request.merchant).to.equal(merchant.address);
      expect(request.tokenSymbol).to.equal(USDC_SYMBOL);
      expect(request.chainId).to.equal(POLYGON_CHAIN_ID);
      expect(request.amount).to.equal(TEST_AMOUNT);
    });

    it("Should revert when retrieving non-existent payment request", async function () {
      await expect(
        paymentRequest.getPaymentRequest(999)
      ).to.be.revertedWithCustomError(paymentRequest, "PaymentRequestNotFound");
    });

    it("Should revert when retrieving payment ID 0", async function () {
      await expect(
        paymentRequest.getPaymentRequest(0)
      ).to.be.revertedWithCustomError(paymentRequest, "PaymentRequestNotFound");
    });

    it("Should check payment existence correctly", async function () {
      expect(await paymentRequest.paymentExists(1)).to.be.true;
      expect(await paymentRequest.paymentExists(0)).to.be.false;
      expect(await paymentRequest.paymentExists(999)).to.be.false;
    });
  });

  describe("Marking Payment as Paid", function () {
    beforeEach(async function () {
      await paymentRequest.createPaymentRequest(
        merchant.address,
        USDC_SYMBOL,
        POLYGON_CHAIN_ID,
        TEST_AMOUNT
      );
    });

    it("Should allow merchant to mark payment as paid", async function () {
      const tx = await paymentRequest
        .connect(merchant)
        .markAsPaid(1000, payer.address);

      await expect(tx)
        .to.emit(paymentRequest, "PaymentFulfilled")
        .withArgs(1000, payer.address, await getBlockTimestamp());

      const request = await paymentRequest.getPaymentRequest(1000);
      expect(request.status).to.equal(1); // Paid
      expect(request.payer).to.equal(payer.address);
      expect(request.paidAt).to.be.greaterThan(0);
    });

    it("Should allow owner to mark payment as paid", async function () {
      await expect(
        paymentRequest.connect(owner).markAsPaid(1000, payer.address)
      ).to.emit(paymentRequest, "PaymentFulfilled");
    });

    it("Should revert when unauthorized user tries to mark as paid", async function () {
      await expect(
        paymentRequest.connect(other).markAsPaid(1000, payer.address)
      ).to.be.revertedWithCustomError(
        paymentRequest,
        "UnauthorizedCancellation"
      );
    });

    it("Should revert when marking non-existent payment as paid", async function () {
      await expect(
        paymentRequest.connect(merchant).markAsPaid(999, payer.address)
      ).to.be.revertedWithCustomError(paymentRequest, "PaymentRequestNotFound");
    });

    it("Should revert when marking already paid request as paid", async function () {
      await paymentRequest.connect(merchant).markAsPaid(1000, payer.address);

      await expect(
        paymentRequest.connect(merchant).markAsPaid(1000, other.address)
      ).to.be.revertedWithCustomError(
        paymentRequest,
        "PaymentAlreadyFulfilled"
      );
    });

    it("Should revert when marking cancelled payment as paid", async function () {
      await paymentRequest.connect(merchant).cancelPaymentRequest(1000);

      await expect(
        paymentRequest.connect(merchant).markAsPaid(1000, payer.address)
      ).to.be.revertedWithCustomError(
        paymentRequest,
        "PaymentAlreadyCancelled"
      );
    });
  });

  describe("Payment Cancellation", function () {
    beforeEach(async function () {
      await paymentRequest.createPaymentRequest(
        merchant.address,
        USDC_SYMBOL,
        POLYGON_CHAIN_ID,
        TEST_AMOUNT
      );
    });

    it("Should allow merchant to cancel payment request", async function () {
      const tx = await paymentRequest
        .connect(merchant)
        .cancelPaymentRequest(1000);

      await expect(tx)
        .to.emit(paymentRequest, "PaymentCancelled")
        .withArgs(1000, await getBlockTimestamp());

      const request = await paymentRequest.getPaymentRequest(1000);
      expect(request.status).to.equal(2); // Cancelled
    });

    it("Should revert when non-merchant tries to cancel", async function () {
      await expect(
        paymentRequest.connect(other).cancelPaymentRequest(1000)
      ).to.be.revertedWithCustomError(
        paymentRequest,
        "UnauthorizedCancellation"
      );
    });

    it("Should revert when cancelling non-existent payment", async function () {
      await expect(
        paymentRequest.connect(merchant).cancelPaymentRequest(999)
      ).to.be.revertedWithCustomError(paymentRequest, "PaymentRequestNotFound");
    });

    it("Should revert when cancelling already paid request", async function () {
      await paymentRequest.connect(merchant).markAsPaid(1000, payer.address);

      await expect(
        paymentRequest.connect(merchant).cancelPaymentRequest(1000)
      ).to.be.revertedWithCustomError(
        paymentRequest,
        "PaymentAlreadyFulfilled"
      );
    });

    it("Should revert when cancelling already cancelled request", async function () {
      await paymentRequest.connect(merchant).cancelPaymentRequest(1000);

      await expect(
        paymentRequest.connect(merchant).cancelPaymentRequest(1000)
      ).to.be.revertedWithCustomError(
        paymentRequest,
        "PaymentAlreadyCancelled"
      );
    });
  });

  describe("Integration Tests", function () {
    it("Should handle multiple payment requests correctly", async function () {
      // Create multiple requests
      await paymentRequest.createPaymentRequest(
        merchant.address,
        USDC_SYMBOL,
        POLYGON_CHAIN_ID,
        TEST_AMOUNT
      );
      await paymentRequest.createPaymentRequest(
        other.address,
        USDT_SYMBOL,
        ETHEREUM_CHAIN_ID,
        TEST_AMOUNT * 2n
      );

      // Fulfill first request
      await paymentRequest.connect(merchant).markAsPaid(1000, payer.address);

      // Cancel second request
      await paymentRequest.connect(other).cancelPaymentRequest(1001);

      // Verify states
      const request1 = await paymentRequest.getPaymentRequest(1000);
      const request2 = await paymentRequest.getPaymentRequest(1001);

      expect(request1.status).to.equal(1); // Paid
      expect(request1.payer).to.equal(payer.address);

      expect(request2.status).to.equal(2); // Cancelled
      expect(request2.payer).to.equal(ethers.ZeroAddress);
    });

    it("Should maintain correct payment ID sequence", async function () {
      const initialId = await paymentRequest.getCurrentPaymentId();

      // Create 3 requests
      for (let i = 0; i < 3; i++) {
        await paymentRequest.createPaymentRequest(
          merchant.address,
          USDC_SYMBOL,
          POLYGON_CHAIN_ID,
          TEST_AMOUNT
        );
      }

      const finalId = await paymentRequest.getCurrentPaymentId();
      expect(finalId).to.equal(initialId + 3n);

      // Verify all requests exist
      expect(await paymentRequest.paymentExists(1)).to.be.true;
      expect(await paymentRequest.paymentExists(2)).to.be.true;
      expect(await paymentRequest.paymentExists(3)).to.be.true;
      expect(await paymentRequest.paymentExists(4)).to.be.false;
    });
  });

  // Helper function to get current block timestamp
  async function getBlockTimestamp(): Promise<number> {
    const block = await ethers.provider.getBlock("latest");
    return block!.timestamp;
  }
});
