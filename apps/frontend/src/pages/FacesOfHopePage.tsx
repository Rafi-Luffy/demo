import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Heart, X, MapPin, Calendar, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// Sample data for helped people
const helpedPeople = [
  {
    id: 1,
    name: "Aarav Kumar",
    age: 8,
    category: "Education",
    location: "Mumbai, Maharashtra",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
    story: "Thanks to your generous donations, Aarav can now attend school regularly. He dreams of becoming a scientist and helping other children like him.",
    raised: "₹45,000",
    supporters: 127,
    campaignTitle: "Education for Underprivileged Children",
    dateHelped: "March 2024"
  },
  {
    id: 2,
    name: "Priya Sharma",
    age: 12,
    category: "Healthcare",
    location: "Delhi, India",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
    story: "Priya successfully underwent heart surgery thanks to community support. She's now healthy and back to playing with her friends.",
    raised: "₹2,80,000",
    supporters: 340,
    campaignTitle: "Critical Heart Surgery for Priya",
    dateHelped: "February 2024"
  },
  {
    id: 3,
    name: "Ravi Patel",
    age: 34,
    category: "Emergency",
    location: "Gujarat, India",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
    story: "After losing his home in floods, Ravi received emergency aid and is now rebuilding his life with his family. His small shop is thriving again.",
    raised: "₹1,20,000",
    supporters: 89,
    campaignTitle: "Flood Relief for Gujarat Families",
    dateHelped: "January 2024"
  },
  {
    id: 4,
    name: "Meera Devi",
    age: 45,
    category: "Women Empowerment",
    location: "Rajasthan, India",
    image: "https://images.unsplash.com/photo-1584043204475-8cc101d6c77a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
    story: "Meera started her own tailoring business with microfinance support. She now employs 5 other women from her village.",
    raised: "₹35,000",
    supporters: 67,
    campaignTitle: "Women's Microfinance Initiative",
    dateHelped: "April 2024"
  },
  {
    id: 5,
    name: "Arjun Singh",
    age: 16,
    category: "Education",
    location: "Punjab, India",
    image: "https://images.unsplash.com/photo-1546961329-78bef0414d7c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
    story: "Arjun received a scholarship and laptop for his engineering studies. He's now in his first year and excelling in his coursework.",
    raised: "₹65,000",
    supporters: 152,
    campaignTitle: "Higher Education Support",
    dateHelped: "June 2024"
  },
  {
    id: 6,
    name: "Sunita Yadav",
    age: 28,
    category: "Healthcare",
    location: "Uttar Pradesh, India",
    image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
    story: "Sunita's cancer treatment was successful thanks to early intervention and community support. She's now cancer-free and helping others.",
    raised: "₹4,50,000",
    supporters: 567,
    campaignTitle: "Cancer Treatment Support",
    dateHelped: "May 2024"
  },
  {
    id: 7,
    name: "Rohit Kumar",
    age: 22,
    category: "Disability Support",
    location: "Bihar, India",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
    story: "Rohit received a wheelchair and prosthetic leg, enabling him to pursue his passion for graphic design. He now works as a freelancer.",
    raised: "₹85,000",
    supporters: 234,
    campaignTitle: "Mobility Aid for Differently Abled",
    dateHelped: "March 2024"
  },
  {
    id: 8,
    name: "Kavya Reddy",
    age: 14,
    category: "Education",
    location: "Telangana, India",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=764&q=80",
    story: "Kavya, a brilliant student from a rural area, got access to online education tools and now mentors other students in her village.",
    raised: "₹25,000",
    supporters: 98,
    campaignTitle: "Digital Education Access",
    dateHelped: "April 2024"
  },
  {
    id: 9,
    name: "Vikram Gupta",
    age: 38,
    category: "Small Business",
    location: "Madhya Pradesh, India",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    story: "Vikram expanded his small grocery store with microcredit support. He now provides employment to 3 people from his community.",
    raised: "₹75,000",
    supporters: 156,
    campaignTitle: "Small Business Support Program",
    dateHelped: "February 2024"
  },
  {
    id: 10,
    name: "Ananya Das",
    age: 19,
    category: "Education",
    location: "West Bengal, India",
    image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
    story: "Ananya received vocational training in computer skills and now works at a local IT center, supporting her family's income.",
    raised: "₹40,000",
    supporters: 121,
    campaignTitle: "Vocational Training for Youth",
    dateHelped: "January 2024"
  },
  {
    id: 11,
    name: "Ramesh Yadav",
    age: 52,
    category: "Healthcare",
    location: "Chhattisgarh, India",
    image: "https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    story: "Ramesh's diabetes treatment and medication are now affordable thanks to healthcare subsidies. He's managing his condition well.",
    raised: "₹55,000",
    supporters: 178,
    campaignTitle: "Chronic Disease Management",
    dateHelped: "March 2024"
  },
  {
    id: 12,
    name: "Seema Joshi",
    age: 25,
    category: "Women Empowerment",
    location: "Uttarakhand, India",
    image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    story: "Seema learned organic farming techniques and now runs a successful vegetable farming business, inspiring other women farmers.",
    raised: "₹30,000",
    supporters: 87,
    campaignTitle: "Sustainable Agriculture for Women",
    dateHelped: "May 2024"
  }
];

interface GalleryModalProps {
  person: typeof helpedPeople[0];
  onClose: () => void;
}

function GalleryModal({ person, onClose }: GalleryModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <img
            src={person.image}
            alt={person.name}
            className="w-full h-64 object-cover rounded-t-2xl"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2">
            <h3 className="text-white font-bold text-lg">{person.name}</h3>
            <p className="text-white/80 text-sm">{person.age} years old</p>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <span className="bg-warm-orange text-white px-3 py-1 rounded-full text-sm font-semibold">
              {person.category}
            </span>
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin className="w-4 h-4 mr-1" />
              {person.location}
            </div>
          </div>

          <h4 className="text-xl font-bold text-warm-charcoal mb-2">{person.campaignTitle}</h4>
          
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            {person.story}
          </p>

          <div className="grid grid-cols-3 gap-4 bg-warm-cream rounded-lg p-4 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center text-warm-orange mb-1">
                <DollarSign className="w-5 h-5" />
              </div>
              <p className="text-sm text-gray-600">Amount Raised</p>
              <p className="font-bold text-warm-charcoal">{person.raised}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center text-warm-orange mb-1">
                <Heart className="w-5 h-5" />
              </div>
              <p className="text-sm text-gray-600">Supporters</p>
              <p className="font-bold text-warm-charcoal">{person.supporters}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center text-warm-orange mb-1">
                <Calendar className="w-5 h-5" />
              </div>
              <p className="text-sm text-gray-600">Helped</p>
              <p className="font-bold text-warm-charcoal">{person.dateHelped}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button asChild size="sm" className="flex-1 bg-warm-orange hover:bg-warm-orange/90 text-white">
              <Link to="/campaigns">
                <Heart className="w-4 h-4 mr-2" />
                Support Similar Causes
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="flex-1 border-warm-orange text-warm-orange hover:bg-warm-orange/5">
              <Link to="/volunteer">
                Volunteer with Us
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function FacesOfHopePage() {
  const [selectedPerson, setSelectedPerson] = useState<typeof helpedPeople[0] | null>(null);
  const [filter, setFilter] = useState('All');

  const categories = ['All', 'Education', 'Healthcare', 'Emergency', 'Women Empowerment', 'Disability Support', 'Small Business'];

  const filteredPeople = filter === 'All' 
    ? helpedPeople 
    : helpedPeople.filter(person => person.category === filter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2d3748] to-[#10141c]">
      {/* Hero Section */}
      <section className="py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-warm-orange/20 to-warm-green/20" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="hero-script text-5xl md:text-7xl text-white mb-6 transform rotate-1">
              Faces of Hope 🌟
            </h1>
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
              Meet the beautiful souls whose lives have been touched by your kindness. 
              Every smile tells a story of transformation, hope, and the incredible power of community.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 bg-white/5 backdrop-blur-sm border-y border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  filter === category
                    ? 'bg-warm-orange text-white shadow-lg'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <p className="text-center text-white/60 mt-4">
            Showing {filteredPeople.length} inspiring {filteredPeople.length === 1 ? 'story' : 'stories'}
          </p>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {filteredPeople.map((person, index) => (
              <motion.button
                key={person.id}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, rotate: index % 2 === 0 ? 2 : -2 }}
                className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-3 group hover:bg-white/20 transition-all duration-300"
                onClick={() => setSelectedPerson(person)}
              >
                <img
                  src={person.image}
                  alt={person.name}
                  className="w-full h-48 object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-xl" />
                <div className="absolute bottom-4 left-4 right-4 text-left">
                  <h4 className="text-white font-bold text-sm mb-1">{person.name}</h4>
                  <p className="text-warm-orange text-xs font-semibold mb-1">{person.category}</p>
                  <p className="text-white/80 text-xs flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {person.location}
                  </p>
                </div>
                <div className="absolute top-3 right-3">
                  <div className="w-8 h-8 bg-warm-orange rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="absolute top-3 left-3">
                  <span className="bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                    {person.supporters} supporters
                  </span>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Call to Action */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-16"
          >
            <p className="text-white/70 italic text-lg mb-8">
              Click on any image to read their heartwarming story ❤️
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="handmade" className="bg-warm-orange hover:bg-warm-orange/90 text-white transform hover:scale-105 shadow-lg px-8 py-4">
                <Link to="/campaigns">
                  <Heart className="mr-3 h-6 w-6" />
                  Choose a Cause to Support
                </Link>
              </Button>
              <Button asChild size="handmade" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-warm-charcoal transform hover:scale-105 px-8 py-4">
                <Link to="/volunteer">
                  Volunteer with Us
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {selectedPerson && (
          <GalleryModal 
            person={selectedPerson} 
            onClose={() => setSelectedPerson(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
