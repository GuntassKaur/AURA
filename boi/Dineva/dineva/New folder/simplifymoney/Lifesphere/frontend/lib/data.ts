export interface ConnectedExpense {
  id: string;
  title: string;
  amount: number;
  formattedAmount: string;
  category: 'Stay' | 'Food' | 'Travel' | 'Activities' | 'Shopping' | 'Utilities';
  date: string;
  paymentMethod?: string;
}

export interface ConnectedDoc {
  id: string;
  title: string;
  fileType: 'pdf' | 'image' | 'doc';
  category: 'travel' | 'medical' | 'financial' | 'government' | 'subscriptions' | 'warranty';
  date: string;
  documentNo?: string;
  vendor?: string;
  amount?: string;
  expiryDate?: string;
  summary: string;
  ocrText: string;
  tags: string[];
}

export interface ConnectedPhoto {
  id: string;
  title: string;
  category: 'trip' | 'people' | 'places' | 'receipts' | 'nature';
  date: string;
  location: string;
  imageUrl: string;
  summary: string;
  detectedObjects: string[];
  people?: string[];
  connectedMemoryId?: string;
  connectedDocIds?: string[];
  exif: {
    camera: string;
    aperture: string;
    exposure: string;
    iso: string;
  };
}

export interface ConnectedMemory {
  id: string;
  title: string;
  type: 'trip' | 'passport' | 'payment' | 'medical' | 'purchase' | 'photos' | 'warranty';
  category: 'travel' | 'medical' | 'documents' | 'photos' | 'subscriptions' | 'personal' | 'financial';
  date: string;
  location: string;
  confidenceScore: number;
  summary: string;
  image?: string;
  relatedDocIds: string[];
  photoIds: string[];
  expenses: ConnectedExpense[];
  totalExpense: string;
  people: string[];
  places: string[];
  journeySteps: { title: string; desc: string }[];
}

export interface ConnectedSubscription {
  id: string;
  name: string;
  monthly: number;
  renewalDate: string;
  lastUsedDaysAgo: number;
  category: string;
  annualSavingIfCancelled: number;
  recommendation?: string;
}

export interface ConnectedUpcomingItem {
  id: string;
  groupKey: string;
  groupLabel: string;
  title: string;
  category: 'Bills' | 'Subscriptions' | 'Documents' | 'Travel' | 'Personal';
  amount?: string;
  description: string;
  actionLabel: string;
  dotColor: string;
  dueDate: string;
  urgency: 'critical' | 'warning' | 'info';
  relatedEntityId?: string;
}

// ── INITIAL DATA SET ───────────────────────────────────────────────────────────

export const INITIAL_EXPENSES: ConnectedExpense[] = [
  { id: 'exp-1', title: 'Taj Exotica Beach Resort Stay', amount: 8200, formattedAmount: '₹8,200', category: 'Stay', date: 'March 12, 2026', paymentMethod: 'HDFC Infinia' },
  { id: 'exp-2', title: 'Brittos & Fisherman\'s Wharf Dining', amount: 4100, formattedAmount: '₹4,100', category: 'Food', date: 'March 14, 2026', paymentMethod: 'UPI' },
  { id: 'exp-3', title: 'IndiGo Flight Tickets (DEL-GOI)', amount: 3800, formattedAmount: '₹3,800', category: 'Travel', date: 'March 11, 2026', paymentMethod: 'HDFC Infinia' },
  { id: 'exp-4', title: 'Coastal Scooter Rental & Fuel', amount: 2300, formattedAmount: '₹2,300', category: 'Activities', date: 'March 13, 2026', paymentMethod: 'Cash' },
  { id: 'exp-5', title: 'BSES Electricity Payment', amount: 4230, formattedAmount: '₹4,230', category: 'Utilities', date: 'Aug 30, 2026', paymentMethod: 'NetBanking' },
  { id: 'exp-6', title: 'Samsung Split AC Purchase (Croma)', amount: 54000, formattedAmount: '₹54,000', category: 'Shopping', date: 'Dec 15, 2025', paymentMethod: 'ICICI Card' },
];

export const INITIAL_DOCUMENTS: ConnectedDoc[] = [
  {
    id: 'doc-passport',
    title: 'Indian Passport (Republic of India)',
    fileType: 'pdf',
    category: 'government',
    date: '18 Sep 2016',
    documentNo: 'Z4928104',
    expiryDate: '18 Sep 2026',
    summary: 'Official Republic of India passport. Expiry date approaching in 18 days.',
    ocrText: 'REPUBLIC OF INDIA / PASSPORT. Given Name: Guntass. Surname: Kaur. Date of Expiry: 18/09/2026. Place of Issue: Delhi. Code: IND.',
    tags: ['Identity', 'Travel', 'Government', 'High Priority']
  },
  {
    id: 'doc-electricity',
    title: 'BSES Yamuna Electricity Bill - August 2026',
    fileType: 'pdf',
    category: 'financial',
    date: '28 Aug 2026',
    documentNo: 'CA-102948102',
    vendor: 'BSES Yamuna Power Limited',
    amount: '₹4,230',
    expiryDate: '31 Aug 2026',
    summary: 'Monthly domestic electricity bill. Due date is tomorrow. Auto-pay not active.',
    ocrText: 'BSES YAMUNA POWER LTD. CA No: 102948102. Bill Date: 20 Aug 2026. Due Date: 31 Aug 2026. Total Amount Payable: INR 4,230. Units Consumed: 482 kWh.',
    tags: ['Utility', 'Electricity', 'Bill', 'Pending Payment']
  },
  {
    id: 'doc-indigo',
    title: 'IndiGo Flight Confirmation #6E-2018 (DEL → GOI)',
    fileType: 'pdf',
    category: 'travel',
    date: '10 Mar 2026',
    documentNo: '6E-2018',
    vendor: 'IndiGo Airlines',
    amount: '₹3,800',
    summary: 'Flight booking from New Delhi (DEL) to Goa Dabolim (GOI) for Goa Coastal Journey.',
    ocrText: 'IndiGo E-Ticket. PNR: 6E-2018. Passenger: Guntass Kaur. Sector: DEL-GOI. Flight: 6E-2018. Seat: 14F.',
    tags: ['Travel', 'Goa', 'Flight', 'Ticket']
  },
  {
    id: 'doc-taj',
    title: 'Taj Exotica Goa Booking Voucher',
    fileType: 'pdf',
    category: 'travel',
    date: '11 Mar 2026',
    documentNo: 'TAJ-GOA-9481',
    vendor: 'Taj Hotels & Resorts',
    amount: '₹8,200',
    summary: '3-night coastal villa booking confirmation at Benaulim, Goa.',
    ocrText: 'Taj Exotica Resort & Spa Goa. Guest: Guntass Kaur. Check-in: 12 Mar 2026. Check-out: 16 Mar 2026. Room: Garden View Villa. Amount Paid: ₹8,200.',
    tags: ['Travel', 'Hotel', 'Goa', 'Invoice']
  },
  {
    id: 'doc-samsung',
    title: 'Samsung 1.5 Ton Split AC Warranty & Croma Invoice',
    fileType: 'pdf',
    category: 'warranty',
    date: '15 Dec 2025',
    documentNo: 'CR-DL-98210',
    vendor: 'Croma Megastore',
    amount: '₹54,000',
    expiryDate: '15 Dec 2030',
    summary: '10-Year Digital Inverter Compressor Warranty & 5-Year Comprehensive product coverage.',
    ocrText: 'CROMA INVOICE. Product: Samsung 1.5 Ton 5 Star Inverter Split AC (AR18TY5). Serial: SAC982104B. Warranty: 5 Years PCB, 10 Years Compressor.',
    tags: ['Warranty', 'Appliance', 'Invoice', 'Active']
  }
];

export const INITIAL_PHOTOS: ConnectedPhoto[] = [
  {
    id: 'photo-1',
    title: 'Goa Sunset at Baga Beach',
    category: 'trip',
    date: 'March 15, 2026',
    location: 'Goa, India',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    summary: 'Warm golden hour sunset with palm tree silhouettes and gentle ocean waves at Baga.',
    detectedObjects: ['Sunset', 'Ocean', 'Palm Trees', 'Beach Scenery', 'Goa Trip'],
    people: ['Aman Gupta', 'Rhea Sen'],
    connectedMemoryId: 'mem-1',
    connectedDocIds: ['doc-indigo', 'doc-taj'],
    exif: {
      camera: 'Sony A7 IV · 35mm',
      aperture: 'f/2.8',
      exposure: '1/250s',
      iso: '200'
    }
  },
  {
    id: 'photo-2',
    title: 'Anjuna Coastal Cliffs & Rocky Shore',
    category: 'places',
    date: 'March 14, 2026',
    location: 'Vagator & Anjuna Cliff, Goa',
    imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
    summary: 'Panoramic view of rocky coastline and blue Arabian sea waters during morning coastal drive.',
    detectedObjects: ['Coastal Rocks', 'Sea Waves', 'Blue Sky', 'Goa Trip'],
    people: ['Aman Gupta'],
    connectedMemoryId: 'mem-1',
    connectedDocIds: ['doc-taj'],
    exif: {
      camera: 'Sony A7 IV · 24mm',
      aperture: 'f/8.0',
      exposure: '1/500s',
      iso: '100'
    }
  },
  {
    id: 'photo-3',
    title: 'Evening Seafood Dinner with Friends',
    category: 'people',
    date: 'March 13, 2026',
    location: 'Fisherman\'s Wharf, Panjim, Goa',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    summary: 'Warm candle-lit dinner gathering with friends along the Mandovi river bank.',
    detectedObjects: ['People', 'Dining Table', 'Food', 'Goa Trip'],
    people: ['Aman Gupta', 'Rhea Sen', 'Self'],
    connectedMemoryId: 'mem-1',
    connectedDocIds: ['doc-taj'],
    exif: {
      camera: 'iPhone 15 Pro Max',
      aperture: 'f/1.8',
      exposure: '1/30s',
      iso: '400'
    }
  },
  {
    id: 'photo-4',
    title: 'Internship Team Demo Day Celebration',
    category: 'people',
    date: 'August 14, 2026',
    location: 'Bangalore Tech Park',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    summary: 'Completing 12-week product engineering internship demo with mentor Priya and tech team.',
    detectedObjects: ['Office', 'Celebration', 'Team', 'Milestone'],
    people: ['Rahul Sharma', 'Priya Menon'],
    connectedMemoryId: 'mem-2',
    connectedDocIds: [],
    exif: {
      camera: 'iPhone 15 Pro Max',
      aperture: 'f/1.8',
      exposure: '1/120s',
      iso: '160'
    }
  },
  {
    id: 'photo-5',
    title: 'Samsung AC Purchase Invoice & Warranty Card',
    category: 'receipts',
    date: 'December 16, 2025',
    location: 'Home Residence, Delhi',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80',
    summary: 'Document capture of Croma purchase invoice and stamped warranty certificate for Samsung Split AC.',
    detectedObjects: ['Invoice', 'Warranty Card', 'Samsung AC'],
    connectedMemoryId: 'mem-4',
    connectedDocIds: ['doc-samsung'],
    exif: {
      camera: 'iPhone 15 Pro Max',
      aperture: 'f/1.8',
      exposure: '1/60s',
      iso: '100'
    }
  }
];

export const INITIAL_MEMORIES: ConnectedMemory[] = [
  {
    id: 'mem-1',
    title: 'Goa Coastal Journey',
    type: 'trip',
    category: 'travel',
    date: 'March 12–16, 2026',
    location: 'Goa, India',
    confidenceScore: 98,
    summary: 'Four days of beaches, coastal road trips, seafood dinners, and sunsets across Baga Beach, Panjim and Anjuna.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    relatedDocIds: ['doc-indigo', 'doc-taj'],
    photoIds: ['photo-1', 'photo-2', 'photo-3'],
    expenses: [
      INITIAL_EXPENSES[0], // Hotel ₹8,200
      INITIAL_EXPENSES[1], // Food ₹4,100
      INITIAL_EXPENSES[2], // Travel ₹3,800
      INITIAL_EXPENSES[3]  // Other ₹2,300
    ],
    totalExpense: '₹18,400',
    people: ['Aman Gupta', 'Rhea Sen', 'Guntass Kaur'],
    places: ['Baga Beach', 'Panjim Mandovi River', 'Anjuna Cliffs', 'Brittos Restaurant', 'Dabolim Airport'],
    journeySteps: [
      { title: 'Delhi Departure', desc: 'IndiGo Flight #6E-2018 from Terminal 3' },
      { title: 'Goa Arrival', desc: 'Arrived at Dabolim Airport & rented scooter' },
      { title: 'Taj Exotica Stay', desc: 'Check-in at coastal resort villa' },
      { title: 'Baga & Anjuna Exploration', desc: 'Coastal walks, cliff views & beach cafes' },
      { title: 'Fisherman\'s Wharf Dinner', desc: 'Evening seafood feast with Aman & Rhea' },
      { title: 'Return Flight to Delhi', desc: 'IndiGo return flight with 128 memories captured' }
    ]
  },
  {
    id: 'mem-2',
    title: 'College Internship Milestone',
    type: 'photos',
    category: 'personal',
    date: 'June–August 2026',
    location: 'Bangalore Tech Park',
    confidenceScore: 94,
    summary: 'Completed 12-week product engineering internship. Delivered 3 major codebase feature deployments.',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    relatedDocIds: [],
    photoIds: ['photo-4'],
    expenses: [
      { id: 'exp-int-1', title: 'Bangalore Accommodation', amount: 35000, formattedAmount: '₹35,000', category: 'Stay', date: 'June 1, 2026' },
      { id: 'exp-int-2', title: 'Workstation Setup & Books', amount: 10000, formattedAmount: '₹10,000', category: 'Shopping', date: 'June 5, 2026' }
    ],
    totalExpense: '₹45,000',
    people: ['Rahul Sharma', 'Priya Menon', 'Guntass Kaur'],
    places: ['Bangalore Tech Park', 'Indiranagar Cafe'],
    journeySteps: [
      { title: 'Offer Acceptance', desc: 'Signed product engineering internship contract' },
      { title: 'Day 1 Onboarding', desc: 'Joined core systems architecture squad' },
      { title: 'Sprint 3 Shipped', desc: 'Shipped real-time notification engine' },
      { title: 'Demo Day & Certificate', desc: 'Presented project to engineering leads' }
    ]
  },
  {
    id: 'mem-3',
    title: 'Family Birthday Celebration',
    type: 'photos',
    category: 'photos',
    date: 'August 14, 2026',
    location: 'Delhi Residence',
    confidenceScore: 96,
    summary: 'Family gathering with 14 photographs captured, cake order, and warm memories.',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    relatedDocIds: [],
    photoIds: [],
    expenses: [
      { id: 'exp-bday-1', title: 'Artisan Bakery Cake', amount: 1800, formattedAmount: '₹1,800', category: 'Food', date: 'Aug 14, 2026' },
      { id: 'exp-bday-2', title: 'Dinner Catering', amount: 3000, formattedAmount: '₹3,000', category: 'Food', date: 'Aug 14, 2026' }
    ],
    totalExpense: '₹4,800',
    people: ['Family', 'Close Friends'],
    places: ['Delhi Home', 'Theos Patisserie'],
    journeySteps: [
      { title: 'Cake Pickup', desc: 'Custom Belgium chocolate cake collected' },
      { title: 'Family Dinner', desc: 'Celebration dinner at home with family' },
      { title: 'Photo Session', desc: 'Captured 14 high-res portraits' }
    ]
  },
  {
    id: 'mem-4',
    title: 'Samsung Split AC Purchase & Warranty Registration',
    type: 'warranty',
    category: 'documents',
    date: 'December 15, 2025',
    location: 'Home Residence, Delhi',
    confidenceScore: 95,
    summary: '5-year compressor and PCB warranty registered with Croma Megastore purchase invoice.',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80',
    relatedDocIds: ['doc-samsung'],
    photoIds: ['photo-5'],
    expenses: [INITIAL_EXPENSES[5]],
    totalExpense: '₹54,000',
    people: ['Self'],
    places: ['Croma Megastore South Ex', 'Home Residence'],
    journeySteps: [
      { title: 'In-store Purchase', desc: 'Purchased 1.5 Ton 5-Star Inverter AC' },
      { title: 'Installation & Invoice', desc: 'Installed by Samsung engineers, invoice saved' },
      { title: 'Warranty Sync', desc: 'Warranty registered automatically till Dec 2030' }
    ]
  }
];

export const INITIAL_SUBSCRIPTIONS: ConnectedSubscription[] = [
  {
    id: 'sub-netflix',
    name: 'Netflix Premium 4K',
    monthly: 649,
    renewalDate: 'Sept 2, 2026',
    lastUsedDaysAgo: 2,
    category: 'Entertainment',
    annualSavingIfCancelled: 7788,
    recommendation: 'Active usage (watched 2 days ago). Keep active.'
  },
  {
    id: 'sub-spotify',
    name: 'Spotify Family Plan',
    monthly: 179,
    renewalDate: 'Sept 12, 2026',
    lastUsedDaysAgo: 1,
    category: 'Music',
    annualSavingIfCancelled: 2148,
    recommendation: 'Daily usage. Great value across 4 family members.'
  },
  {
    id: 'sub-adobe',
    name: 'Adobe Creative Cloud All Apps',
    monthly: 1299,
    renewalDate: 'Sept 1, 2026',
    lastUsedDaysAgo: 45,
    category: 'Productivity',
    annualSavingIfCancelled: 15588,
    recommendation: 'Unused in last 45 days. Cancel to save ₹15,588/yr.'
  }
];

export const INITIAL_UPCOMING: ConnectedUpcomingItem[] = [
  {
    id: 'up-elec',
    groupKey: 'TODAY',
    groupLabel: 'Today · Aug 30, 2026',
    title: 'Electricity bill due (BSES)',
    category: 'Bills',
    amount: '₹4,230',
    description: 'BSES Yamuna Power. Auto-pay not active. Pay today to avoid surcharge.',
    actionLabel: 'Pay now',
    dotColor: '#E98291',
    dueDate: 'Aug 31, 2026',
    urgency: 'critical',
    relatedEntityId: 'doc-electricity'
  },
  {
    id: 'up-adobe',
    groupKey: 'SEP 1',
    groupLabel: 'September 1, 2026',
    title: 'Adobe Creative Cloud renewal',
    category: 'Subscriptions',
    amount: '₹1,299',
    description: 'Unused in past 45 days. Review before debit.',
    actionLabel: 'Review plan',
    dotColor: '#E9A23B',
    dueDate: 'Sept 1, 2026',
    urgency: 'info',
    relatedEntityId: 'sub-adobe'
  },
  {
    id: 'up-netflix',
    groupKey: 'SEP 2',
    groupLabel: 'September 2, 2026',
    title: 'Netflix Premium renewal',
    category: 'Subscriptions',
    amount: '₹649',
    description: 'Auto-renewal via registered card.',
    actionLabel: 'View plan',
    dotColor: '#5B5CE2',
    dueDate: 'Sept 2, 2026',
    urgency: 'info',
    relatedEntityId: 'sub-netflix'
  },
  {
    id: 'up-passport',
    groupKey: 'SEP 18',
    groupLabel: 'September 18, 2026',
    title: 'Passport renewal deadline window',
    category: 'Documents',
    description: 'Indian passport expires in 18 days. Submit online renewal form.',
    actionLabel: 'Start application',
    dotColor: '#E9A23B',
    dueDate: 'Sept 18, 2026',
    urgency: 'warning',
    relatedEntityId: 'doc-passport'
  },
  {
    id: 'up-flight',
    groupKey: 'OCT 4',
    groupLabel: 'October 4, 2026',
    title: 'IndiGo Flight #6E-104 (Delhi → Mumbai)',
    category: 'Travel',
    amount: '₹4,890',
    description: 'Terminal 3 · 08:30 AM departure · Seat 12C.',
    actionLabel: 'View booking',
    dotColor: '#3A9D78',
    dueDate: 'Oct 4, 2026',
    urgency: 'info'
  }
];
