import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Campaign } from '../models/Campaign.js';
import connectDB from '../config/database.js';

// Load environment variables
dotenv.config();

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to database
    await connectDB();

    // Clear existing data (optional - comment out for production)
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Campaign.deleteMany({});

    // Create Admin User
    console.log('👤 Creating admin user...');
    const adminPasswordHash = await bcrypt.hash('dilsedaan2024', 12);
    const adminUser = await User.create({
      email: 'admin@dilsedaan.org',
      password: adminPasswordHash,
      name: 'DilSeDaan Administrator',
      role: 'admin',
      isEmailVerified: true,
      profile: {
        bio: 'Platform administrator for DilSeDaan charity platform',
        location: 'Mumbai, India',
        preferences: {
          language: 'en',
          notifications: {
            email: true,
            sms: false,
            push: true
          },
          privacy: {
            showDonations: false,
            showProfile: true
          }
        },
        stats: {
          totalDonated: 0,
          totalCampaigns: 0,
          totalVolunteerHours: 0,
          impactScore: 100
        }
      }
    });

    // Create Test Users
    console.log('👥 Creating test users...');
    const testUsers = [];

    const users = [
      {
        email: 'rajesh.kumar@example.com',
        name: 'Rajesh Kumar',
        role: 'donor',
        location: 'Delhi, India'
      },
      {
        email: 'priya.sharma@example.com',
        name: 'Priya Sharma',
        role: 'donor',
        location: 'Bangalore, India'
      },
      {
        email: 'amit.patel@example.com',
        name: 'Amit Patel',
        role: 'donor',
        location: 'Mumbai, India'
      },
      {
        email: 'neha.gupta@example.com',
        name: 'Neha Gupta',
        role: 'charity',
        location: 'Chennai, India'
      }
    ];

    for (const userData of users) {
      const passwordHash = await bcrypt.hash('password123', 12);
      const user = await User.create({
        email: userData.email,
        password: passwordHash,
        name: userData.name,
        role: userData.role,
        isEmailVerified: true,
        profile: {
          location: userData.location,
          preferences: {
            language: 'en',
            notifications: {
              email: true,
              sms: false,
              push: true
            },
            privacy: {
              showDonations: true,
              showProfile: true
            }
          },
          stats: {
            totalDonated: Math.floor(Math.random() * 50000),
            totalCampaigns: Math.floor(Math.random() * 5),
            totalVolunteerHours: Math.floor(Math.random() * 100),
            impactScore: Math.floor(Math.random() * 50) + 10
          }
        }
      });
      testUsers.push(user);
    }

    // Create Sample Campaigns
    console.log('📋 Creating sample campaigns...');
    const sampleCampaigns = [
      {
        title: 'गरीब बच्चों की शिक्षा',
        titleEnglish: 'Education for Poor Children',
        description: 'Help provide quality education to underprivileged children in rural areas. Your donation will fund books, uniforms, and school supplies for children who cannot afford basic educational necessities.',
        category: 'education',
        targetAmount: 100000,
        currentAmount: 67500,
        location: 'Rural Maharashtra, India',
        tags: ['education', 'children', 'rural development'],
        images: ['https://images.unsplash.com/photo-1497486751825-1233686d5d80?auto=format&fit=crop&w=800&q=80']
      },
      {
        title: 'स्वच्छ पेयजल परियोजना',
        titleEnglish: 'Clean Drinking Water Project',
        description: 'Providing access to clean and safe drinking water in drought-affected villages. This project will install water purification systems and bore wells to ensure sustainable water access.',
        category: 'environment',
        targetAmount: 250000,
        currentAmount: 89000,
        location: 'Rajasthan, India',
        tags: ['water', 'environment', 'health'],
        images: ['https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=800&q=80']
      },
      {
        title: 'भोजन सहायता कार्यक्रम',
        titleEnglish: 'Food Assistance Program',
        description: 'Emergency food relief for families affected by natural disasters and economic hardship. Providing nutritious meals and essential food supplies to those in desperate need.',
        category: 'disaster-relief',
        targetAmount: 75000,
        currentAmount: 23400,
        location: 'Odisha, India',
        tags: ['food', 'emergency', 'relief'],
        images: ['https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80']
      },
      {
        title: 'महिला सशक्तिकरण केंद्र',
        titleEnglish: 'Women Empowerment Center',
        description: 'Establishing skill development centers for women in rural areas. Teaching vocational skills like tailoring, handicrafts, and digital literacy to promote economic independence.',
        category: 'education',
        targetAmount: 150000,
        currentAmount: 92000,
        location: 'West Bengal, India',
        tags: ['women empowerment', 'skills', 'rural development'],
        images: ['https://images.unsplash.com/photo-1509909756405-be0199881695?auto=format&fit=crop&w=800&q=80']
      },
      {
        title: 'आपातकालीन चिकित्सा सहायता',
        titleEnglish: 'Emergency Medical Aid',
        description: 'Critical medical support for families who cannot afford life-saving treatments. Funding surgeries, medicines, and hospital care for those in urgent medical need.',
        category: 'healthcare',
        targetAmount: 300000,
        currentAmount: 156000,
        location: 'All India',
        tags: ['healthcare', 'emergency', 'medical'],
        images: ['https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?auto=format&fit=crop&w=800&q=80']
      }
    ];

    for (let i = 0; i < sampleCampaigns.length; i++) {
      const campaignData = sampleCampaigns[i];
      const creator = testUsers[i % testUsers.length];

      await Campaign.create({
        ...campaignData,
        creator: creator._id,
        status: 'active',
        milestones: [
          {
            title: 'Phase 1: Initial Setup',
            description: 'Setting up infrastructure and initial requirements',
            targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            completed: true,
            completedDate: new Date()
          },
          {
            title: 'Phase 2: Implementation',
            description: 'Main project implementation and rollout',
            targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            completed: false
          },
          {
            title: 'Phase 3: Completion',
            description: 'Final phase and project completion',
            targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            completed: false
          }
        ]
      });
    }

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Seeded Data Summary:');
    console.log(`👤 Admin User: admin@dilsedaan.org (password: dilsedaan2024)`);
    console.log(`👥 Test Users: ${testUsers.length} users created`);
    console.log(`📋 Sample Campaigns: ${sampleCampaigns.length} campaigns created`);
    console.log('\n🔑 Test User Credentials:');
    console.log('Email: rajesh.kumar@example.com | Password: password123');
    console.log('Email: priya.sharma@example.com | Password: password123');
    console.log('Email: amit.patel@example.com | Password: password123');
    console.log('Email: neha.gupta@example.com | Password: password123');

    console.log('\n🚀 You can now start the server and test the authentication!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run seeding if this script is executed directly
if (process.argv[1].endsWith('seed.js') || process.argv[1].endsWith('seed.ts')) {
  seedData();
}

export default seedData;
