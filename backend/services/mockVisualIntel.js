
// Synthetic Watchlist - explicitly using generated faces to ensure no real persons are identified
const SYNTHETIC_WATCHLIST = [
    { 
        id: 'WL-8821', 
        name: 'Suspect Alpha', 
        risk: 'High', 
        crime: 'Aggravated Assault', 
        image: 'https://ui-avatars.com/api/?name=Suspect+Alpha&background=7f1d1d&color=fff&size=128',
        lastSeen: 'Sector 4, 2 days ago'
    },
    { 
        id: 'WL-9912', 
        name: 'Suspect Beta', 
        risk: 'Medium', 
        crime: 'Grand Theft Auto', 
        image: 'https://ui-avatars.com/api/?name=Suspect+Beta&background=c2410c&color=fff&size=128',
        lastSeen: 'Highway 8, Yesterday'
    },
    { 
        id: 'WL-1102', 
        name: 'Suspect Gamma', 
        risk: 'Critical', 
        crime: 'Fugitive Recovery', 
        image: 'https://ui-avatars.com/api/?name=Suspect+Gamma&background=b91c1c&color=fff&size=128',
        lastSeen: 'Unknown'
    }
];

// Logic to simulate comparing face embeddings
const performIdentification = (detectedFacesCount) => {
    // In a real system, we would compare 128-float vectors.
    // For this demo, we simulate matches based on random probability to demonstrate the UI.
    
    const results = [];
    const matchProbability = 0.3; // 30% chance to find a "match" in the crowd for demo purposes

    for (let i = 0; i < detectedFacesCount; i++) {
        const isMatch = Math.random() < matchProbability;
        
        if (isMatch) {
            // Pick a random suspect
            const suspect = SYNTHETIC_WATCHLIST[Math.floor(Math.random() * SYNTHETIC_WATCHLIST.length)];
            results.push({
                faceIndex: i,
                matchFound: true,
                subjectId: suspect.id,
                name: suspect.name, // Only named if in watchlist
                riskLevel: suspect.risk,
                confidence: (Math.random() * (0.99 - 0.75) + 0.75).toFixed(2), // 0.75 - 0.99
                metadata: { crime: suspect.crime }
            });
        } else {
            results.push({
                faceIndex: i,
                matchFound: false,
                subjectId: `CIV-${Math.floor(Math.random() * 10000)}`,
                name: 'Unknown Civilian', // Anonymized
                riskLevel: 'None',
                confidence: 0
            });
        }
    }

    return results;
};

const getCrowdAnalytics = (count) => {
    let density = 'Low';
    if (count > 5) density = 'Medium';
    if (count > 15) density = 'High';
    if (count > 30) density = 'Critical';

    return {
        totalFaces: count,
        densityLevel: density,
        estCrowdSize: Math.floor(count * 1.5) // Estimation logic
    };
};

module.exports = {
    SYNTHETIC_WATCHLIST,
    performIdentification,
    getCrowdAnalytics
};
