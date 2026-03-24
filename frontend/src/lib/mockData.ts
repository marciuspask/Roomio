export interface User {
  id: string;
  name: string;
  age: number;
  avatar: string;
  bio: string;
  occupation: "student" | "working" | "other";
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  memberSince: string;
}

export interface Listing {
  id: string;
  type: "offering" | "seeking";
  title: string;
  description: string;
  district: string;
  city: string;
  price: number;
  utilitiesIncluded: boolean;
  availableFrom: string;
  photos: string[];
  allowsSmoking: boolean;
  allowsPets: boolean;
  genderPref: "any" | "male" | "female";
  isBoosted: boolean;
  isVerified: boolean;
  poster: User;
  views: number;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  time: string;
}

export interface Conversation {
  id: string;
  withUser: { id: string; name: string; avatar: string };
  listingTitle: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  messages: Message[];
}

export const vilniusDistricts = [
  "Senamiestis", "Žirmūnai", "Antakalnis", "Šnipiškės", "Lazdynai",
  "Karoliniškės", "Pilaitė", "Fabijoniškės", "Paupys", "Naujamiestis"
];

export const lithuanianCities = [
  "Vilnius", "Kaunas", "Klaipėda", "Šiauliai", "Panevėžys",
  "Alytus", "Marijampolė", "Mažeikiai", "Jonava", "Utena",
  "Kėdainiai", "Telšiai", "Visaginas", "Tauragė", "Ukmergė",
  "Plungė", "Druskininkai", "Palanga", "Neringa"
];

export const mockListings: Listing[] = [
  {
    id: "1",
    type: "offering",
    title: "Cozy room in modern flat, Žirmūnai",
    description: "Bright room in a newly renovated 3-room apartment. Quiet street, 10 min by bike to Old Town. Looking for a clean, friendly flatmate. I work full-time, enjoy cooking and reading. Bills included in price.",
    district: "Žirmūnai",
    city: "Vilnius",
    price: 380,
    utilitiesIncluded: true,
    availableFrom: "2025-06-01",
    photos: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
      "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800"
    ],
    allowsSmoking: false,
    allowsPets: true,
    genderPref: "any",
    isBoosted: true,
    isVerified: true,
    poster: {
      id: "u1", name: "Marta K.", age: 26,
      avatar: "https://i.pravatar.cc/150?img=47",
      bio: "Working in tech, love hiking and cooking.",
      occupation: "working", isEmailVerified: true, isPhoneVerified: true,
      memberSince: "2025-01-15"
    },
    views: 241,
    createdAt: "2025-05-01"
  },
  {
    id: "2",
    type: "seeking",
    title: "Student looking for room, Antakalnis area preferred",
    description: "VU student (3rd year, law). Tidy, quiet, non-smoker. Often at the library. Looking for a single room, ideally furnished. Happy to share kitchen and living room. Budget flexible if location is great.",
    district: "Antakalnis",
    city: "Vilnius",
    price: 320,
    utilitiesIncluded: false,
    availableFrom: "2025-07-01",
    photos: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"
    ],
    allowsSmoking: false,
    allowsPets: false,
    genderPref: "female",
    isBoosted: false,
    isVerified: true,
    poster: {
      id: "u2", name: "Agnė L.", age: 21,
      avatar: "https://i.pravatar.cc/150?img=23",
      bio: "Law student at VU. Bookworm, coffee enthusiast.",
      occupation: "student", isEmailVerified: true, isPhoneVerified: true,
      memberSince: "2025-02-10"
    },
    views: 89,
    createdAt: "2025-05-03"
  },
  {
    id: "3",
    type: "offering",
    title: "Large room with balcony, Šnipiškės",
    description: "Spacious 18sqm room with private balcony in a 2-person flat. Modern building, elevator, parking available. 5 min walk to Panorama mall. Flatmate is a 28-year-old designer, works from home some days.",
    district: "Šnipiškės",
    city: "Vilnius",
    price: 450,
    utilitiesIncluded: true,
    availableFrom: "2025-06-15",
    photos: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"
    ],
    allowsSmoking: false,
    allowsPets: false,
    genderPref: "any",
    isBoosted: true,
    isVerified: true,
    poster: {
      id: "u3", name: "Tomas R.", age: 28,
      avatar: "https://i.pravatar.cc/150?img=12",
      bio: "UX designer. Coffee snob. Neat freak (in the best way).",
      occupation: "working", isEmailVerified: true, isPhoneVerified: true,
      memberSince: "2024-11-20"
    },
    views: 312,
    createdAt: "2025-04-28"
  },
  {
    id: "4",
    type: "offering",
    title: "Affordable room near Lazdynai metro",
    description: "Good-sized room in a quiet 3-person flat. 2 current flatmates, both students. Great transport links — bus to city center in 15 min. Kitchen fully equipped. Looking for someone easy-going.",
    district: "Lazdynai",
    city: "Vilnius",
    price: 270,
    utilitiesIncluded: false,
    availableFrom: "2025-06-01",
    photos: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800"
    ],
    allowsSmoking: false,
    allowsPets: true,
    genderPref: "any",
    isBoosted: false,
    isVerified: false,
    poster: {
      id: "u4", name: "Lukas M.", age: 22,
      avatar: "https://i.pravatar.cc/150?img=33",
      bio: "VGTU student, into music production.",
      occupation: "student", isEmailVerified: true, isPhoneVerified: false,
      memberSince: "2025-03-05"
    },
    views: 55,
    createdAt: "2025-05-05"
  },
  {
    id: "5",
    type: "offering",
    title: "Sunny room in Old Town apartment",
    description: "Rare find — room in the actual Old Town. 2nd floor, wooden floors, high ceilings. Flat has 2 bedrooms total. Currently one flatmate (female, 27, works in finance). Bills not included but split fairly.",
    district: "Senamiestis",
    city: "Vilnius",
    price: 520,
    utilitiesIncluded: false,
    availableFrom: "2025-07-01",
    photos: [
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800"
    ],
    allowsSmoking: false,
    allowsPets: false,
    genderPref: "female",
    isBoosted: false,
    isVerified: true,
    poster: {
      id: "u5", name: "Eglė V.", age: 27,
      avatar: "https://i.pravatar.cc/150?img=56",
      bio: "Finance. Old Town local. Wine on Fridays.",
      occupation: "working", isEmailVerified: true, isPhoneVerified: true,
      memberSince: "2024-09-01"
    },
    views: 198,
    createdAt: "2025-04-20"
  },
  {
    id: "6",
    type: "seeking",
    title: "Erasmus student looking for flatmates, Sept start",
    description: "Coming from Berlin for an Erasmus year at ISM. Friendly, social but respects quiet hours. Happy to cook shared dinners sometimes. Looking for an international or open-minded household. Budget up to €400.",
    district: "Kiti",
    city: "Vilnius",
    price: 400,
    utilitiesIncluded: true,
    availableFrom: "2025-09-01",
    photos: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800"
    ],
    allowsSmoking: false,
    allowsPets: true,
    genderPref: "any",
    isBoosted: false,
    isVerified: true,
    poster: {
      id: "u6", name: "Leon B.", age: 23,
      avatar: "https://i.pravatar.cc/150?img=68",
      bio: "Erasmus @ ISM. Berlin native. Guitar player.",
      occupation: "student", isEmailVerified: true, isPhoneVerified: true,
      memberSince: "2025-04-30"
    },
    views: 134,
    createdAt: "2025-05-06"
  },
  {
    id: "7",
    type: "offering",
    title: "Room in Paupys — trendy new district",
    description: "Modern flat in the new Paupys development. 5 min walk to Bernardinai Garden. Bright, minimalist interior. Looking for someone working or doing a Masters. No parties, please — I have early starts.",
    district: "Paupys",
    city: "Vilnius",
    price: 490,
    utilitiesIncluded: true,
    availableFrom: "2025-06-01",
    photos: [
      "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800"
    ],
    allowsSmoking: false,
    allowsPets: false,
    genderPref: "any",
    isBoosted: true,
    isVerified: true,
    poster: {
      id: "u7", name: "Rūta J.", age: 30,
      avatar: "https://i.pravatar.cc/150?img=44",
      bio: "Architect. Minimalist. Plant parent.",
      occupation: "working", isEmailVerified: true, isPhoneVerified: true,
      memberSince: "2024-12-01"
    },
    views: 267,
    createdAt: "2025-04-25"
  },
  {
    id: "8",
    type: "seeking",
    title: "Young professional, flexible on location",
    description: "Just relocated to Vilnius for a new job at a startup. Looking for a furnished room in a calm, clean flat. Happy to share living spaces. Would love flatmates to occasionally hang out with but no pressure.",
    district: "Žirmūnai",
    city: "Vilnius",
    price: 430,
    utilitiesIncluded: true,
    availableFrom: "2025-06-15",
    photos: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800"
    ],
    allowsSmoking: false,
    allowsPets: false,
    genderPref: "any",
    isBoosted: false,
    isVerified: true,
    poster: {
      id: "u8", name: "Mantas P.", age: 29,
      avatar: "https://i.pravatar.cc/150?img=15",
      bio: "Startup product manager. Originally from Kaunas.",
      occupation: "working", isEmailVerified: true, isPhoneVerified: true,
      memberSince: "2025-05-01"
    },
    views: 76,
    createdAt: "2025-05-07"
  }
];

export const mockCurrentUser = {
  id: "current",
  name: "Justas T.",
  age: 24,
  avatar: "https://i.pravatar.cc/150?img=8",
  bio: "Software student at VGTU. Looking for a room from July.",
  occupation: "student" as const,
  isEmailVerified: true,
  isPhoneVerified: false,
  memberSince: "2025-05-01",
  myListings: ["4"]
};

export const mockConversations: Conversation[] = [
  {
    id: "c1",
    withUser: { id: "u1", name: "Marta K.", avatar: "https://i.pravatar.cc/150?img=47" },
    listingTitle: "Cozy room in modern flat, Žirmūnai",
    lastMessage: "Sure, we can arrange a viewing on Saturday morning!",
    lastMessageTime: "2025-05-08T10:30:00",
    unread: 2,
    messages: [
      { id: "m1", senderId: "current", text: "Hi! Is the room still available?", time: "2025-05-07T18:00:00" },
      { id: "m2", senderId: "u1", text: "Yes it is! Are you interested in viewing?", time: "2025-05-07T18:15:00" },
      { id: "m3", senderId: "current", text: "Definitely, when would work for you?", time: "2025-05-07T18:20:00" },
      { id: "m4", senderId: "u1", text: "Sure, we can arrange a viewing on Saturday morning!", time: "2025-05-08T10:30:00" }
    ]
  },
  {
    id: "c2",
    withUser: { id: "u5", name: "Eglė V.", avatar: "https://i.pravatar.cc/150?img=56" },
    listingTitle: "Sunny room in Old Town apartment",
    lastMessage: "The room is female-preference but I'm happy to chat.",
    lastMessageTime: "2025-05-06T14:00:00",
    unread: 0,
    messages: [
      { id: "m5", senderId: "current", text: "Hello! I saw your listing — amazing location!", time: "2025-05-06T13:00:00" },
      { id: "m6", senderId: "u5", text: "The room is female-preference but I'm happy to chat.", time: "2025-05-06T14:00:00" }
    ]
  }
];
