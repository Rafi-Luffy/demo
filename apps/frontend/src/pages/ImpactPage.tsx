import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Heart, Users, Droplets, BookOpen, TrendingUp, Calendar, MapPin, ExternalLink, X, CheckCircle, Loader, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Link, useSearchParams, useLocation } from 'react-router-dom'
import { useDonationStore, type Campaign } from '@/store/donationStore'
import { formatCurrency, getProgressPercentage } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { ImpactGallery } from '@/components/impact/ImpactGallery'

type ImpactStatus = {
  name: string
  status: string
}

type Transaction = {
  id: string
  hash: string
  from: string
  to: string
  amount: number
  campaign: string
  wish: string
  block: number
  timestamp: string
  nonce: number
  gasUsed: string
  gasPrice: string
  fee: number
  impactStatus: ImpactStatus[]
}

type Lantern = {
  tx: Transaction
  x: string
  duration: number
}

// --- MOCK DATA (Expanded to 15 transactions) ---
const mockTransactions: Transaction[] = [
  { id: '0x1a2b', hash: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2', from: '0x3c4d...a1b2', to: 'DilSeDaan.eth', amount: 0.5, campaign: 'Educate a Child', wish: 'For a brighter future.', block: 1234567, timestamp: '10 secs ago', nonce: 101, gasUsed: '21,000', gasPrice: '30 Gwei', fee: 0.00063, impactStatus: [{name: 'Funds Received', status: 'Complete'}, {name: 'Allocated to Education', status: 'Complete'}, {name: 'Books & Supplies Purchased', status: 'In Progress'}, {name: 'Impact Report Filed', status: 'Pending'}] },
  { id: '0x5e6f', hash: '0x5e6f7g8h9i0j1k2l3m4n5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5', from: '0x7g8h...c3d4', to: 'DilSeDaan.eth', amount: 1.2, campaign: 'Clean Water', wish: 'A small drop of hope.', block: 1234566, timestamp: '1 min ago', nonce: 45, gasUsed: '25,000', gasPrice: '32 Gwei', fee: 0.0008, impactStatus: [{name: 'Funds Received', status: 'Complete'}, {name: 'Allocated to Water Project', status: 'Complete'}, {name: 'Well-Drilling Commenced', status: 'Complete'}, {name: 'Impact Report Filed', status: 'Complete'}] },
  { id: '0x8h9i', hash: '0x8h9i0j1k2l3m4n5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l', from: '0x9j0k...d5e6', to: 'DilSeDaan.eth', amount: 0.75, campaign: 'Animal Shelter', wish: 'For our furry friends.', block: 1234565, timestamp: '3 mins ago', nonce: 12, gasUsed: '22,000', gasPrice: '28 Gwei', fee: 0.000616, impactStatus: [{name: 'Funds Received', status: 'Complete'}, {name: 'Allocated to Animal Welfare', status: 'Complete'}, {name: 'Food & Medicine Procured', status: 'Complete'}, {name: 'Impact Report Filed', status: 'Pending'}] },
  { id: '0x2l3m', hash: '0x2l3m4n5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0', from: '0x4n5p...f7g8', to: 'DilSeDaan.eth', amount: 3.0, campaign: 'Disaster Relief', wish: 'Sending strength and support.', block: 1234564, timestamp: '5 mins ago', nonce: 88, gasUsed: '30,000', gasPrice: '35 Gwei', fee: 0.00105, impactStatus: [{name: 'Funds Received', status: 'Complete'}, {name: 'Allocated to Disaster Relief', status: 'Complete'}, {name: 'Emergency Supplies Deployed', status: 'In Progress'}, {name: 'Impact Report Filed', status: 'Pending'}] },
  { id: '0xabcd', hash: '0xabcd1234567890efabcd1234567890efabcd1234567890efabcd1234567890', from: '0x5q6r...h9i0', to: 'DilSeDaan.eth', amount: 0.2, campaign: 'Mid-Day Meals', wish: 'No child should go hungry.', block: 1234563, timestamp: '8 mins ago', nonce: 203, gasUsed: '21,500', gasPrice: '31 Gwei', fee: 0.000666, impactStatus: [{name: 'Funds Received', status: 'Complete'}, {name: 'Allocated to Meal Program', status: 'Complete'}, {name: 'Meals Served Today', status: 'Complete'}, {name: 'Impact Report Filed', status: 'Complete'}] },
  { id: '0xefgh', hash: '0xefgh1234567890abcd1234567890efabcd1234567890efabcd1234567890', from: '0x1s2t...j1k2', to: 'DilSeDaan.eth', amount: 1.5, campaign: 'Women Empowerment', wish: 'Supporting strong women.', block: 1234562, timestamp: '12 mins ago', nonce: 5, gasUsed: '28,000', gasPrice: '33 Gwei', fee: 0.000924, impactStatus: [{name: 'Funds Received', status: 'Complete'}, {name: 'Allocated to Skills Training', status: 'Complete'}, {name: 'Training Workshop Started', status: 'In Progress'}, {name: 'Impact Report Filed', status: 'Pending'}] },
  { id: '0xijkl', hash: '0xijkl1234567890efgh1234567890abcd1234567890efgh1234567890abcd', from: '0x3u4v...l3m4', to: 'DilSeDaan.eth', amount: 0.1, campaign: 'Educate a Child', wish: 'A small gift for education.', block: 1234561, timestamp: '15 mins ago', nonce: 301, gasUsed: '21,000', gasPrice: '30 Gwei', fee: 0.00063, impactStatus: [{name: 'Funds Received', status: 'Complete'}, {name: 'Allocated to Education', status: 'Complete'}, {name: 'Books & Supplies Purchased', status: 'In Progress'}, {name: 'Impact Report Filed', status: 'Pending'}] },
  { id: '0xmnop', hash: '0xmnop1234567890ijkl1234567890efgh1234567890abcd1234567890efgh', from: '0x5w6x...n5p6', to: 'DilSeDaan.eth', amount: 5.0, campaign: 'Build a Home', wish: 'A roof for a family.', block: 1234560, timestamp: '20 mins ago', nonce: 150, gasUsed: '35,000', gasPrice: '40 Gwei', fee: 0.0014, impactStatus: [{name: 'Funds Received', status: 'Complete'}, {name: 'Allocated to Housing', status: 'Complete'}, {name: 'Foundation Laid', status: 'In Progress'}, {name: 'Impact Report Filed', status: 'Pending'}] },
  { id: '0xqrst', hash: '0xqrst1234567890mnop1234567890ijkl1234567890efgh1234567890abcd', from: '0x7y8z...q7r8', to: 'DilSeDaan.eth', amount: 0.3, campaign: 'Clean Water', wish: 'Clean water for all.', block: 1234559, timestamp: '25 mins ago', nonce: 77, gasUsed: '25,500', gasPrice: '32 Gwei', fee: 0.000816, impactStatus: [{name: 'Funds Received', status: 'Complete'}, {name: 'Allocated to Water Project', status: 'Complete'}, {name: 'Well-Drilling Commenced', status: 'Complete'}, {name: 'Impact Report Filed', status: 'Complete'}] },
  { id: '0xuvwx', hash: '0xuvwx1234567890qrst1234567890mnop1234567890ijkl1234567890efgh', from: '0x9a0b...s9t0', to: 'DilSeDaan.eth', amount: 0.8, campaign: 'Senior Citizen Care', wish: 'Respect for our elders.', block: 1234558, timestamp: '30 mins ago', nonce: 19, gasUsed: '23,000', gasPrice: '29 Gwei', fee: 0.000667, impactStatus: [{name: 'Funds Received', status: 'Complete'}, {name: 'Allocated to Senior Care', status: 'Complete'}, {name: 'Monthly Support Provided', status: 'Complete'}, {name: 'Impact Report Filed', status: 'Complete'}] },
  { id: '0x5678', hash: '0x567890abcdef1234567890abcdef1234567890abcdef12345678901234', from: '0x4e5f...w3x4', to: 'DilSeDaan.eth', amount: 2.5, campaign: 'Educate a Child', wish: 'Investing in the future.', block: 1234556, timestamp: '40 mins ago', nonce: 99, gasUsed: '21,000', gasPrice: '30 Gwei', fee: 0.00063, impactStatus: [{name: 'Funds Received', status: 'Complete'}, {name: 'Allocated to Education', status: 'Complete'}, {name: 'Books & Supplies Purchased', status: 'In Progress'}, {name: 'Impact Report Filed', status: 'Pending'}] },
  { id: '0x90ab', hash: '0x90abcdef1234567890abcdef1234567890abcdef1234567890567890ab', from: '0x6g7h...y5z6', to: 'DilSeDaan.eth', amount: 0.6, campaign: 'Mid-Day Meals', wish: 'A full stomach smiles.', block: 1234555, timestamp: '45 mins ago', nonce: 1, gasUsed: '21,800', gasPrice: '31 Gwei', fee: 0.0006758, impactStatus: [{name: 'Funds Received', status: 'Complete'}, {name: 'Allocated to Meal Program', status: 'Complete'}, {name: 'Meals Served Today', status: 'Complete'}, {name: 'Impact Report Filed', status: 'Complete'}] },
  { id: '0xcdef', hash: '0xcdef1234567890abcdef1234567890abcdef1234567890abcdef123456', from: '0x8i9j...a7b8', to: 'DilSeDaan.eth', amount: 1.0, campaign: 'Disaster Relief', wish: 'Rebuilding lives.', block: 1234554, timestamp: '50 mins ago', nonce: 123, gasUsed: '30,500', gasPrice: '35 Gwei', fee: 0.0010675, impactStatus: [{name: 'Funds Received', status: 'Complete'}, {name: 'Allocated to Disaster Relief', status: 'Complete'}, {name: 'Emergency Supplies Deployed', status: 'In Progress'}, {name: 'Impact Report Filed', status: 'Pending'}] },
  { id: '0x0123', hash: '0x0123456789abcdef1234567890abcdef1234567890abcdef1234567890', from: '0x0k1l...c9d0', to: 'DilSeDaan.eth', amount: 0.9, campaign: 'Women Empowerment', wish: 'Empower a woman, empower a nation.', block: 1234553, timestamp: '55 mins ago', nonce: 404, gasUsed: '28,200', gasPrice: '33 Gwei', fee: 0.0009306, impactStatus: [{name: 'Funds Received', status: 'Complete'}, {name: 'Allocated to Skills Training', status: 'Complete'}, {name: 'Training Workshop Started', status: 'In Progress'}, {name: 'Impact Report Filed', status: 'Pending'}] },
];

// Sample data for people helped gallery
const helpedPeople = [
  {
    id: 1,
    name: "Priya Sharma",
    age: 8,
    image: "/images/image_4.png",
    category: "Education",
    story: "Priya received school supplies and uniform through our education program. She's now excelling in her studies and dreams of becoming a teacher.",
    location: "Mumbai, Maharashtra"
  },
  {
    id: 2,
    name: "Rajesh Kumar",
    age: 45,
    image: "/images/image_5.png",
    category: "Clean Water",
    story: "Thanks to our clean water initiative, Rajesh's village now has access to safe drinking water for 500 families.",
    location: "Rajasthan"
  },
  {
    id: 3,
    name: "Kamala Devi",
    age: 68,
    image: "/images/image_6.png",
    category: "Healthcare",
    story: "Kamala received essential diabetes medication and regular health checkups through our healthcare program.",
    location: "Kerala"
  },
  {
    id: 4,
    name: "Arjun Singh",
    age: 12,
    image: "/images/image_7.png",
    category: "Child Welfare",
    story: "Arjun was provided with nutritious meals and educational support. He's now healthy and attending school regularly.",
    location: "Bihar"
  },
  {
    id: 5,
    name: "Meera Patel",
    age: 28,
    image: "/images/image_8.png",
    category: "Women Empowerment",
    story: "Meera learned new skills through our vocational training program and now runs her own small business.",
    location: "Gujarat"
  },
  {
    id: 6,
    name: "Ravi Krishnan",
    age: 52,
    image: "/images/image_9.png",
    category: "Disaster Relief",
    story: "After the floods, Ravi's family received emergency supplies and temporary shelter. They're now rebuilding their lives.",
    location: "Tamil Nadu"
  }
];

// --- HELPER COMPONENT: The Ultimate Two-Column Explorer Modal ---
const DetailModal = ({
  tx,
  onClose,
}: {
  tx: Transaction | null
  onClose: () => void
}) => {
  if (!tx) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-gray-900/90 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] mx-auto p-4 sm:p-6 lg:p-8 relative overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10"
        >
          <X />
        </Button>
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 pr-8">
          <div className="flex-1 space-y-4">
            <h3 className="text-xl sm:text-2xl font-bold mb-2 text-warm-orange">{tx.campaign}</h3>
            <p className="italic text-white/80 text-sm sm:text-base">"{tx.wish}"</p>
            <div className="mb-2">
              <span className="font-mono text-green-400 text-lg sm:text-xl">{tx.amount} MATIC</span>
            </div>
            <div className="text-xs text-white/60 space-y-1">
              <div>From: <span className="font-mono">{tx.from}</span></div>
              <div>To: <span className="font-mono">{tx.to}</span></div>
            </div>
            <div className="text-xs text-white/60 space-y-1">
              <div>Tx Hash: <span className="font-mono break-all">{tx.hash}</span></div>
              <br />
              <span>Block: {tx.block}</span>
              <br />
              <span>Timestamp: {tx.timestamp}</span>
            </div>
            <div className="text-xs text-white/60 mb-2">
              <span>Nonce: {tx.nonce}</span>
              <br />
              <span>Gas Used: {tx.gasUsed}</span>
              <br />
              <span>Gas Price: {tx.gasPrice}</span>
              <br />
              <span>Fee: {tx.fee} MATIC</span>
            </div>
            <div className="mt-6">
              <h4 className="font-bold text-white mb-2">Impact Status</h4>
              <ul className="space-y-2">
                {tx.impactStatus.map((item: ImpactStatus, index: number) => (
                  <li key={index} className="flex items-center space-x-3">
                    {item.status === 'Complete' ? (
                      <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    ) : (
                      <Loader className="h-5 w-5 text-yellow-500 animate-spin flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-bold text-sm text-white">{item.name}</p>
                      <p className="text-xs text-white/70">{item.status}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- HELPER COMPONENT: Gallery Modal for showing people helped ---
const GalleryModal = ({
  person,
  onClose,
}: {
  person: any | null
  onClose: () => void
}) => {
  if (!person) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-white to-warm-cream rounded-3xl w-full max-w-md mx-auto p-6 relative"
        onClick={e => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 text-warm-charcoal/70 hover:text-warm-charcoal hover:bg-warm-charcoal/10"
        >
          <X />
        </Button>
        
        <div className="text-center">
          <img
            src={person.image}
            alt={person.name}
            className="w-32 h-32 object-cover rounded-full mx-auto mb-4 border-4 border-warm-orange shadow-lg"
          />
          <h3 className="text-2xl font-bold text-warm-charcoal mb-2">{person.name}</h3>
          <div className="inline-block bg-warm-orange/20 text-warm-orange px-3 py-1 rounded-full text-sm font-semibold mb-4">
            {person.category}
          </div>
          <p className="text-warm-charcoal-light text-lg leading-relaxed mb-6">
            {person.story}
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2 text-warm-green">
              <Heart className="h-5 w-5" fill="currentColor" />
              <span className="font-semibold">Lives Changed: 1</span>
            </div>
            
            <div className="bg-warm-orange/10 rounded-2xl p-4">
              <p className="text-sm text-warm-charcoal-light italic">
                "Thank you to all the kind hearts who made this possible. Your love gives us hope for a better tomorrow." 
                <br />- {person.name}
              </p>
            </div>
            
            <Button
              variant="default"
              className="w-full bg-warm-orange hover:bg-warm-orange/90 text-white font-semibold py-3"
              onClick={onClose}
            >
              <Heart className="mr-2 h-4 w-4" fill="currentColor" />
              Spread More Love
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- HELPER COMPONENT: Full Ledger Modal with Rich Data ---
const FullLedgerModal = ({
  allPlaques,
  onSelectTx,
  onClose,
}: {
  allPlaques: Transaction[]
  onSelectTx: (tx: Transaction) => void
  onClose: () => void
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      className="bg-gray-900/90 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] mx-auto p-4 sm:p-6 lg:p-8 relative flex flex-col"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Full Transaction Ledger</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          <X />
        </Button>
      </div>
      <div className="overflow-y-auto pr-2 flex-grow">
        <div className="hidden sm:grid grid-cols-4 text-sm font-bold text-white/60 p-3 mb-2 sticky top-0 bg-gray-900/80 backdrop-blur-sm border-b border-white/10">
          <span>Campaign</span>
          <span>Amount</span>
          <span>Transaction Hash</span>
          <span>Timestamp</span>
        </div>
        {allPlaques.map((plaque: Transaction) => (
          <button
            key={plaque.id}
            onClick={() => onSelectTx(plaque)}
            className="w-full grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 text-left p-3 mb-2 rounded-lg hover:bg-white/5 transition-colors text-sm border border-white/5"
          >
            <div className="space-y-1">
              <p className="font-bold text-warm-orange">{plaque.campaign}</p>
              <p className="text-xs text-white/60 italic truncate">"{plaque.wish}"</p>
            </div>
            <div className="text-green-400 font-mono font-bold">{plaque.amount} MATIC</div>
            <div className="font-mono text-xs text-blue-400 truncate">{plaque.hash}</div>
            <div className="text-white/60 text-xs font-mono">{plaque.timestamp}</div>
          </button>
        ))}
      </div>
    </motion.div>
  </motion.div>
);

// --- MAIN PAGE COMPONENT ---
export function ImpactPage() {
  const { t } = useTranslation()
  const location = useLocation()
  const [lanterns, setLanterns] = useState<Lantern[]>([]);
  const [allPlaques, setAllPlaques] = useState<Transaction[]>([]);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isFullLedgerVisible, setFullLedgerVisible] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  
  // Get story details from navigation state
  const storyTitle = location.state?.storyTitle

  // Full story details based on the title
  const getStoryDetails = (title: string) => {
    const stories = {
      "Padhega India, Tabhi Toh Badhega India!": {
        title: "Padhega India, Tabhi Toh Badhega India!",
        category: "Education",
        fullStory: `Meet Ravi Kumar, a 12-year-old boy from the bustling slums of Delhi. Despite living in a small shanty with his mother who works as a domestic help, Ravi's eyes always sparkled with dreams bigger than his circumstances.

When your generous donation of ₹300 reached us through our transparent blockchain system, we immediately allocated it to our "Padhega India" education initiative. Within 48 hours, our field team visited Ravi's community and identified him as one of the bright minds who needed support.

Your contribution helped us purchase:
- A complete set of textbooks for Class 7
- Notebooks and stationery for the entire academic year
- A small study table and lamp for his homework
- School uniform and shoes

The transformation was immediate. Ravi, who earlier struggled to complete homework sitting on the floor under dim light, now has a proper study space. His grades improved from 60% to 85% in just three months.

"I want to become an engineer and build better homes for families like mine," says Ravi with a bright smile.

Today, thanks to supporters like you, Ravi is not just attending school regularly but also tutoring younger children in his community. Your ₹300 didn't just buy books - it invested in India's future.

**Impact Achieved:**
- 1 child's education secured for a full year
- 85% improvement in academic performance
- 5 additional children now being tutored by Ravi
- 1 family's hope restored

**Blockchain Transparency:** Your donation was processed through smart contract 0xa1b2c3d4...`, 
        image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        hearts: 456,
        donationGoal: "₹50,000",
        donationRaised: "₹34,500"
      },
      "Ek Thali Khushiyon Ki": {
        title: "Ek Thali Khushiyon Ki",
        category: "Food & Nutrition", 
        fullStory: `The streets of Mumbai never sleep, and neither do the hunger pangs of children who call these streets home. When 89 generous hearts like yours came together, magic happened - nobody sleeps hungry anymore in the Dadar area.

Your collective donations, tracked transparently on our blockchain platform, funded our "Ek Thali Khushiyon Ki" initiative. Every evening at 7 PM, our mobile kitchen serves hot, nutritious meals to 150+ street children.

What started as a simple idea to feed hungry children has become a community of hope:

**The Daily Routine:**
- 6:00 PM: Fresh vegetables and grains purchased from local vendors
- 6:30 PM: Community volunteers start cooking (many are former street children!)
- 7:00 PM: Mobile kitchen reaches fixed locations
- 7:30 PM: Children line up with their metal plates, faces beaming with joy
- 8:30 PM: Not just food, but homework help and storytelling sessions

**Meet Some Regular Faces:**
- Aarti (9): Never misses dinner, now attending evening school
- Rohit (11): Helps serve food to smaller children, showing natural leadership
- Pinki (7): Draws beautiful pictures on napkins, dreams of becoming an artist

**Real Impact of Your Donation:**
- 150+ children fed daily for 6 months
- Zero cases of malnutrition in our coverage area
- 40+ children enrolled in nearby schools
- 15+ older children now earning through part-time work
- 8+ families reunited through our counseling efforts

The transparent blockchain ledger shows exactly how every rupee was spent - from dal-chawal to success stories.

**Current Status:** Expanding to 3 more locations in Mumbai!`,
        image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        hearts: 623,
        donationGoal: "₹2,50,000",
        donationRaised: "₹1,87,000"
      },
      "Beti Padhao, Sapne Sajao": {
        title: "Beti Padhao, Sapne Sajao", 
        category: "Women Empowerment",
        fullStory: `In the remote village of rural Bihar, where electricity comes and goes but dreams persist, lives Meera - a 15-year-old girl who just made history.

She is the first girl in her village of 500+ families to reach 10th grade.

**The Challenge:**
Rural Bihar has one of the lowest female literacy rates in India. In Meera's village, girls traditionally stop schooling after Class 5 to help with household work or get married early. When Meera expressed her desire to continue studying, her family faced social pressure and financial constraints.

**Your Impact:**
Your donation through our transparent blockchain platform helped us launch the "Beti Padhao, Sapne Sajao" program in Meera's village. Here's how your kindness transformed not just one life, but an entire community's mindset:

**Direct Support to Meera:**
- School fees and examination costs covered
- Bicycle for 12km daily commute to high school
- Study materials and laptop for digital learning
- Monthly scholarship of ₹2,000 for family support

**Community Transformation:**
- Awareness sessions with 150+ families about girls' education
- Formation of "Beti Bachao Committee" with local leaders
- Setting up of evening study groups for 25+ girls
- Self-defense training workshops

**Meera's Journey:**
"Earlier, people used to say 'Ladki hai, zyada padhane ka kya faida' (She's a girl, what's the use of educating her much). But when I topped my 9th-grade exams, the same people started asking their daughters to study like me," shares Meera.

**Ripple Effect:**
- 12 more girls in the village now attend high school
- 3 early marriages called off after family counseling
- Women's literacy program started for mothers
- Village now has its first female teacher (Meera's goal!)

**Current Status:** Meera is preparing for Class 10 board exams and dreams of becoming a teacher to educate more girls in her region.

**Blockchain Transparency:** Every rupee tracked and verified through smart contracts.`,
        image: "https://images.unsplash.com/photo-1594736797933-d0a501ba2fe8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        hearts: 789,
        donationGoal: "₹1,00,000",
        donationRaised: "₹78,000"
      }
    }
    return stories[title as keyof typeof stories] || null
  }

  const storyDetails = storyTitle ? getStoryDetails(storyTitle) : null

  useEffect(() => {
    setAllPlaques(mockTransactions);
    // Only run once on mount, not on every allPlaques change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const baseTx = mockTransactions[Math.floor(Math.random() * mockTransactions.length)];
      const newTx: Transaction = {
        ...baseTx,
        id: Date.now().toString(),
        timestamp: `~${Math.floor(Math.random() * 5) + 1} secs ago`,
        block: allPlaques.length > 0 ? allPlaques[0].block + 1 : 1234568,
      };
      const newLantern: Lantern = {
        tx: newTx,
        x: `${Math.random() * 80 + 10}%`,
        duration: Math.random() * 25 + 30,
      };
      setLanterns(prev => [newLantern, ...prev.slice(0, 14)]);
      setAllPlaques(prev => [newTx, ...prev]);
    }, 4500);
    return () => clearInterval(interval);
  }, [allPlaques]);

  return (
    <div className="bg-[#10141c] text-white relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-[#10141c] via-[#1a202c] to-[#2d3748]" />
      </div>

      <main className="relative z-10">
        {/* Story Details Section - Only show if story is selected */}
        {storyDetails && (
          <section className="min-h-screen bg-gradient-to-br from-warm-cream to-warm-orange/10 text-warm-charcoal relative">
            <div className="container mx-auto px-4 py-16">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-4xl mx-auto"
              >
                {/* Back Button */}
                <Link
                  to="/"
                  className="inline-flex items-center text-warm-orange hover:text-warm-golden mb-8 transition-colors duration-300"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Back to Home
                </Link>

                {/* Story Header */}
                <div className="mb-12">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <div className="inline-block bg-warm-orange/10 text-warm-orange px-4 py-2 rounded-full text-sm font-semibold mb-4">
                        {storyDetails.category}
                      </div>
                      <h1 className="text-4xl md:text-5xl font-bold text-warm-charcoal leading-tight mb-4">
                        {storyDetails.title}
                      </h1>
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                          <Heart className="h-5 w-5 text-red-500" fill="currentColor" />
                          <span className="font-bold">{storyDetails.hearts} hearts</span>
                        </div>
                        <div className="text-sm text-warm-charcoal-light">
                          <span className="font-semibold text-warm-green">{storyDetails.donationRaised}</span> raised of {storyDetails.donationGoal}
                        </div>
                      </div>
                    </div>
                    <div className="order-first md:order-last">
                      <img
                        src={storyDetails.image}
                        alt={storyDetails.title}
                        className="w-full h-64 md:h-80 object-cover rounded-2xl shadow-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Story Content */}
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl">
                  <div className="prose prose-lg max-w-none">
                    {storyDetails.fullStory.split('\n\n').map((paragraph, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.6 }}
                        className="mb-6"
                      >
                        {paragraph.startsWith('**') && paragraph.endsWith('**') ? (
                          <h3 className="text-xl font-bold text-warm-orange mb-3">
                            {paragraph.replace(/\*\*/g, '')}
                          </h3>
                        ) : paragraph.startsWith('- ') ? (
                          <ul className="list-none space-y-2">
                            <li className="flex items-start space-x-3">
                              <span className="text-warm-orange text-lg">•</span>
                              <span className="text-warm-charcoal-light leading-relaxed">
                                {paragraph.substring(2)}
                              </span>
                            </li>
                          </ul>
                        ) : (
                          <p className="text-warm-charcoal-light leading-relaxed text-lg">
                            {paragraph}
                          </p>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex flex-col sm:flex-row gap-4 mt-12 pt-8 border-t border-warm-orange/20"
                  >
                    <Button
                      asChild
                      className="bg-gradient-to-r from-warm-orange to-warm-golden hover:from-warm-golden hover:to-warm-orange text-white font-semibold px-8 py-4 text-lg"
                    >
                      <Link to="/donate">
                        <Heart className="mr-2 h-5 w-5 animate-heart-beat" fill="currentColor" />
                        Support Similar Stories
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="border-2 border-warm-green text-warm-green hover:bg-warm-green hover:text-white px-8 py-4 text-lg"
                    >
                      <Link to="/campaigns">
                        See All Campaigns
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* SECTION 1: HERO TITLE */}
        {!storyDetails && (
          <section className="h-screen flex items-center justify-center text-center">
            <div className="container mx-auto px-4">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                <h1 className="text-5xl md:text-7xl font-handwritten font-bold mb-4 transform -rotate-1">{t('impact.hero.title')}</h1>
                <p className="text-xl text-white/80 max-w-3xl mx-auto">{t('impact.hero.subtitle')}</p>
              </motion.div>
            </div>
          </section>
        )}

        {/* SECTION 2: LIVE LEDGER & LANTERN ORIGIN */}
        {!storyDetails && (
          <section className="py-20 bg-[#2d3748] relative">
            <div className="absolute -top-32 inset-x-0 h-screen pointer-events-none z-0">
              <AnimatePresence>
                {lanterns.map(lantern => (
                  <motion.button
                    key={lantern.tx.id}
                    initial={{ y: 0, opacity: 0 }}
                    animate={{ y: '-100vh', opacity: [0.7, 1, 1, 0] }}
                    transition={{ duration: lantern.duration, ease: "linear" }}
                    style={{ left: lantern.x }}
                    className="absolute w-20 h-24 pointer-events-auto"
                    aria-label={`Lantern from ${lantern.tx.from}`}
                    onClick={() => setSelectedTx(lantern.tx)}
                  >
                    <div className="relative w-full h-full animate-flicker">
                      <div className="absolute top-0 w-full h-16 bg-gradient-to-t from-yellow-500 to-orange-500 rounded-t-full rounded-b-sm opacity-80" />
                      <div className="absolute top-4 w-full h-12 bg-yellow-300 rounded-full blur-xl" />
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
    
            <div className="container mx-auto px-4 relative z-10">
              <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-handwritten font-bold mb-4 transform -rotate-1">The Ledger of Kindness</h2>
                    <p className="text-xl text-white/80 max-w-3xl mx-auto">A live, verifiable record of every act of generosity, forever etched on the blockchain.</p>
                </div>
                <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                    <h3 className="font-bold text-lg">Live Transactions</h3>
                    <Button 
                      variant="ghost" 
                      onClick={() => setFullLedgerVisible(true)} 
                      className="text-white/70 hover:text-white hover:bg-white/10 text-sm px-4 py-2"
                    >
                      View Full Ledger 
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                  <div className="h-[400px] sm:h-[500px] overflow-y-auto pr-2">
                      <AnimatePresence>
                        {allPlaques.slice(0, 50).map((plaque, index) => (
                          <motion.button layout key={plaque.id} initial={{ opacity: 0, y: -20, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} onClick={() => setSelectedTx(plaque)} className={`w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 sm:gap-4 text-left p-3 rounded-lg transition-colors text-sm ${index === 0 ? "bg-green-500/20 animate-[pulse_2s_ease-out_1]" : "hover:bg-white/5"}`}>
                            <div className="font-mono text-blue-400 truncate hidden md:block">{plaque.hash.substring(0,10)}...</div>
                            <p className="font-bold text-warm-orange truncate">{plaque.campaign}</p>
                            <div className="font-mono text-white/80 truncate hidden sm:block">{plaque.from}</div>
                            <div className="text-green-400 font-bold">{plaque.amount} MATIC</div>
                            <div className="text-white/60 italic truncate text-xs">{plaque.wish}</div>
                          </motion.button>
                        ))}
                      </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </div>
        </section>
        )}

        {/* SECTION 3: CHOOSE YOUR CAUSE & IMPACT GALLERY */}
        {!storyDetails && (
          <section className="py-20 bg-gradient-to-br from-[#10141c] via-[#1a202c] to-[#2d3748]">
            <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
              
              {/* Left side - Choose a Cause */}
              <motion.div 
                initial={{ opacity: 0, x: -50 }} 
                whileInView={{ opacity: 1, x: 0 }} 
                viewport={{ once: true }} 
                className="text-center lg:text-left"
              >
                <h2 className="text-4xl md:text-5xl font-handwritten font-bold text-white mb-6 transform -rotate-1">
                  Ready to Light Up Lives? ✨
                </h2>
                <p className="text-xl text-white/80 mb-8 max-w-md mx-auto lg:mx-0">
                  Every donation creates ripples of hope. Choose a cause that speaks to your heart and watch your kindness transform lives.
                </p>
                
                <div className="space-y-4">
                  <Button 
                    asChild 
                    className="btn-handmade w-full lg:w-auto"
                  >
                    <Link to="/campaigns" className="flex items-center justify-center lg:justify-start">
                      <Heart className="mr-3 h-6 w-6" fill="currentColor" />
                      Choose a Cause to Support
                    </Link>
                  </Button>
                  
                  <p className="text-white/60 text-sm italic">
                    🌟 Join 12,847+ kind souls making a difference
                  </p>
                </div>
              </motion.div>

              {/* Right side - Impact Gallery Button */}
              <motion.div 
                initial={{ opacity: 0, x: 50 }} 
                whileInView={{ opacity: 1, x: 0 }} 
                viewport={{ once: true }} 
                className="text-center"
              >
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
                  <h3 className="text-2xl md:text-3xl font-handwritten font-bold text-white mb-4 transform rotate-1">
                    See Our Impact Stories 📸
                  </h3>
                  <p className="text-white/80 mb-6 leading-relaxed">
                    Witness the beautiful transformation stories of people whose lives have been touched by your generosity. Real faces, real smiles, real change.
                  </p>
                  
                  <Button
                    onClick={() => setShowGallery(true)}
                    className="btn-handmade w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-purple-600 hover:to-blue-500 text-white border-2 border-blue-400"
                  >
                    <div className="flex items-center justify-center">
                      <span className="mr-3 text-2xl">🌟</span>
                      View Impact Gallery
                      <span className="ml-3 text-2xl">📱</span>
                    </div>
                  </Button>
                  
                  <div className="mt-4 flex justify-center space-x-2">
                    {helpedPeople.slice(0, 4).map((person, index) => (
                      <img
                        key={person.id}
                        src={person.image}
                        alt={person.name}
                        className="w-12 h-12 rounded-full border-2 border-white/30 shadow-lg transform hover:scale-110 transition-transform duration-200"
                      />
                    ))}
                    <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-white text-sm font-bold">
                      +{helpedPeople.length - 4}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        )}

        <AnimatePresence>
        {selectedTx && <DetailModal tx={selectedTx} onClose={() => setSelectedTx(null)} />}
        {isFullLedgerVisible && (
          <FullLedgerModal
            allPlaques={allPlaques}
            onSelectTx={(tx) => {
              setFullLedgerVisible(false);
              setSelectedTx(tx);
            }}
            onClose={() => setFullLedgerVisible(false)}
          />
        )}
      </AnimatePresence>

      {/* Impact Gallery */}
      <ImpactGallery 
        isOpen={showGallery} 
        onClose={() => setShowGallery(false)} 
      />
      </main>
    </div>
  );
}