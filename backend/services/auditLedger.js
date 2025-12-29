
const crypto = require('crypto');

// Simulated Immutable Ledger
// In production, this would be a Write-Once-Read-Many (WORM) storage or Blockchain
let auditChain = [];

const calculateHash = (index, prevHash, timestamp, data) => {
    return crypto.createHash('sha256').update(index + prevHash + timestamp + JSON.stringify(data)).digest('hex');
};

const logAction = (user, action, resource, details = {}) => {
    const timestamp = new Date().toISOString();
    const index = auditChain.length;
    const prevHash = index > 0 ? auditChain[index - 1].hash : "0";
    
    const entryData = {
        user: user.badgeNumber || user.id,
        role: user.role,
        action: action.toUpperCase(),
        resource: resource,
        details: details
    };

    const hash = calculateHash(index, prevHash, timestamp, entryData);

    const logEntry = {
        index,
        timestamp,
        ...entryData,
        prevHash,
        hash
    };

    auditChain.push(logEntry);
    console.log(`[AUDIT] ${timestamp} | ${user.role} ${user.badgeNumber} | ${action} | Hash: ${hash.substring(0, 8)}...`);
    
    return logEntry;
};

const getLogs = () => {
    return [...auditChain].reverse(); // Newest first
};

const verifyIntegrity = () => {
    for (let i = 1; i < auditChain.length; i++) {
        const current = auditChain[i];
        const previous = auditChain[i - 1];

        if (current.prevHash !== previous.hash) {
            return false; // Chain broken
        }
        
        const recalculatedHash = calculateHash(current.index, current.prevHash, current.timestamp, {
            user: current.user,
            role: current.role,
            action: current.action,
            resource: current.resource,
            details: current.details
        });

        if (recalculatedHash !== current.hash) {
            return false; // Data tampered
        }
    }
    return true;
};

module.exports = {
    logAction,
    getLogs,
    verifyIntegrity
};
