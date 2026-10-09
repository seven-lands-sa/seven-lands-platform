# SALES & SUPPORT CHAT WIDGET ARCHITECTURE (V1)
**Seven Lands (سفن لاند) — Sales Conversion & AI-Ready Support**  
**Document Authority:** Product Engineering & Systems Architecture  
**Date:** October 9, 2026  
**Primary Domain:** `https://7-lands.com`  
**Official WhatsApp Business:** `+966507776891`  
**Inquiries Target:** `sevenlands.sa@gmail.com` / `info@7-lands.com`  

---

## 1. Executive Overview & Objectives

The Seven Lands Sales & Support Chat Widget provides an immediate, high-touch consultation touchpoint for prospective enterprise and growth clients in Saudi Arabia and the GCC.

### Primary Objectives:
1. **Frictionless Discovery:** Immediate answers regarding the 7 Lands capabilities, methodology, and project kickoff process in both Arabic and English.
2. **High-Value Lead Capture:** Seamlessly collects visitor contact details (Name, Phone/WhatsApp, Email, Project Focus) and converts conversations into durable records in the Payload CMS `leads` collection.
3. **Instant WhatsApp Escalation:** Direct, context-preserving handoff to the official Seven Lands executive WhatsApp channel (`+966507776891`).
4. **AI-Ready Engine Interface:** Designed with a modular architecture so an LLM-based autonomous agent (e.g. Gemini 2.5 / Claude / custom assistant) can be plugged in without refactoring the client UI or lead intake pipeline.

---

## 2. Conversation Lifecycle & State Machine

```
   [ VISITOR ARRIVES ]
          │
          ▼
   ┌────────────────┐
   │ GREETING STATE │ ──> Displays proactive welcome in active locale (AR/EN)
   └────────────────┘     Presents quick-inquiry suggestion chips
          │
          ▼
   ┌────────────────────┐
   │ INTENT RECOGNITION │ ──> Answers capability questions (Services 01–07, KAFD office, etc.)
   └────────────────────┘
          │
          ▼
   ┌────────────────────┐
   │ LEAD CAPTURE FLOW  │ ──> Prompts for Name, Phone, and Project Scope
   └────────────────────┘
          │
          ├───> [ DB PERSISTENCE ] ──> Insert into PostgreSQL `leads` (Reference: SL-CHAT-YYYYMMDD-XXXX)
          │
          ├───> [ NOTIFICATION ]   ──> Resend email alert to sevenlands.sa@gmail.com
          │
          ▼
   ┌────────────────────┐
   │ WHATSAPP HANDOFF   │ ──> One-click continuation to +966507776891 with prefilled conversation context
   └────────────────────┘
```

---

## 3. Future AI Agent Provider Boundary

The widget backend implements the `SalesAssistantEngine` interface. In V1, a deterministic rule-based concierge handles inquiries and lead extraction. When AI inference is enabled, the provider simply implements `generateResponse`:

```typescript
export interface SalesAssistantEngine {
  /**
   * Evaluates incoming user prompt against the Seven Lands knowledge base.
   */
  generateResponse(params: {
    message: string;
    locale: "ar" | "en";
    conversationHistory: ChatMessage[];
    sessionId: string;
  }): Promise<{
    reply: string;
    suggestedChips?: string[];
    intent?: "INQUIRY" | "LEAD_CAPTURE" | "WHATSAPP_HANDOFF";
    capturedFields?: Partial<LeadCapturePayload>;
  }>;
}
```

### Knowledge Base Grounding for AI:
- **Brand Authority:** Seven Lands is an elite multidisciplinary marketing, technology, and business-growth consultancy based in Riyadh.
- **The Seven Lands:**
  - 01 Strategy & Business Growth (استراتيجية ونمو الأعمال)
  - 02 Branding & Creative (الهوية والعلامة التجارية)
  - 03 Content Production (الإنتاج الإبداعي وصناعة المحتوى)
  - 04 Social & Digital Presence (التواجد الرقمي والشبكات)
  - 05 Performance & Acquisition (الأداء واكتساب العملاء)
  - 06 Web & Commerce Experiences (التجارب الرقمية والتجارة)
  - 07 Software, Automation & Technology (البرمجيات والأتمتة والتقنية)
- **Ethical Integrity:** Never promise fixed commercial prices before discovery; always emphasize bespoke project assessment.

---

## 4. Security, Privacy & Compliance

1. **Anti-Spam & Rate Limiting:**
   - In-memory IP window limiting (maximum 15 messages per 10 minutes per IP).
   - Honeypot validation on lead capture inputs.
2. **Data Minimization & Sanitization:**
   - Strict XSS escaping of all user-entered text before rendering and storage.
   - Saudi phone number normalization via E.164 standard (`+966...`).
3. **No Unsolicited Tracking:**
   - Session identifiers stored in ephemeral `sessionStorage` (cleared when browser tab closes).
   - Compliant with Seven Lands strict consent management (`CookieConsentBanner`).
