
// In-memory Mock Database
// Replaces MongoDB for the prototype to ensure portability and ease of setup.

const CASES = [
    {
      id: 'FIR-2024-1044',
      title: 'Narcotics Ring - Sector 4',
      description: 'Ongoing investigation into a synthetic drug distribution network operating out of Malviya Nagar.',
      type: 'Drug Trafficking',
      status: 'Under Investigation',
      priority: 'High',
      location: { lat: 26.9124, lng: 75.7873, city: 'Jaipur', address: 'Sector 4, Malviya Nagar' },
      assignedOfficer: 'Officer Rajesh Kumar',
      officerId: 'u2',
      date: '2024-03-10',
      entities: [
        { id: 'e1', type: 'Person', value: 'Raj Malhotra' },
        { id: 'e2', type: 'Location', value: 'Hideout B' }
      ],
      timeline: [
          { date: '2024-03-10', title: 'FIR Registered', type: 'start' },
          { date: '2024-03-12', title: 'Suspect Identified', type: 'suspect' }
      ]
    },
    {
      id: 'FIR-2024-0992',
      title: 'Cyber Phishing Cell',
      description: 'Call center bust regarding international tech support fraud.',
      type: 'Cybercrime',
      status: 'Closed',
      priority: 'Medium',
      location: { lat: 28.6139, lng: 77.2090, city: 'New Delhi', address: 'Okhla Phase III' },
      assignedOfficer: 'Sarah Khan',
      officerId: 'u3',
      date: '2024-02-15',
      entities: [],
      timeline: []
    }
];

const USERS = [
    { id: 'u1', name: 'Admin User', role: 'Administrator', badgeNumber: 'AD-9981', agency: 'BPRD' },
    { id: 'u2', name: 'Rajesh Kumar', role: 'Officer', badgeNumber: 'RJ-4421', agency: 'Rajasthan Police' },
    { id: 'u3', name: 'Sarah Khan', role: 'Analyst', badgeNumber: 'CB-1122', agency: 'CBI' }
];

module.exports = {
    CASES,
    USERS
};
