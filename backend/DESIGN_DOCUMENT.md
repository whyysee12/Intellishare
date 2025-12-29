# IntelliShare – Backend System Architecture (Prototype)

**Classification:** OFFICIAL - PROTOTYPE DESIGN  
**Date:** 2024-05-21  
**Version:** 1.0.0  
**Architect:** Senior Systems Lead  

## 1. Executive Summary
This document outlines the backend architecture for "IntelliShare," a continuity intelligence layer designed for Indian Law Enforcement Agencies (LEAs). The system addresses the critical operational gap of **Investigative Continuity**—preventing information loss when Investigating Officers (IOs) are transferred or when cases are handed over.

**Core Philosophy:** The system is a **Read-Only Intelligence Overlay**. It does not replace CCTNS (Crime and Criminal Tracking Network & Systems) or ESAKYA (e-Evidence); it aggregates metadata from these systems to provide an instant, summarized operational picture.

---

## 2. Backend Service List (Microservices Architecture - Simulated)

| Service Name | Responsibility | Data Ownership |
| :--- | :--- | :--- |
| **Case Continuity Svc** | Manages case metadata, timeline reconstruction, and officer assignment history. | Case Metadata, Handover Logs, Timeline Events. |
| **Identity & Access (IAM)** | Handles RBAC (Role-Based Access Control) for Officers, Analysts, and Supervisors. | User Profiles, Session Tokens, Agency Mapping. |
| **Evidence Metadata Svc** | Interfacing layer for ESAKYA. Fetches file attributes without downloading raw binaries. | Reference Links, Chain-of-Custody Hashes, File Types. |
| **Intel Briefing Svc (AI)** | Orchestrates LLM calls to generate summaries and detect patterns. | No persistent data (Stateless processing). |
| **Audit Ledger Svc** | Ensures non-repudiation. Logs every view, search, and edit with cryptographic checksums. | Immutable Audit Trail. |

---

## 3. Core Data Models (JSON Schema)

### A. Case Record
```json
{
  "caseId": "FIR-2024-DL-0992",
  "status": "Active",
  "priority": "High",
  "assignedOfficerId": "OFF-8821",
  "jurisdiction": "New Delhi - Central",
  "transferHistory": [
    { "fromOfficer": "OFF-1102", "toOfficer": "OFF-8821", "date": "2024-03-10", "reason": "Transfer Order" }
  ],
  "continuityScore": 85
}
```

### B. Evidence Metadata (ESAKYA Reference)
```json
{
  "evidenceId": "EVD-9921",
  "caseRef": "FIR-2024-DL-0992",
  "type": "CCTV_Video",
  "esakyaReferenceUrl": "s3://esakya-secure-vault/dl/2024/evd-9921.mp4",
  "chainOfCustodyHash": "a1b2c3d4e5f6...", 
  "integrityStatus": "Verified"
}
```

### C. Audit Log (Immutable)
```json
{
  "logId": "LOG-1000234",
  "timestamp": "2024-05-21T10:00:00Z",
  "actorId": "OFF-8821",
  "action": "CASE_VIEW",
  "targetResource": "FIR-2024-DL-0992",
  "prevHash": "f9e8d7...",
  "currentHash": "1a2b3c..." 
}
```

---

## 4. REST API Contracts

### Service: Continuity Service
*   **Endpoint:** `GET /api/cases/:id/continuity`
    *   **Purpose:** Retrieves the full timeline and handover context for a specific case.
    *   **Response:** JSON object containing the timeline array and current officer notes.

*   **Endpoint:** `POST /api/cases/:id/handover`
    *   **Request:** `{ "targetOfficerId": "OFF-9999", "handoverNotes": "..." }`
    *   **Purpose:** Executes the transfer of responsibility. Triggers an Audit Log event.

### Service: Intel Briefing Service (AI)
*   **Endpoint:** `POST /api/ai/briefing`
    *   **Request:** `{ "caseId": "FIR-..." }`
    *   **Response:** `{ "summary": "...", "risks": "...", "pendingActions": [...] }`
    *   **Purpose:** Generates the "10-Minute Briefing" for the new officer.

---

## 5. ESAKYA Integration (Conceptual Pipeline)

1.  **Ingestion:** The system does **not** upload files directly.
2.  **Indexing:** It accepts a "Manifest" from the ESAKYA API containing:
    *   File Name & Size
    *   Custodian Name
    *   SHA-256 Hash
3.  **Visualization:**
    *   The UI displays a "Digital Locker" view.
    *   When an officer clicks "View," the system requests a **Time-Limited Signed URL** from ESAKYA.
    *   **Security:** This ensures evidence never permanently resides on the continuity server, maintaining the legal chain of custody.

---

## 6. Audit & Accountability Model

**Requirement:** Police systems requires strict oversight to prevent misuse (e.g., unauthorized lookup of VIP cases).

**Implementation:**
1.  **Zero-Exemption Logging:** Every API call (Read or Write) is logged.
2.  **Chained Hashing:** Each log entry contains a hash of the previous entry.
    *   *Effect:* If a database administrator tries to delete a log entry from the middle, the chain breaks, alerting the integrity monitor.
3.  **Supervisor View:** High-ranking officers (ACP/DCP level) have a specific dashboard to view "Access Anomalies" (e.g., an officer accessing 50 cases in 1 minute).

---

## 7. Demo Workflow (End-to-End)

1.  **Scenario:** Officer Rajesh is transferred. Officer Vikram takes over Case #FIR-2024-1044 (Narcotics Ring).
2.  **Login:** Officer Vikram logs in using his unique Badge ID.
3.  **Continuity Dashboard:** He sees "New Assignments."
4.  **AI Briefing:** He clicks "Generate Handover Brief."
    *   *System Action:* Aggregates 50 pages of PDFs and timeline events into a 10-point bulleted list.
5.  **Evidence Check:** He verifies the chain of custody for the seized laptop via the ESAKYA integration tab.
6.  **Action:** He adds a note: "Surveillance Approved," which is time-stamped and appended to the immutable timeline.
7.  **Audit:** The system records `ACTION: NOTE_ADD, ACTOR: VIKRAM, HASH: 7x8y9z`.

---
*End of Design Document*
