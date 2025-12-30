# IntelliShare – Big Data Intelligence Platform Architecture (Design)

**Classification:** OFFICIAL - PROTOTYPE DESIGN  
**Date:** 2024-05-21  
**Version:** 2.0.0 (Expanded Scope)  
**Architect:** Senior Systems Lead  

## 1. Executive Summary
This document outlines the backend architecture for "IntelliShare," a Big Data intelligence platform designed for Law Enforcement Agencies (LEAs). The system addresses the challenges of **Data Ingestion, Indexing, Analytics, and Inter-Agency Sharing**.

**Core Philosophy:** The platform acts as a unified intelligence layer. It aggregates heterogeneous data from isolated silos (CCTNS, ESAKYA, Open Source) into a searchable index, enriched by assistive AI to highlight correlations without replacing human decision-making.

---

## 2. System Architecture Components (Conceptual)

The architecture follows a modular Event-Driven Design using a Pub/Sub model for high throughput data processing.

| Component | Technology (Conceptual) | Role |
| :--- | :--- | :--- |
| **Ingestion Gateway** | Apache Kafka | Handles high-velocity incoming data streams from diverse sources. |
| **Data Lake & Index** | Elasticsearch / Vector DB | Stores structured metadata and unstructured text/vectors for rapid retrieval. |
| **Enrichment Engine** | Python (NLP/Vision) | Processes raw data to extract entities and detect patterns (Assistive AI). |
| **Correlation Service** | Stream Processing | Links isolated events across different datasets in near real-time. |
| **Governance Layer** | IAM / ACL Policies | Manages Role-Based Access Control (RBAC) and Inter-Agency permissioning. |

---

## 3. Heterogeneous Data Ingestion Pipeline

To handle the variety of law enforcement data, the system utilizes topic-based ingestion. Raw data is normalized before indexing.

### A. Ingestion Sources & Topics
1.  **Police Databases (CCTNS/FIRs):**
    *   **Topic:** `ingest.firs.raw`
    *   **Data:** Structured XML/JSON containing First Information Reports, charge sheets, and arrest memos.
2.  **Digital Evidence Metadata (ESAKYA):**
    *   **Topic:** `ingest.media.meta`
    *   **Data:** Metadata from CCTV footage, call recordings (CDR), and forensic reports. *Note: Binary files remain in secure vaults; only metadata/hashes are ingested.*
3.  **Emergency Response Logs (CAD):**
    *   **Topic:** `ingest.logs.emergency`
    *   **Data:** Timestamped dispatch logs, distress calls, and patrol unit location pings.
4.  **Open Source Intelligence (OSINT):**
    *   **Topic:** `ingest.osint.social`
    *   **Data:** Publicly available social media signals, news tickers, and web scrapings related to public safety threats.

---

## 4. AI/ML Enrichment Layer (Assistive Intelligence)

The Enrichment Engine consumes data from the ingestion topics to add value before storage. This layer is **assistive**, providing context rather than automated decisions.

### Capabilities
*   **Entity Extraction (NER):** Automatically identifies and tags entities (Person Names, Locations, Vehicle Numbers, Organizations) within unstructured narrative text (e.g., FIR descriptions).
*   **Topic Detection:** Classifies incidents into categories (e.g., "Narcotics," "Cyber-Fraud," "Civil Unrest") based on keyword clusters and semantic analysis.
*   **Link Analysis:**
    *   Builds a knowledge graph connecting entities.
    *   *Example:* Identifying that 'Suspect A' in an FIR shares a 'Phone Number' found in an OSINT social media profile.
*   **Vector Embedding:** Converts case descriptions and images into vector embeddings to enable semantic search (finding cases with similar *meanings*, not just matching keywords).

---

## 5. Cross-Source Correlation & Alerting

This module detects patterns that emerge only when combining data from multiple sources.

### A. Correlation Logic
The system uses common identifiers (Entity IDs, Geolocation, Time Windows) to link disparate datasets:
*   **Scenario:** An "Emergency Call" (Source A) reports a riot at a location. Simultaneously, "Social Media" (Source B) spikes with keywords about a protest at the same coordinates.
*   **System Action:** The Correlation Service links these events, creating a unified "Incident Object" for the dashboard.

### B. Alerting Mechanisms (Near Real-Time)
Alerts are generated based on pre-defined rules and statistical thresholds running against the indexed data.
*   **Threshold Alerts:** Triggered when specific crime types in a geofence exceed a baseline average (e.g., "Spike in vehicle thefts in Sector 4").
*   **Pattern Alerts:** Triggered by specific entity combinations (e.g., "A 'Wanted' vehicle plate detected by ANPR near a sensitive high-security zone").
*   **Implementation:** These alerts are pushed to the frontend notification service via WebSockets.

---

## 6. Security, Governance & Inter-Agency Sharing

Given the sensitivity of data, security is architected at the granular object level.

### A. Role-Based Access Control (RBAC)
*   **Default Deny:** Users have zero access by default.
*   **Roles:**
    *   `Officer`: Read/Write access to own station's cases.
    *   `Analyst`: Read-only access to aggregated data for authorized regions.
    *   `Admin`: System configuration (cannot view sensitive case details).

### B. Inter-Agency Permissioning
*   Data is siloed by Agency ID (e.g., `agency_id: DEL_POLICE`).
*   **Explicit Sharing:** Sharing requires an explicit "Handshake."
    *   *Workflow:* Agency A requests access to Case X -> Agency B approves -> Access Token granted for Case X only.
*   **Temporary Grants:** Shared access can be time-bound (e.g., "Grant access for 48 hours").

### C. Immutable Audit Logging
*   **Scope:** Every search query, record view, export, and login is logged.
*   **Integrity:** Audit logs are structurally chained (cryptographically linked) to prevent tampering.
*   **Accountability:** User actions are tied to immutable Badge IDs, ensuring non-repudiation.

---

## 7. Data Models (Simplified Schema)

### Case Record (Enriched)
```json
{
  "caseId": "FIR-2024-DL-0992",
  "sourceSystem": "CCTNS",
  "narrative": "...",
  "extractedEntities": [
    { "type": "PERSON", "value": "Raj Malhotra", "confidence": 0.98 },
    { "type": "VEHICLE", "value": "DL-8C-1234", "confidence": 0.95 }
  ],
  "aiTags": ["Narcotics", "Cross-Border"],
  "correlationId": "CORR-7721" // Links to other events
}
```

### Alert Object
```json
{
  "alertId": "ALT-1002",
  "type": "ANOMALY_DETECTED",
  "severity": "HIGH",
  "trigger": "Geospatial spike in 'Theft' reports > 200% of norm",
  "timestamp": "2024-05-21T14:30:00Z",
  "relatedEntities": ["Sector-18", "Noida"]
}
```

---
*End of Design Document*