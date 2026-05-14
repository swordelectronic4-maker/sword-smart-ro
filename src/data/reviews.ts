export interface Review {
  id: number;
  name: string;
  rating: number;
  date: string;
  text: string;
  avatar: string;
  verified: boolean;
  location: string;
}

export const reviews: Review[] = [
  {
    id: 1,
    name: "Rahul Sharma",
    rating: 5,
    date: "2 weeks ago",
    text: "The water quality is noticeably different. My family can actually taste the minerals, and the app lets me monitor everything in real-time. Worth every rupee.",
    avatar: "RS",
    verified: true,
    location: "Mumbai, Maharashtra",
  },
  {
    id: 2,
    name: "Priya Venkatesh",
    rating: 5,
    date: "1 month ago",
    text: "Finally an RO that doesn't waste 80% water! Our water bill dropped significantly. The customizable TDS feature is a game-changer for different family needs.",
    avatar: "PV",
    verified: true,
    location: "Bangalore, Karnataka",
  },
  {
    id: 3,
    name: "Amit Patel",
    rating: 4,
    date: "3 weeks ago",
    text: "Installation was seamless — the technician knew the product inside out. The build quality is premium and the touchscreen display is very responsive. Highly recommend.",
    avatar: "AP",
    verified: true,
    location: "Ahmedabad, Gujarat",
  },
  {
    id: 4,
    name: "Sneha Gupta",
    rating: 5,
    date: "1 week ago",
    text: "After researching for months, SWORD was the clear winner. The dual-membrane technology actually works — my lab test confirmed the mineral retention. Amazing product!",
    avatar: "SG",
    verified: true,
    location: "Delhi NCR",
  },
  {
    id: 5,
    name: "Karthik Rajan",
    rating: 5,
    date: "3 days ago",
    text: "The IoT features are incredible. I can check filter life, TDS levels, and even get alerts when it's time to change filters. Best water purifier in India hands down.",
    avatar: "KR",
    verified: true,
    location: "Chennai, Tamil Nadu",
  },
  {
    id: 6,
    name: "Ananya Desai",
    rating: 4,
    date: "2 months ago",
    text: "Love the sleek design — looks like a premium appliance, not a bulky water purifier. The gold accents match my kitchen perfectly. Water tastes amazing too!",
    avatar: "AD",
    verified: true,
    location: "Pune, Maharashtra",
  },
  {
    id: 7,
    name: "Vikram Mehta",
    rating: 5,
    date: "1 month ago",
    text: "Been using for 6 months now. Filter life is genuinely 2x longer as promised. The AI switching is fascinating to watch on the app. Great investment for family health.",
    avatar: "VM",
    verified: true,
    location: "Hyderabad, Telangana",
  },
  {
    id: 8,
    name: "Meera Iyer",
    rating: 5,
    date: "2 weeks ago",
    text: "My doctor recommended SWORD specifically for mineral retention. As someone with calcium deficiency, this was the perfect choice. The water quality is exceptional.",
    avatar: "MI",
    verified: true,
    location: "Kochi, Kerala",
  },
];
