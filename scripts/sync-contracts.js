#!/usr/bin/env node

/**
 * Contract Address Synchronization Utility
 * Ensures all contract addresses are synchronized across frontend, backend, and config files
 */

const fs = require('fs');
const path = require('path');

// Contract address configuration
const CONTRACT_CONFIG = {
  // These will be populated after deployment
  DONATION_CONTRACT_ADDRESS: process.env.DONATION_CONTRACT_ADDRESS || '',
  MILESTONE_CONTRACT_ADDRESS: process.env.MILESTONE_CONTRACT_ADDRESS || '',
  AUDIT_CONTRACT_ADDRESS: process.env.AUDIT_CONTRACT_ADDRESS || '',
  
  // Network configuration
  POLYGON_MAINNET_CHAIN_ID: 137,
  POLYGON_MUMBAI_CHAIN_ID: 80001,
  
  // Platform configuration
  PLATFORM_WALLET_ADDRESS: process.env.PLATFORM_WALLET_ADDRESS || '',
};

// File paths that need contract addresses
const FILES_TO_UPDATE = [
  {
    path: 'apps/frontend/src/store/web3Store.ts',
    type: 'typescript',
    patterns: {
      DONATION_CONTRACT_ADDRESS: /donationContractAddress:\s*string\s*\|\s*null\s*=\s*['"'][^'"]*['"]?/,
      MILESTONE_CONTRACT_ADDRESS: /milestoneContractAddress:\s*string\s*\|\s*null\s*=\s*['"'][^'"]*['"]?/,
      AUDIT_CONTRACT_ADDRESS: /auditContractAddress:\s*string\s*\|\s*null\s*=\s*['"'][^'"]*['"]?/
    }
  },
  {
    path: 'apps/backend/src/routes/blockchain-polygon.ts',
    type: 'typescript',
    patterns: {
      DONATION_CONTRACT_ADDRESS: /const\s+DONATION_CONTRACT_ADDRESS\s*=\s*['"'][^'"]*['"]?/,
      MILESTONE_CONTRACT_ADDRESS: /const\s+MILESTONE_CONTRACT_ADDRESS\s*=\s*['"'][^'"]*['"]?/,
      AUDIT_CONTRACT_ADDRESS: /const\s+AUDIT_CONTRACT_ADDRESS\s*=\s*['"'][^'"]*['"]?/
    }
  },
  {
    path: '.env.example',
    type: 'env',
    patterns: {
      DONATION_CONTRACT_ADDRESS: /DONATION_CONTRACT_ADDRESS=.*/,
      MILESTONE_CONTRACT_ADDRESS: /MILESTONE_CONTRACT_ADDRESS=.*/,
      AUDIT_CONTRACT_ADDRESS: /AUDIT_CONTRACT_ADDRESS=.*/
    }
  }
];

function updateContractAddresses(addresses) {
  console.log('🔄 Synchronizing contract addresses across all files...\n');
  
  let updatedFiles = 0;
  let errors = 0;
  
  FILES_TO_UPDATE.forEach(file => {
    try {
      const filePath = path.join(process.cwd(), file.path);
      
      if (!fs.existsSync(filePath)) {
        console.log(`❌ File not found: ${file.path}`);
        errors++;
        return;
      }
      
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      // Update each contract address
      Object.entries(addresses).forEach(([contractName, address]) => {
        if (file.patterns[contractName] && address) {
          const pattern = file.patterns[contractName];
          
          let replacement;
          switch (file.type) {
            case 'typescript':
              if (contractName.includes('CONTRACT_ADDRESS')) {
                if (file.path.includes('web3Store')) {
                  // Frontend store format
                  replacement = `${contractName.toLowerCase().replace('_contract_address', 'ContractAddress')}: string | null = '${address}'`;
                } else {
                  // Backend route format
                  replacement = `const ${contractName} = '${address}'`;
                }
              }
              break;
            case 'env':
              replacement = `${contractName}=${address}`;
              break;
          }
          
          if (replacement && pattern.test(content)) {
            content = content.replace(pattern, replacement);
            modified = true;
            console.log(`✅ Updated ${contractName} in ${file.path}`);
          }
        }
      });
      
      if (modified) {
        fs.writeFileSync(filePath, content);
        updatedFiles++;
        console.log(`💾 Saved changes to ${file.path}\n`);
      }
      
    } catch (error) {
      console.log(`❌ Error updating ${file.path}: ${error.message}`);
      errors++;
    }
  });
  
  console.log('📊 Synchronization Summary:');
  console.log(`   Updated files: ${updatedFiles}`);
  console.log(`   Errors: ${errors}`);
  
  if (errors === 0) {
    console.log('\n🎉 All contract addresses synchronized successfully!');
  } else {
    console.log('\n⚠️  Some files could not be updated. Please check the errors above.');
  }
}

function generateContractConfig(deploymentResult) {
  console.log('📝 Generating contract configuration...\n');
  
  const config = {
    network: deploymentResult.network || 'polygon',
    chainId: deploymentResult.network === 'mumbai' ? 80001 : 137,
    contracts: {
      donation: deploymentResult.donationContract,
      milestone: deploymentResult.milestoneContract,
      audit: deploymentResult.auditContract
    },
    platformWallet: deploymentResult.platformWallet,
    deployedAt: new Date().toISOString(),
    gasUsed: deploymentResult.gasUsed,
    transactionHashes: deploymentResult.transactionHashes
  };
  
  // Save configuration
  const configPath = path.join(process.cwd(), 'contract-config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`✅ Contract configuration saved to ${configPath}`);
  
  return config;
}

function validateContractSync() {
  console.log('🔍 Validating contract address synchronization...\n');
  
  const addresses = {};
  let isValid = true;
  
  FILES_TO_UPDATE.forEach(file => {
    try {
      const filePath = path.join(process.cwd(), file.path);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File not found: ${file.path}`);
        return;
      }
      
      const content = fs.readFileSync(filePath, 'utf8');
      
      Object.entries(file.patterns).forEach(([contractName, pattern]) => {
        const match = content.match(pattern);
        if (match) {
          // Extract address from match
          let address = '';
          if (file.type === 'env') {
            address = match[0].split('=')[1] || '';
          } else {
            const addrMatch = match[0].match(/['"]([^'"]+)['"]/);
            address = addrMatch ? addrMatch[1] : '';
          }
          
          if (!addresses[contractName]) {
            addresses[contractName] = [];
          }
          addresses[contractName].push({
            file: file.path,
            address: address
          });
        }
      });
      
    } catch (error) {
      console.log(`❌ Error reading ${file.path}: ${error.message}`);
      isValid = false;
    }
  });
  
  // Check consistency
  Object.entries(addresses).forEach(([contractName, instances]) => {
    const uniqueAddresses = [...new Set(instances.map(i => i.address).filter(a => a))];
    
    if (uniqueAddresses.length === 0) {
      console.log(`⚠️  ${contractName}: No addresses found`);
    } else if (uniqueAddresses.length === 1) {
      console.log(`✅ ${contractName}: Consistent (${uniqueAddresses[0]})`);
    } else {
      console.log(`❌ ${contractName}: Inconsistent addresses found:`);
      instances.forEach(instance => {
        console.log(`   ${instance.file}: ${instance.address || 'empty'}`);
      });
      isValid = false;
    }
  });
  
  console.log('\n📊 Validation Summary:');
  if (isValid) {
    console.log('🎉 All contract addresses are properly synchronized!');
  } else {
    console.log('❌ Contract address inconsistencies detected. Run sync command to fix.');
  }
  
  return isValid;
}

// CLI interface
const command = process.argv[2];
const args = process.argv.slice(3);

switch (command) {
  case 'sync':
    if (args.length < 3) {
      console.log('Usage: node sync-contracts.js sync <donation_address> <milestone_address> <audit_address>');
      process.exit(1);
    }
    updateContractAddresses({
      DONATION_CONTRACT_ADDRESS: args[0],
      MILESTONE_CONTRACT_ADDRESS: args[1],
      AUDIT_CONTRACT_ADDRESS: args[2]
    });
    break;
    
  case 'validate':
    validateContractSync();
    break;
    
  case 'config':
    if (args.length < 1) {
      console.log('Usage: node sync-contracts.js config <deployment_result_json>');
      process.exit(1);
    }
    try {
      const deploymentResult = JSON.parse(fs.readFileSync(args[0], 'utf8'));
      generateContractConfig(deploymentResult);
    } catch (error) {
      console.log(`❌ Error reading deployment result: ${error.message}`);
      process.exit(1);
    }
    break;
    
  default:
    console.log(`
🔧 Contract Address Synchronization Utility

Commands:
  sync <donation> <milestone> <audit>  - Sync contract addresses across all files
  validate                            - Validate address consistency
  config <deployment.json>            - Generate config from deployment result

Examples:
  node sync-contracts.js sync 0x123... 0x456... 0x789...
  node sync-contracts.js validate
  node sync-contracts.js config deployment-result.json
`);
    break;
}
