import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Search, MapPin, Users, Heart, Star, BookOpen, Droplets, Baby, 
    AlertTriangle, User, ShieldCheck, Link as LinkIcon, FileText, 
    CheckSquare, PlusCircle 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useDonationStore, type Campaign } from '@/store/donationStore';
import { formatCurrency, getProgressPercentage } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

// --- DATA & CONFIG ---
const getCategoriesWithTranslation = (t: any) => [
  { name: t('campaigns.categories.all'), icon: Star }, 
  { name: t('campaigns.categories.education'), icon: BookOpen },
  { name: t('campaigns.categories.emergency'), icon: AlertTriangle }, 
  { name: t('campaigns.categories.healthcare'), icon: Heart },
  { name: t('campaigns.categories.water'), icon: Droplets }, 
  { name: t('campaigns.categories.childWelfare'), icon: Baby },
  { name: t('campaigns.categories.women'), icon: User },
];

const getSortByOptionsWithTranslation = (t: any) => [
  { id: 'urgent', name: t('campaigns.sortBy.urgent') }, 
  { id: 'nearing_goal', name: t('campaigns.sortBy.nearingGoal') },
  { id: 'newest', name: t('campaigns.sortBy.newest') }, 
  { id: 'most_loved', name: t('campaigns.sortBy.mostLoved') }
];

// --- MAIN PAGE COMPONENT ---
export function CampaignsPage() {
  const { t } = useTranslation()
  // Use the store directly for instant loading
  const allCampaigns = useDonationStore((state) => state.campaigns);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(t('campaigns.categories.all'));
  const [sortBy, setSortBy] = useState('urgent');

  const categories = getCategoriesWithTranslation(t);
  const sortByOptions = getSortByOptionsWithTranslation(t);

  // Filtering and sorting now happens instantly on the client side
  const filteredCampaigns = allCampaigns.filter((campaign) => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === t('campaigns.categories.all') || campaign.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    switch (sortBy) {
      case 'urgent': return (b.isUrgent ? 1 : 0) - (a.isUrgent ? 1 : 0);
      case 'nearing_goal': return getProgressPercentage(b.raisedAmount, b.targetAmount) - getProgressPercentage(a.raisedAmount, a.targetAmount);
      case 'most_loved': return b.donorCount - a.donorCount;
      default: return 0;
    }
  });

  return (
    <div className="min-h-screen bg-warm-cream">
      {/* SECTION 1: HERO */}
      <section className="py-20 bg-gradient-to-br from-warm-orange/10 via-warm-cream to-warm-green/10 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl section-heading mb-4 transform -rotate-1 text-center">Stories That Need Your Heart 💝</h1>
          <p className="text-xl text-warm-charcoal-light max-w-3xl mx-auto text-center">Browse campaigns started by our vetted charity partners. Every donation is tracked on-chain for full transparency.</p>
        </motion.div>
      </section>
      
      {/* NEW SECTION: FOR CHARITIES & TRUST */}
      <section className="py-16 bg-white">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
              <div className="text-center md:text-left">
                  <h3 className="charity-question mb-3">Are you a Charity?</h3>
                  <p className="text-lg text-warm-charcoal-light mb-6">Join our platform to raise funds transparently and build trust with a global community of donors. Let's make a difference, together.</p>
                  <Button asChild size="handmade" className="bg-warm-orange hover:bg-warm-orange/90 text-white border-2 border-warm-orange transform hover:scale-105 hover:-rotate-2 shadow-lg font-bold px-8 py-4">
                      <Link to="/create-campaign"><PlusCircle className="mr-2 h-5 w-5"/> Start a Campaign</Link>
                  </Button>
              </div>
              <div className="bg-warm-cream p-6 rounded-2xl border border-warm-orange/20">
                  <h3 className="section-heading text-2xl mb-3">Our Commitment to Trust & Safety</h3>
                  <ul className="space-y-2 text-warm-charcoal-light list-inside">
                      <li className="flex items-start"><ShieldCheck className="h-5 w-5 mr-2 text-warm-green flex-shrink-0 mt-1"/><div><strong className="text-warm-charcoal">Charity Vetting:</strong> We perform a thorough due diligence check on every organization before they can post a campaign.</div></li>
                      <li className="flex items-start"><CheckSquare className="h-5 w-5 mr-2 text-warm-green flex-shrink-0 mt-1"/><div><strong className="text-warm-charcoal">Milestone-Based Funding:</strong> Donations are held in a smart contract and released in stages only after a charity submits proof of progress, which is then verified.</div></li>
                  </ul>
              </div>
          </div>
      </section>

      {/* SECTION 3: FILTERS & CAMPAIGN GRID */}
      <section className="py-20 bg-warm-cream">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="warm-card mb-8 p-6">
            <div className="grid md:grid-cols-2 gap-6 items-center mb-6">
                <div className="relative"><Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-warm-orange" /><input type="text" placeholder={t('campaigns.search')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none text-base bg-white" /></div>
                <div className="flex items-center space-x-2 overflow-x-auto pb-2">{sortByOptions.map(option => (<Button key={option.id} onClick={() => setSortBy(option.id)} variant={sortBy === option.id ? 'handmade' : 'outline'} className={`flex-shrink-0 text-sm ${sortBy !== option.id && 'border-warm-charcoal/20'}`}>{option.name}</Button>))}</div>
            </div>
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-t border-warm-orange/20 pt-4">{categories.map(cat => (<button key={cat.name} onClick={() => setSelectedCategory(cat.name)} className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm transition-colors flex-shrink-0 ${selectedCategory === cat.name ? 'bg-warm-blue text-white shadow-md' : 'bg-white hover:bg-warm-blue/10'}`}><cat.icon className="h-4 w-4" /><span>{cat.name}</span></button>))}</div>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedCampaigns.map((campaign, index) => (
              <motion.div 
                key={campaign.id} 
                initial={{ opacity: 0, y: 30, rotate: 0 }} 
                animate={{ opacity: 1, y: 0, rotate: index % 2 === 0 ? 1 : -1 }} 
                transition={{ delay: index * 0.05, duration: 0.5 }} 
                className="group transform hover:rotate-0 hover:-translate-y-3 transition-all duration-500"
              >
                <div className="bg-white rounded-3xl overflow-hidden shadow-lg border-2 border-warm-orange/20 hover:border-warm-orange/50 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                  <div className="relative overflow-hidden rounded-t-3xl">
                    <img
                      alt={campaign.title}
                      src={campaign.imageUrl}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-sm section-heading text-xs text-warm-blue shadow-lg">
                      {campaign.category}
                    </div>
                    <div className="absolute bottom-3 left-3 text-white flex items-center space-x-1 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full">
                      <MapPin className="h-3 w-3" />
                      <span className="text-xs font-medium">{campaign.location}</span>
                    </div>
                    {campaign.isUrgent && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                        🚨 Urgent
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 flex-grow flex flex-col space-y-4">
                    <h3 className="text-xl section-heading leading-tight transform -rotate-1 text-center">
                      {campaign.title}
                    </h3>
                    
                    <div className="flex items-center justify-between text-sm text-warm-charcoal-light">
                      <span className="flex items-center space-x-1">
                        <Heart className="h-4 w-4 text-red-500" fill="currentColor" />
                        <span className="font-medium">{campaign.donorCount} Donors</span>
                      </span>
                      <span className="flex items-center space-x-1" title="Verified milestones show proof of work has been submitted and approved.">
                        <CheckSquare className="h-4 w-4 text-warm-green"/>
                        <span className="font-medium">{campaign.milestones?.verified || 0} of {campaign.milestones?.total || 0} Milestones</span>
                      </span>
                    </div>
                    
                    <div className="flex-grow">
                      <div className="progress-handmade mb-2">
                        <div 
                          className="h-full bg-gradient-to-r from-warm-orange to-warm-green rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${getProgressPercentage(campaign.raisedAmount, campaign.targetAmount)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                          <span className="font-bold text-warm-green">{formatCurrency(campaign.raisedAmount)} raised</span>
                        </span>
                        <span className="text-warm-charcoal-light font-medium">of {formatCurrency(campaign.targetAmount)}</span>
                      </div>
                    </div>
                    
                    <div className="pt-4 mt-auto border-t border-warm-orange/30 space-y-3">
                      <div className="flex justify-around text-xs text-warm-charcoal-light">
                        <a href={`https://polygonscan.com/address/${campaign.contractAddress || '#'}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-warm-blue transition-colors transform hover:scale-105"> 
                          <LinkIcon className="h-3 w-3" /> 
                          <span className="font-medium">On-Chain Contract</span>
                        </a>
                        <a href={`https://ipfs.io/ipfs/${campaign.ipfsPlanHash || '#'}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-warm-blue transition-colors transform hover:scale-105"> 
                          <FileText className="h-3 w-3" /> 
                          <span className="font-medium">Immutable Proposal</span>
                        </a>
                      </div>
                      
                      <Button asChild className="btn-handmade w-full">
                        <Link to={`/donate?campaign=${campaign.id}`}>
                          <Heart className="mr-2 h-4 w-4" fill="currentColor" />
                          Donate with Love
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {sortedCampaigns.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <div className="text-6xl mb-4">💔</div>
              <h3 className="text-2xl section-heading mb-2">No stories found</h3>
              <p className="text-warm-charcoal-light mb-6">Try different filters to find stories that need your love</p>
              <Button onClick={() => { setSearchTerm(''); setSelectedCategory('All Stories'); }} className="btn-handmade">Show All Stories</Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 bg-warm-cream">
        <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="bg-gradient-to-r from-warm-orange via-warm-golden to-warm-green rounded-2xl p-12 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10 text-center max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-4xl section-heading mb-4 transform -rotate-1">Can't Choose? Donate to Our General Fund</h2>
                    <p className="text-xl mb-8 opacity-90">A general donation empowers us to allocate funds where they are most critically needed, all governed by the same transparent smart contract rules.</p>
                    <Button asChild className="btn-handmade bg-white text-warm-orange hover:bg-warm-cream transform hover:scale-110 hover:-rotate-2 shadow-lg font-bold px-8 py-4"><Link to="/donate"><Heart className="mr-3 h-5 w-5 animate-heart-beat" fill="currentColor" />Donate to General Fund</Link></Button>
                </div>
            </motion.div>
        </div>
      </section>
    </div>
  );
}

