export type Tier = 'Elite' | 'Pro' | 'Starter'

export interface Affiliate {
  rank: number
  name: string
  location: string
  avatar: string
  color: string
  earned: number       // raw number for sorting
  earnedLabel: string  // display string
  period: string
  invites: number
  tier: Tier
  joinedMonths: number // months on platform
  streak: number       // monthly earning streak
}

const RAW: Omit<Affiliate, 'rank'>[] = [
  { name: 'Sneha R.',    location: 'Pune',        avatar: 'SR', color: '#fbbf24', earned: 208000, earnedLabel: '₹2,08,000', period: 'last month', invites: 208, tier: 'Elite',   joinedMonths: 18, streak: 14 },
  { name: 'Priya M.',    location: 'Mumbai',      avatar: 'PM', color: '#34d399', earned: 114500, earnedLabel: '₹1,14,500', period: 'last month', invites: 114, tier: 'Elite',   joinedMonths: 14, streak: 11 },
  { name: 'Ananya P.',   location: 'Chennai',     avatar: 'AP', color: '#fb923c', earned: 156000, earnedLabel: '₹1,56,000', period: 'last month', invites: 156, tier: 'Elite',   joinedMonths: 16, streak: 13 },
  { name: 'Rahul S.',    location: 'Delhi',       avatar: 'RS', color: '#a78bfa', earned: 82000,  earnedLabel: '₹82,000',   period: 'last month', invites:  82, tier: 'Pro',     joinedMonths: 10, streak:  8 },
  { name: 'Vikram T.',   location: 'Hyderabad',   avatar: 'VT', color: '#f472b6', earned: 63400,  earnedLabel: '₹63,400',   period: 'last month', invites:  63, tier: 'Pro',     joinedMonths:  9, streak:  6 },
  { name: 'Amit K.',     location: 'Bangalore',   avatar: 'AK', color: '#60a5fa', earned: 47200,  earnedLabel: '₹47,200',   period: 'last month', invites:  47, tier: 'Pro',     joinedMonths:  8, streak:  5 },
  { name: 'Nidhi G.',    location: 'Jaipur',      avatar: 'NG', color: '#e879f9', earned: 134000, earnedLabel: '₹1,34,000', period: 'last month', invites: 134, tier: 'Elite',   joinedMonths: 15, streak: 12 },
  { name: 'Karan V.',    location: 'Ahmedabad',   avatar: 'KV', color: '#38bdf8', earned: 97500,  earnedLabel: '₹97,500',   period: 'last month', invites:  97, tier: 'Pro',     joinedMonths: 12, streak:  9 },
  { name: 'Meera S.',    location: 'Kolkata',     avatar: 'MS', color: '#4ade80', earned: 72000,  earnedLabel: '₹72,000',   period: 'last month', invites:  72, tier: 'Pro',     joinedMonths: 11, streak:  7 },
  { name: 'Rohan D.',    location: 'Lucknow',     avatar: 'RD', color: '#facc15', earned: 58700,  earnedLabel: '₹58,700',   period: 'last month', invites:  58, tier: 'Pro',     joinedMonths:  9, streak:  6 },
  { name: 'Divya N.',    location: 'Chandigarh',  avatar: 'DN', color: '#f87171', earned: 41500,  earnedLabel: '₹41,500',   period: 'last month', invites:  41, tier: 'Pro',     joinedMonths:  7, streak:  4 },
  { name: 'Saurabh M.',  location: 'Bhopal',      avatar: 'SM', color: '#c084fc', earned: 31200,  earnedLabel: '₹31,200',   period: 'last month', invites:  31, tier: 'Starter', joinedMonths:  5, streak:  3 },
  { name: 'Tanvi R.',    location: 'Surat',       avatar: 'TR', color: '#2dd4bf', earned: 26800,  earnedLabel: '₹26,800',   period: 'last month', invites:  26, tier: 'Starter', joinedMonths:  4, streak:  3 },
  { name: 'Harsh P.',    location: 'Nagpur',      avatar: 'HP', color: '#fb7185', earned: 22400,  earnedLabel: '₹22,400',   period: 'last month', invites:  22, tier: 'Starter', joinedMonths:  4, streak:  2 },
  { name: 'Ishaan K.',   location: 'Indore',      avatar: 'IK', color: '#a3e635', earned: 19100,  earnedLabel: '₹19,100',   period: 'last month', invites:  19, tier: 'Starter', joinedMonths:  3, streak:  2 },
  { name: 'Pooja A.',    location: 'Vadodara',    avatar: 'PA', color: '#fdba74', earned: 16500,  earnedLabel: '₹16,500',   period: 'last month', invites:  16, tier: 'Starter', joinedMonths:  3, streak:  2 },
  { name: 'Arjun B.',    location: 'Coimbatore',  avatar: 'AB', color: '#67e8f9', earned: 14200,  earnedLabel: '₹14,200',   period: 'last month', invites:  14, tier: 'Starter', joinedMonths:  3, streak:  1 },
  { name: 'Simran K.',   location: 'Amritsar',    avatar: 'SK', color: '#d8b4fe', earned: 12000,  earnedLabel: '₹12,000',   period: 'last month', invites:  12, tier: 'Starter', joinedMonths:  2, streak:  1 },
  { name: 'Nikhil Y.',   location: 'Visakhapatnam', avatar: 'NY', color: '#86efac', earned: 9800, earnedLabel: '₹9,800',   period: 'last month', invites:  10, tier: 'Starter', joinedMonths:  2, streak:  1 },
  { name: 'Bhavna J.',   location: 'Rajkot',      avatar: 'BJ', color: '#fca5a5', earned: 8200,   earnedLabel: '₹8,200',    period: 'last month', invites:   8, tier: 'Starter', joinedMonths:  2, streak:  1 },
]

// Sort by earned descending, assign ranks
export const ALL_AFFILIATES: Affiliate[] = RAW
  .sort((a, b) => b.earned - a.earned)
  .map((a, i) => ({ ...a, rank: i + 1 }))

export const TOP_AFFILIATES = ALL_AFFILIATES.slice(0, 6)
