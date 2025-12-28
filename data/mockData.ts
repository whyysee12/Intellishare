import { Case, ActivityLog, Notification, User } from '../types';

export const AGENCIES = ['CBI', 'Delhi Police', 'Mumbai Police', 'NIA', 'Cyber Cell', 'Narcotics Bureau'];

export const DEMO_USERS: User[] = [
  {
    id: 'u1',
    name: 'Admin User',
    badgeNumber: 'AD-9981',
    agency: 'BPRD',
    role: 'Administrator',
    email: 'admin@bprd.gov.in',
    avatar: 'https://picsum.photos/100/100'
  },
  {
    id: 'u2',
    name: 'Rajesh Kumar',
    badgeNumber: 'RJ-4421',
    agency: 'Rajasthan Police',
    role: 'Officer',
    email: 'officer@rajpolice.gov.in',
    avatar: 'https://picsum.photos/101/101'
  },
  {
    id: 'u3',
    name: 'Sarah Khan',
    badgeNumber: 'CB-1122',
    agency: 'CBI',
    role: 'Analyst',
    email: 'analyst@cbi.gov.in',
    avatar: 'https://picsum.photos/102/102'
  }
];

// Helper to generate random coordinates around India
const generateIndiaCoords = () => {
  const lat = 20 + Math.random() * 10;
  const lng = 72 + Math.random() * 10;
  return { lat, lng };
};

const CASE_TYPES = ['Theft', 'Fraud', 'Cybercrime', 'Drug Trafficking', 'Murder', 'Human Trafficking'];
const CITIES = ['Jaipur', 'Delhi', 'Mumbai', 'Bangalore', 'Kolkata', 'Pune', 'Chennai'];

export const generateCases = (count: number): Case[] => {
  return Array.from({ length: count }).map((_, i) => {
    const type = CASE_TYPES[Math.floor(Math.random() * CASE_TYPES.length)];
    const city = CITIES[Math.floor(Math.random() * CITIES.length)];
    const coords = generateIndiaCoords();
    
    return {
      id: `FIR-2024-${1000 + i}`,
      title: `${type} Case in ${city} - Sector ${Math.floor(Math.random() * 50)}`,
      description: `Investigation regarding reported ${type.toLowerCase()} activity. Multiple entities identified.`,
      type,
      status: Math.random() > 0.7 ? 'Closed' : 'Under Investigation',
      date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().split('T')[0],
      location: {
        lat: coords.lat,
        lng: coords.lng,
        city,
        address: `${Math.floor(Math.random() * 100)}, Market Road, ${city}`
      },
      priority: Math.random() > 0.8 ? 'High' : 'Medium',
      assignedOfficer: DEMO_USERS[Math.floor(Math.random() * DEMO_USERS.length)].name,
      entities: [
        { id: `e-${i}-1`, type: 'Person', value: 'Suspect Name ' + i },
        { id: `e-${i}-2`, type: 'Phone', value: '+91-98' + Math.floor(Math.random() * 100000000) },
        { id: `e-${i}-3`, type: 'Vehicle', value: 'DL-' + Math.floor(Math.random() * 10) + 'C-' + Math.floor(Math.random() * 9999) }
      ],
      similarityScore: Math.floor(Math.random() * 100)
    };
  });
};

export const MOCK_CASES = generateCases(50);

export const RECENT_ACTIVITY: ActivityLog[] = [
  { id: '1', action: 'New FIR Uploaded', user: 'Officer Rajesh', timestamp: '10 mins ago', type: 'success' },
  { id: '2', action: 'High Priority Alert', user: 'System AI', timestamp: '25 mins ago', type: 'alert' },
  { id: '3', action: 'Data Sync Completed', user: 'System', timestamp: '1 hour ago', type: 'info' },
  { id: '4', action: 'Case #2291 Shared', user: 'Analyst Sarah', timestamp: '2 hours ago', type: 'warning' },
];

export const NOTIFICATIONS: Notification[] = [
  { id: 'n1', title: 'New Access Request', message: 'CBI requested access to Case #441', type: 'share', read: false, time: '2m' },
  { id: 'n2', title: 'Anomaly Detected', message: 'Unusual transfer pattern detected in Delhi region', type: 'alert', read: false, time: '15m' },
];
