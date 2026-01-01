
const LOCATIONS = ['Sector 4', 'Central Market', 'Main Highway', 'City Plaza', 'Metro Station'];
const TOPICS = ['Public Unrest', 'Traffic/Accident', 'Fire/Hazard', 'Scam/Fraud', 'Police Action'];

// Generate a pool of mock posts
const generateMockPosts = (count = 50) => {
    const posts = [];
    const now = Date.now();
    
    for (let i = 0; i < count; i++) {
        const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
        // Create clusters/spikes for 'Public Unrest'
        const timeOffset = topic === 'Public Unrest' 
            ? Math.floor(Math.random() * 3600000) // Within last hour
            : Math.floor(Math.random() * 86400000); // Last 24 hours
            
        posts.push({
            id: `soc-${Math.random().toString(36).substr(2, 9)}`,
            text: `Reports of ${topic.toLowerCase()} near ${LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]}. #${topic.replace('/', '')}`,
            timestamp: new Date(now - timeOffset).toISOString(),
            location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
            topic: topic,
            sentiment: ['Public Unrest', 'Fire/Hazard'].includes(topic) ? 'Negative' : 'Neutral',
            risk: ['Public Unrest', 'Fire/Hazard'].includes(topic) ? 'High' : 'Low'
        });
    }
    return posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

const cachedPosts = generateMockPosts(100);

const getInsights = (query) => {
    let filtered = cachedPosts;
    
    // Filter by query if provided
    if (query) {
        const q = query.toLowerCase();
        filtered = cachedPosts.filter(p => 
            p.text.toLowerCase().includes(q) || 
            p.location.toLowerCase().includes(q) ||
            p.topic.toLowerCase().includes(q)
        );
    }

    // 1. Trending Keywords (Topic counts)
    const trending = {};
    filtered.forEach(p => {
        trending[p.topic] = (trending[p.topic] || 0) + 1;
    });
    const trendingData = Object.keys(trending).map(k => ({ name: k, count: trending[k] }));

    // 2. Timeline (Posts per hour)
    const timeline = {};
    filtered.forEach(p => {
        const hour = new Date(p.timestamp).getHours();
        const key = `${hour}:00`;
        timeline[key] = (timeline[key] || 0) + 1;
    });
    // Fill gaps roughly for demo
    const timelineData = Object.keys(timeline).map(k => ({ time: k, volume: timeline[k] })).sort((a, b) => parseInt(a.time) - parseInt(b.time));

    // 3. Insight Summary
    const highRiskCount = filtered.filter(p => p.risk === 'High').length;
    let summary = { status: "Normal Activity", color: "green" };
    
    if (filtered.length === 0) {
        summary = { status: "No Data Found", color: "gray" };
    } else if (highRiskCount > 5) {
        summary = { status: "Spike Detected", color: "red", details: `Unusual volume of high-risk posts (${highRiskCount}) in selection.` };
    } else {
        summary = { status: "Normal Activity", color: "emerald", details: "Volume and sentiment within baseline parameters." };
    }

    return {
        posts: filtered.slice(0, 20), // Limit for UI
        trending: trendingData,
        timeline: timelineData,
        summary
    };
};

module.exports = {
    getInsights
};
