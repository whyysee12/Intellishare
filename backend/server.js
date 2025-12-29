
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { CASES, USERS } = require('./data/store');
const AuditService = require('./services/auditLedger');
const EsakyaService = require('./services/mockEsakya');
const { GoogleGenAI } = require("@google/genai");
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// --- Middleware: Mock Authentication ---
// In a real app, this would verify JWT tokens.
// Here, we just expect a 'x-user-id' header for the demo.
const mockAuth = (req, res, next) => {
    const userId = req.headers['x-user-id'];
    const user = USERS.find(u => u.id === userId);
    
    if (!user && req.path !== '/') {
        // Default to first user if not provided for ease of demo
        req.user = USERS[1]; 
    } else {
        req.user = user;
    }
    next();
};

app.use(mockAuth);

// --- ROUTES ---

// 1. Health Check
app.get('/', (req, res) => {
    res.json({ 
        system: 'IntelliShare Backend', 
        status: 'Operational', 
        version: '1.0.0-Prototype',
        auditIntegrity: AuditService.verifyIntegrity() ? 'Secure' : 'Compromised'
    });
});

// 2. Case Management
app.get('/api/cases', (req, res) => {
    // Log access
    AuditService.logAction(req.user, 'VIEW_ALL_CASES', 'CASES_LIST');
    res.json(CASES);
});

app.get('/api/cases/:id', (req, res) => {
    const caseData = CASES.find(c => c.id === req.params.id);
    if (!caseData) return res.status(404).json({ error: 'Case not found' });
    
    // Log specific access (Audit Requirement)
    AuditService.logAction(req.user, 'VIEW_CASE_DETAIL', req.params.id);
    res.json(caseData);
});

// 3. Evidence Integration (ESAKYA)
app.get('/api/cases/:id/evidence', (req, res) => {
    const evidence = EsakyaService.getEvidenceForCase(req.params.id);
    AuditService.logAction(req.user, 'FETCH_EVIDENCE_METADATA', req.params.id);
    res.json(evidence);
});

app.post('/api/evidence/:id/verify', (req, res) => {
    const result = EsakyaService.verifyChainOfCustody(req.params.id);
    AuditService.logAction(req.user, 'VERIFY_CHAIN_OF_CUSTODY', req.params.id, { result: result.verified });
    res.json(result);
});

// 4. AI Briefing Service
app.post('/api/ai/briefing', async (req, res) => {
    const { caseId, context } = req.body;
    const caseData = CASES.find(c => c.id === caseId);
    
    if (!caseData) return res.status(404).json({ error: 'Case not found' });

    AuditService.logAction(req.user, 'GENERATE_AI_BRIEF', caseId);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `
            Act as a senior police analyst. 
            Generate a handover briefing for Case ${caseData.id}: ${caseData.title}.
            Context: ${caseData.description}. 
            Entities involved: ${JSON.stringify(caseData.entities)}.
            
            Format: HTML. 
            Include: 
            1. Current Situation
            2. Key Suspects
            3. Recommended Next Steps.
            
            Keep it strictly factual and professional.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt
        });

        res.json({ briefing: response.text });
    } catch (error) {
        console.error('AI Error', error);
        // Fallback for offline demo
        res.json({ briefing: "<h3>AI Gateway Offline</h3><p>Unable to generate live briefing. Please refer to manual case notes.</p>" });
    }
});

// 5. Audit Logs (For Supervisor Dashboard)
app.get('/api/audit/logs', (req, res) => {
    // Only allow if role is Admin (Simulated)
    if (req.user && req.user.role !== 'Administrator') {
        // Audit the failed attempt
        AuditService.logAction(req.user, 'UNAUTHORIZED_AUDIT_ACCESS', 'AUDIT_LOGS');
        return res.status(403).json({ error: 'Unauthorized' });
    }
    
    res.json(AuditService.getLogs());
});

app.listen(PORT, () => {
    console.log(`\n--- IntelliShare Backend Running on Port ${PORT} ---`);
    console.log(`[INFO] Audit Ledger Initialized`);
    console.log(`[INFO] ESAKYA Link Established`);
});
