# 12. TECHNICAL DEBT AND RISKS

---

## 1. Technical Debt (Code & Engineering)

1. **Uncommitted Working-Tree State:**
   Phase F collections, migrations, and public page rewires exist in the working tree without a Git checkpoint commit.
2. **Missing Unit Test Coverage:**
   The codebase relies heavily on Playwright smoke suites and custom TypeScript script harnesses. There is no Jest/Vitest unit testing for isolated adapters, slug resolvers, or data transforms.
3. **Phase Harnesses Lack CI Standardization:**
   Verification scripts (`verify-*.ts`) require manual execution with `$env:ALLOW_VERIFICATION_WRITES="true"`. They should be integrated into standard `npm test` pipelines.
4. **Hardcoded Form Copy (Defect D6):**
   Labels and helper text in `ProjectBriefForm.tsx` are hardcoded in the component instead of being retrieved from CMS blocks or translation dictionaries.
5. **No Nonce Pipeline for CSP:**
   The Content-Security-Policy currently allows `'unsafe-inline'` for scripts and styles due to Next.js streaming scripts. A strict nonce pipeline is recommended for long-term hardening.

---

## 2. Operational & Commercial Risks

1. **Lead Dropping (Defect D2):**
   *Likelihood: High / Impact: Severe.* Potential high-value enterprise leads could submit inquiries and receive a success screen while the data is never received by the sales team.
2. **Hosting Plan Incompatibility:**
   *Likelihood: Medium / Impact: High.* Deploying to standard shared cPanel hosting without dedicated Node.js App Router support could lead to failed deployments. A Node-capable host (Vercel, Railway, Coolify, or VPS) with managed PostgreSQL is required.
3. **WordPress Cutover SEO Disruption:**
   *Likelihood: Medium / Impact: Medium.* Cutting over DNS from the legacy WordPress site to Next.js without verifying 301 redirects for any legacy indexed URLs could cause short-term search indexing fluctuations.
4. **Ephemeral Storage Data Loss:**
   *Likelihood: High (if deployed before G2) / Impact: High.* Deploying to containerized hosting without persistent object storage (R2/S3) would cause uploaded media to vanish on server restart.

---

## 3. Business Missing Data (Not Engineering Debt)
- Real client projects, case study results, and metrics are currently `0`.
- Real article content is currently `0`.
- Official business email and confirmed office hours are pending owner input.
