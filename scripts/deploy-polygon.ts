import { ethers } from "hardhat";
import { DilSeDaanContract } from "../typechain-types";

async function main() {
  console.log("🚀 Deploying DilSeDaan Contract to Polygon...");

  // Get the contract factory
  const DilSeDaanContract = await ethers.getContractFactory("DilSeDaanContract");

  // Set the fee recipient (you can change this to your address)
  const [deployer] = await ethers.getSigners();
  const feeRecipient = deployer.address;

  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());
  console.log("Fee recipient:", feeRecipient);

  // Deploy the contract
  const dilSeDaan = await DilSeDaanContract.deploy(feeRecipient);
  await dilSeDaan.deployed();

  console.log("✅ DilSeDaan Contract deployed to:", dilSeDaan.address);

  // Create some sample data
  console.log("📝 Creating sample campaigns...");

  const sampleCampaigns = [
    {
      title: "Feed 1000 Children in Delhi",
      description: "Help us provide nutritious meals to underprivileged children in Delhi slums",
      targetAmount: ethers.utils.parseEther("10"), // 10 MATIC
      deadline: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
      category: 2, // FOOD_NUTRITION
      ipfsHash: "QmYourIPFSHash1",
      location: "Delhi, India",
      beneficiaryCount: 1000
    },
    {
      title: "Education for Rural Girls",
      description: "Support education initiatives for girls in rural Rajasthan",
      targetAmount: ethers.utils.parseEther("25"), // 25 MATIC
      deadline: Math.floor(Date.now() / 1000) + (60 * 24 * 60 * 60), // 60 days
      category: 0, // EDUCATION
      ipfsHash: "QmYourIPFSHash2",
      location: "Rajasthan, India",
      beneficiaryCount: 500
    },
    {
      title: "Medical Emergency Fund",
      description: "Emergency medical assistance for families who cannot afford treatment",
      targetAmount: ethers.utils.parseEther("50"), // 50 MATIC
      deadline: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60), // 90 days
      category: 1, // HEALTHCARE
      ipfsHash: "QmYourIPFSHash3",
      location: "Mumbai, India",
      beneficiaryCount: 200
    }
  ];

  for (let i = 0; i < sampleCampaigns.length; i++) {
    const campaign = sampleCampaigns[i];
    const tx = await dilSeDaan.createCampaign(
      campaign.title,
      campaign.description,
      campaign.targetAmount,
      campaign.deadline,
      campaign.category,
      campaign.ipfsHash,
      campaign.location,
      campaign.beneficiaryCount
    );
    await tx.wait();
    console.log(`✅ Created campaign ${i + 1}: ${campaign.title}`);
  }

  // Create sample milestones
  console.log("📊 Creating sample milestones...");
  
  const milestone1 = await dilSeDaan.createMilestone(
    1, // Campaign ID
    "Purchase Food Supplies",
    "Buy rice, dal, and vegetables for 500 meals",
    ethers.utils.parseEther("5"),
    Math.floor(Date.now() / 1000) + (10 * 24 * 60 * 60) // 10 days
  );
  await milestone1.wait();
  console.log("✅ Created milestone 1");

  const milestone2 = await dilSeDaan.createMilestone(
    1, // Campaign ID
    "Distribute Meals",
    "Distribute meals to children in 5 locations",
    ethers.utils.parseEther("5"),
    Math.floor(Date.now() / 1000) + (20 * 24 * 60 * 60) // 20 days
  );
  await milestone2.wait();
  console.log("✅ Created milestone 2");

  // Make a sample donation
  console.log("💰 Making sample donation...");
  const donationTx = await dilSeDaan.donate(
    1, // Campaign ID
    "Hope this helps feed the children! 🙏",
    false, // Not anonymous
    ethers.constants.AddressZero, // MATIC donation
    { value: ethers.utils.parseEther("1") } // 1 MATIC
  );
  await donationTx.wait();
  console.log("✅ Made sample donation");

  // Verify deployer as creator
  const verifyTx = await dilSeDaan.verifyCreator(deployer.address);
  await verifyTx.wait();
  console.log("✅ Verified deployer as creator");

  console.log("\n🎉 Deployment completed successfully!");
  console.log("📋 Contract Details:");
  console.log("- Address:", dilSeDaan.address);
  console.log("- Network: Polygon");
  console.log("- Platform Fee: 2.5%");
  console.log("- Supported Tokens: MATIC, USDC, USDT");

  // Save deployment info
  const deploymentInfo = {
    network: "polygon",
    contractAddress: dilSeDaan.address,
    deployerAddress: deployer.address,
    deploymentTime: new Date().toISOString(),
    sampleCampaigns: sampleCampaigns.length,
    sampleMilestones: 2,
    sampleDonations: 1
  };

  console.log("\n📄 Deployment Info:", JSON.stringify(deploymentInfo, null, 2));

  return dilSeDaan;
}

main()
  .then((contract) => {
    console.log("✅ Deployment script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
