
// Simulates the external ESAKYA Evidence Vault API
// We do not store files, only references.

const MOCK_EVIDENCE_VAULT = [
    { 
        id: 'EVID-9921', 
        caseId: 'FIR-2024-1044',
        filename: 'CCTV_Cam4_Footage.mp4', 
        type: 'Video', 
        size: '450 MB', 
        uploadedAt: '2024-03-11T14:15:00Z', 
        location: 'Sector 4 Market', 
        custodian: 'SI V. Sharma', 
        hash: 'a1b2c3d4e5f67890abcdef1234567890', 
        integrity: 'Valid' 
    },
    { 
        id: 'EVID-9922', 
        caseId: 'FIR-2024-1044',
        filename: 'Forensic_Report_A.pdf', 
        type: 'Document', 
        size: '2.4 MB', 
        uploadedAt: '2024-03-13T09:00:00Z', 
        location: 'Central Lab', 
        custodian: 'Dr. A. Gupta', 
        hash: 'f6e5d4c3b2a10987654321fedcba0987', 
        integrity: 'Valid' 
    }
];

const getEvidenceForCase = (caseId) => {
    return MOCK_EVIDENCE_VAULT.filter(e => e.caseId === caseId);
};

const verifyChainOfCustody = (evidenceId) => {
    const evidence = MOCK_EVIDENCE_VAULT.find(e => e.id === evidenceId);
    if (!evidence) return { verified: false, message: 'Evidence not found' };
    
    // Simulate a blockchain verification check
    return {
        verified: true,
        timestamp: new Date().toISOString(),
        blockchainTxId: `0x${evidence.hash.substring(0, 16)}...`
    };
};

module.exports = {
    getEvidenceForCase,
    verifyChainOfCustody
};
