# ElectionVerify AI — Documentation Index

Welcome to the comprehensive documentation suite for **ElectionVerify AI**, an AI-assisted election information verification and evidence analysis platform.

---

## 📚 Documentation Directory

| Document | Description |
|---|---|
| [**Architecture Overview**](./ARCHITECTURE.md) | High-level system design, independent React and Next.js frontends, Shared-Backend REST architecture, session strategy, and offline resilience. |
| [**API Flow & Specification**](./API_FLOW.md) | Comprehensive REST API contracts, authentication sequence, claim lifecycle, request/response formats, error codes, and rate limits. |
| [**Database Structure**](./DATABASE_STRUCTURE.md) | Complete MongoDB schema definitions, indexes, relationships, data dictionary, and canonical enum standards. |
| [**AI Verification Workflow**](./AI_VERIFICATION_WORKFLOW.md) | Multi-provider AI pipeline (Gemini, OpenAI, Unconfigured fallback), evidence retrieval, reasoning prompts, and explainability standards. |
| [**Responsible AI Safeguards**](./RESPONSIBLE_AI_SAFEGUARDS.md) | Ethical civic integrity guidelines, anti-hallucination policies, prohibition of fabricated evidence, and human-in-the-loop oversight. |
| [**Local Development Guide**](./LOCAL_DEVELOPMENT_GUIDE.md) | Step-by-step setup and execution instructions for running Shared-Backend, React-App, and NextJS-App concurrently. |

---

## 🏛️ System High-Level Summary

ElectionVerify AI employs a decoupled, service-oriented architecture:

```text
               ┌───────────────────────────────┐
               │    ElectionVerify Platform    │
               └───────────────┬───────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
   ┌─────────────────┐                   ┌─────────────────┐
   │ React SPA       │                   │ Next.js App     │
   │ (Vite + React)  │                   │ (App Router)    │
   │ Port: 5173      │                   │ Port: 3000      │
   └────────┬────────┘                   └────────┬────────┘
            │                                     │
            └──────────────────┬──────────────────┘
                               │ HTTP / JSON API (Bearer JWT)
                               ▼
                   ┌───────────────────────┐
                   │ Shared Express.js API │
                   │ Port: 5000            │
                   └───────────┬───────────┘
                               │
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                  ▼
   ┌─────────────────┐ ┌───────────────┐ ┌─────────────────┐
   │ MongoDB Database│ │ AI Providers  │ │ Search API      │
   │ (Mongoose ODM)  │ │ (Gemini/OAI)  │ │ (Google Custom) │
   └─────────────────┘ └───────────────┘ └─────────────────┘
```
