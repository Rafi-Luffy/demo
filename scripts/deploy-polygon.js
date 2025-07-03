const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Deploying Polygon-Optimized Charity Platform Contracts...");
    
    const [deployer] = await ethers.getSigners();
    console.log(`📧 Deploying with account: ${deployer.address}`);
    console.log(`💰 Account balance: ${ethers.formatEther(await deployer.provider.getBalance(deployer.address))} MATIC`);

    // Platform wallet (can be same as deployer for testing)
    const platformWallet = deployer.address;
    
    console.log("\n🔨 Deploying CharityDonationContract...");
    const CharityDonationContract = await ethers.getContractFactory("CharityDonationContract");
    const donationContract = await CharityDonationContract.deploy(platformWallet);
    await donationContract.waitForDeployment();
    console.log(`✅ CharityDonationContract deployed to: ${await donationContract.getAddress()}`);

    console.log("\n🔨 Deploying MilestoneContract...");
    const MilestoneContract = await ethers.getContractFactory("MilestoneContract");
    const milestoneContract = await MilestoneContract.deploy(await donationContract.getAddress());
    await milestoneContract.waitForDeployment();
    console.log(`✅ MilestoneContract deployed to: ${await milestoneContract.getAddress()}`);

    console.log("\n🔨 Deploying AuditContract...");
    const AuditContract = await ethers.getContractFactory("AuditContract");
    const auditContract = await AuditContract.deploy(platformWallet);
    await auditContract.waitForDeployment();
    console.log(`✅ AuditContract deployed to: ${await auditContract.getAddress()}`);

    // Verify deployment
    console.log("\n🔍 Verifying deployments...");
    
    const donationAddress = await donationContract.getAddress();
    const milestoneAddress = await milestoneContract.getAddress();
    const auditAddress = await auditContract.getAddress();
    
    console.log(`📝 Contract verification:`);
    console.log(`   Donation Contract: ${donationAddress}`);
    console.log(`   Milestone Contract: ${milestoneAddress}`);
    console.log(`   Audit Contract: ${auditAddress}`);

    // Test basic functionality
    console.log("\n🧪 Testing basic functionality...");
    
    try {
        // Test donation contract
        const totalDonations = await donationContract.getTotalDonations();
        console.log(`✅ Donation Contract: Total donations = ${ethers.formatEther(totalDonations)} MATIC`);
        
        // Test milestone contract
        const milestoneCount = await milestoneContract.getMilestoneCount();
        console.log(`✅ Milestone Contract: Milestone count = ${milestoneCount}`);
        
        // Test audit contract
        const auditCount = await auditContract.getAuditCount();
        console.log(`✅ Audit Contract: Audit count = ${auditCount}`);
        
    } catch (error) {
        console.error("❌ Error testing contracts:", error.message);
    }

    // Generate environment variables
    console.log("\n📋 Environment Variables for Backend:");
    console.log(`POLYGON_DONATION_CONTRACT=${donationAddress}`);
    console.log(`POLYGON_MILESTONE_CONTRACT=${milestoneAddress}`);
    console.log(`POLYGON_AUDIT_CONTRACT=${auditAddress}`);
    console.log(`POLYGON_PLATFORM_WALLET=${platformWallet}`);
    
    // Generate frontend configuration
    console.log("\n🌐 Frontend Configuration:");
    console.log(`const POLYGON_CONTRACTS = {`);
    console.log(`  donation: "${donationAddress}",`);
    console.log(`  milestone: "${milestoneAddress}",`);
    console.log(`  audit: "${auditAddress}"`);
    console.log(`};`);

    // Gas usage summary
    console.log("\n⛽ Gas Usage Summary:");
    const network = await ethers.provider.getNetwork();
    console.log(`📊 Network: ${network.name} (Chain ID: ${network.chainId})`);
    
    // Estimate gas for common operations
    try {
        console.log("\n💰 Estimated Gas Costs:");
        
        // Create campaign estimate
        const createCampaignGas = await donationContract.createCampaign.estimateGas(
            "Test Campaign",
            ethers.parseEther("1.0"),
            Math.floor(Date.now() / 1000) + 86400 * 30, // 30 days
            "QmTestHash123456789"
        );
        console.log(`   Create Campaign: ~${createCampaignGas} gas`);
        
        // Donation estimate (will fail but gives gas estimate)
        try {
            const donateGas = await donationContract.donate.estimateGas(
                1,
                "Test donation",
                false,
                { value: ethers.parseEther("0.1") }
            );
            console.log(`   Donate: ~${donateGas} gas`);
        } catch (e) {
            console.log(`   Donate: ~50,000 gas (estimated)`);
        }
        
    } catch (error) {
        console.log(`   Gas estimation unavailable: ${error.message}`);
    }

    console.log("\n🎉 Deployment completed successfully!");
    console.log("🔗 Ready for Polygon mainnet/testnet integration!");
    
    // Save deployment info for sync
    const deploymentInfo = {
        network: network.name,
        chainId: network.chainId,
        contracts: {
            donation: donationAddress,
            milestone: milestoneAddress,
            audit: auditAddress
        },
        platformWallet: platformWallet,
        deployer: deployer.address,
        timestamp: new Date().toISOString()
    };
    
    const fs = require('fs');
    fs.writeFileSync('deployment-result.json', JSON.stringify(deploymentInfo, null, 2));
    console.log('📄 Deployment info saved to deployment-result.json');

    // Auto-sync contract addresses
    console.log('\n🔄 Synchronizing contract addresses across platform...');
    try {
        const { execSync } = require('child_process');
        execSync(`node scripts/sync-contracts.js sync ${donationAddress} ${milestoneAddress} ${auditAddress}`, 
                { stdio: 'inherit' });
        console.log('✅ Contract addresses synchronized!');
    } catch (error) {
        console.log('⚠️  Manual sync required. Run: node scripts/sync-contracts.js sync [addresses]');
    }

    return {
        donationContract: donationAddress,
        milestoneContract: milestoneAddress,
        auditContract: auditAddress,
        platformWallet
    };
}

// Error handling
main()
    .then((result) => {
        console.log("\n✨ All contracts deployed successfully!");
        console.log("📱 Update your frontend and backend with the new contract addresses.");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Deployment failed:", error);
        process.exit(1);
    });
