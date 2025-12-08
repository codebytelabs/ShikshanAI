connect this local repo to the remote : https://github.com/codebytelabs/ncert-smart-study.git

name it : ShikshanAI

Paper :
The product , ShikshanAI, is a PWA/mobile‑first AI tutor for CBSE/NCERT Classes 9–10, Math & Science, grounded in official NCERT textbooks and secondary‑stage learning outcomes, and architected so content and channels (later WhatsApp, other boards) are configuration, not rewrites. It delivers structured lessons, hint‑first doubt solving, adaptive practice, and lightweight teacher reports, all optimized for low‑end Android devices and spotty Indian networks using an offline‑capable Progressive Web App.ncert+4​
Below is a condensed but complete product + tech paper your team can execute against.


1. Product: users, scope, and features
Target users
Class 9–10 CBSE students using NCERT textbooks as primary study material; they mostly access the internet via smartphones and often lack consistent teacher/tutor support.cbseacademic+2​
Teachers, school/coaching admins, and NGOs who want visibility into where students struggle, mapped to CBSE/NCERT learning outcomes, without extra portal logins.ncert+2​
Curriculum scope
Board: CBSE “Secondary School Curriculum 2025–26” (Grades 9–10).vedantu+2​
Canonical content: NCERT Class 9 and 10 Mathematics and Science textbooks (English first), using their free official PDFs as the base corpus.ncert+2​
Structure: Board → Curriculum version → Grade (9,10) → Subject (Math, Science) → Unit → Chapter → Topic → Concept, with each concept linked to one or more NCERT learning‑outcome codes.azimpremjiuniversity+2​
Student‑facing features (MVP)
Onboarding and profile
OTP login (phone/email), Class (9/10) and Subject selection, consent (explicit parental consent for minors).
“Board” dropdown (CBSE as default) so adding ICSE/State boards later is a data change, not a schema change.
Home screen
“Today’s 10 minutes”: a short micro‑lesson or revision set selected from the student’s weak or due topics.
“Continue where you left off”: quick access to the last chapter/topic.
Simple progress tiles per subject (green/yellow/red topic coverage).
Learn mode (offline‑capable)
Chapter and topic list aligned to CBSE/NCERT syllabus, with labels identical to textbooks for easy mental mapping.ncert+1​
For each topic:
Concise concept recap drawn from ingested content.
Key formulas/definitions rendered cleanly.
3–5 practice questions (MCQ, numerical, short answer) with instant feedback.
“Lesson Packs” (next 2–3 chapters of text + questions) pre‑downloaded when on good connectivity for offline use.yeasitech+2​
Doubt solving (online‑only “Tutor mode”)
Free‑form text box: student types question (later: image upload of problems).
Logic:
Response 1: clarification and/or hint only.
Response 2: full solution only if student taps “Show full solution”, with step‑by‑step reasoning.
Every answer cites NCERT source: “NCERT Class 10 Science, Ch. 12, pp. 192–193.”ncert+1​
“This looks wrong” flag sends interaction into teacher review queue; reviewed answers feed back into content/graph corrections.
Practice and revision
Topic quizzes (5–10 questions) tied to specific concepts and NCERT learning‑outcome codes.ncert+1​
Spaced‑repetition engine that schedules questions based on correctness history and time since last attempt.
Teacher/parent features (Phase 2)
Institution/cohort setup: mapping students into named groups (e.g., “School X 10A Science 2025–26”).
Weekly WhatsApp/email PDFs per cohort:
Top 5 topics where students struggled most.
Engagement stats (how many students active, avg questions per student).
Suggested in‑class revision priorities, directly linked to CBSE units and NCERT learning‑outcome codes.cbseacademic+1​
WhatsApp (Phase 3, not MVP)
Role: trigger and summary channel, not primary UI.
Use cases:
Nudge: “Test on Electricity tomorrow; tap for a 5‑minute quiz.” → deep‑link into PWA.
Weekly snapshot: “You completed 3 chapters this week; see full report in the app.”


2. Pedagogy and content model
NCERT‑grounded content
Content base: official NCERT PDFs for Class 9–10 Math and Science, which CBSE explicitly expects schools to use and align with competency‑based learning outcomes.ncert+2​
Ingestion produces:
Cleaned paragraphs and sections mapped to chapters and topics.
Tagged concepts (e.g., “Ohm’s Law”, “Quadratic Equations”) and prerequisite links.
Mappings from each concept to NCERT learning‑outcome codes (e.g., “S.10.1”), using NCERT’s “Learning Outcomes at the Secondary Stage” documents.azimpremjiuniversity+1​
Hint‑first tutoring loop
Design principle: avoid turning the product into a pure answer key; keep cognitive load on the student.
For each doubt:
Stage 1: check for ambiguous wording → ask clarifying question if needed.
Stage 2: provide a short hint referencing the relevant concept or formula.
Stage 3: show complete solution only when explicitly requested, then recap the key step and link to source pages.
This matches NCERT/CBSE’s emphasis on competency‑based, understanding‑oriented outcomes rather than rote reproduction.cbseacademic+1​
Student model and personalization
For each {student, concept} pair, track:
Attempts, correct count, mastery estimate (0–1), last seen timestamp.
Use this to:
Choose which topic appears in “Today’s 10 minutes.”
Pick appropriate question difficulty (easier if mastery is low, mixed if mastery is high).
Drive spaced repetition scheduling so weaker concepts recur more often.
Safety and accuracy
Hard constraint: tutor answers only using retrieved NCERT/approved chunks, never world‑knowledge extrapolation for core content.
If retrieval confidence is low, tutor says it does not have enough information and asks student to rephrase or reference chapter/page.
All generated content passes through a content‑safety filter (for profanity, self‑harm, hate, etc.) and remains within academic scope; this aligns with NCERT/CBSE expectations around safe, values‑aligned school content.cbseacademic+1​


3. Technical architecture and stack
Why PWA‑first
PWAs give app‑like UX in the browser, installable to homescreen, with offline caching and low data usage—ideal for India’s mobile‑first, bandwidth‑constrained context.linkedin+2​
This avoids Play Store friction and heavy APKs, and keeps infra cost mostly fixed per concurrent user, unlike WhatsApp’s variable per‑conversation pricing.
High‑level architecture (mermaid)
text
flowchart LR
  U[Student/Teacher] -->|HTTPS| PWA[React/Next.js PWA]
  PWA -->|REST/WebSocket| API[FastAPI Backend]

  API --> AuthSvc[Auth Service]
  API --> TutorSvc[ Tutor Engine ]
  API --> ContentSvc[Curriculum & Content]
  API --> StudentSvc[Student Model & Practice]
  API --> ReportSvc[Reporting & Analytics]

  ContentSvc --> PG[(Postgres)]
  ContentSvc --> VecDB[(Vector DB)]
  TutorSvc --> PG
  TutorSvc --> VecDB
  TutorSvc --> LLM[(LLM API)]
  StudentSvc --> PG
  ReportSvc --> PG

Backend (Python/FastAPI)
Auth Service: OTP login, JWT issuance, user roles (student/teacher/admin).
Curriculum & Content Service: manages boards, curricula, grades, subjects, curriculum nodes (unit/chapter/topic) and concepts, and stores content chunks with NCERT textbook provenance.ncert+1​
Ingestion pipeline (batch tool, not real‑time):
Parse NCERT PDFs with unstructured/pdfminer + OCR (e.g., DocTR/Surya) for complex layouts.ncert+1​
Detect structure (chapters, headings), split into paragraphs.
Use an LLM to suggest concept mappings and learning‑outcome tags; present them in an internal validation UI for human approval before writing into the DB.
Generate embeddings (SentenceTransformers or API embeddings) and store IDs in vector DB (Qdrant/Weaviate).
Tutor Engine:
Input: {student_id, question_text}.
Steps:
Classify subject and candidate curriculum node(s) (simple rule‑based to start, small local model later).
Retrieve top‑k chunks from VecDB scoped to those nodes.
Compose a structured prompt including context, hint‑first instruction, and citation requirements.
Call LLM, post‑process answer, and store record in tutor_interactions (with flags, model, cost).
Exposes /tutor/answer and /tutor/followup endpoints to PWA.
Student Model & Practice Service:
Maintains student_concept_state table and generates “Today’s 10 minutes” topic list.
Logs practice_sessions and practice_responses to update mastery estimates and track learning over time.
Reporting & Analytics:
Aggregates interactions, practice results, and events into cohort‑level stats.
Generates weekly PDFs per cohort/teacher, exposing download links or pushing via WhatsApp/email.
Data layer
Postgres (single primary):
Holds boards/curricula/grades/subjects; curriculum nodes with ltree paths; concepts and prerequisites; learning outcomes; textbooks and chapter mappings; content chunks (raw text); users, students, teachers; practice and tutor interaction logs.
Using ltree avoids needing a separate graph DB while still modeling hierarchy neatly.ncert+1​
Vector DB (e.g., Qdrant):
Stores embeddings linked to content_chunks.
All RAG retrieval is done via content_embeddings → content_chunks joined back to curriculum nodes and textbooks.
Event/analytics tables:
Simple events table for logging key UX events (login, lesson start, quiz complete, doubt ask).
Frontend (Next.js/React PWA)
Mobile‑first layout with one column; optimized for low‑end Android screen sizes.
Use service workers (Workbox) for:
Caching shell assets and lesson JSON (“Lesson Packs”).
Offline fallback screens and queueing of practice results to sync later.dev+2​
Use IndexedDB (via localForage/RxDB) for:
Local store of downloaded lessons, questions, and recent tutor answers.
Local queue of unsynced events/responses.
Offline vs online boundaries
Offline‑capable:
Reading lesson text and viewing examples.
Attempting pre‑downloaded questions and seeing local answer keys.
Logging responses for syncing.
Online‑only:
Asking new doubts (Tutor Engine requires vector search + LLM).
Syncing progress and receiving updated practice recommendations.
UI clearly labels “Tutor mode (requires internet)” vs “Study mode (works offline).”


4. Implementation plan and guardrails
Phase 1 (0–3 months): Core engine + minimal PWA for 2–3 chapters
Implement base schema in Postgres.
Ingest and validate 2–3 chapters end‑to‑end (e.g., Class 9 Math “Number Systems” and Class 10 Science “Chemical Reactions”).cbseacademic+1​
Stand up vector DB and basic RAG pipeline with NCERT‑grounded answers and citations.
Build PWA shell: auth, chapter list, simple lesson view, Q&A box wired to /tutor/answer.
Phase 2 (3–6 months): Expand 9–10, add practice & reports
Extend ingestion and validation to full Class 9–10 Math & Science.
Implement practice engine (“Today’s 10 minutes”, topic quizzes, spaced repetition) and progress heatmap.
Build internal teacher review UI for flagged answers and weekly PDF generation.
Run small alpha pilots (50–100 students, 2–3 teachers); iterate prompts, answer formatting, and UI based on feedback.
Phase 3 (6–12 months): Pilots at scale, WhatsApp triggers
Complete NCERT 9–10 coverage and harden ingestion pipeline.
Run structured pilots with 1–2 schools/coaching centers and 1 NGO/CSR partner; measure activation, 7‑day retention, average questions per user, and pre/post topic test gains.
Once ≥1,000 WAU and ≥85% teacher‑approved answer accuracy are achieved at acceptable LLM cost per MAU, add WhatsApp as a nudge channel with deep‑links into the PWA.
Key guardrails
Accuracy: enforce RAG‑only answering, mandatory citations, and “I don’t know” fallback when context is weak.
Cost: hierarchical RAG, caching common Q&A, and model tiering (cheap models for routing, expensive only for complex reasoning).
Compliance: DPDP‑aligned data minimization, India‑based hosting, clear consent and retention policies informed by CBSE/NCERT’s emphasis on safe, competency‑based schooling.cbseacademic+2​
With this product and technical blueprint, a Python/React team has everything needed to start work: clear user value, bounded curriculum scope, an explicit pedagogical stance, concrete data and service design, and a phased, testable path from prototype to pilots.
https://ncert.nic.in/textbook.php?ln=en
https://cbseacademic.nic.in/web_material/CurriculumMain26/Sec/Curriculum_Sec_2025-26.pdf
https://www.yeasitech.com/why-progressive-web-apps-pwas-are-perfect-in-2024
https://www.linkedin.com/pulse/progressive-web-apps-mobile-first-strategy-indian-users-goseen-118pc
https://www.ncert.nic.in/pdf/notice/learning_outcomes.pdf
https://www.jagranjosh.com/articles/ncert-books-for-class-9-all-subjects-1591801668-1
https://azimpremjiuniversity.edu.in/media/publications/Learning-Outcomes-_Secondary-Stage.pdf
https://www.vedantu.com/syllabus/cbse-syllabus
https://cbseacademic.nic.in/curriculum_2026.html
https://ncert.nic.in/textbook.php
https://byjus.com/ncert-books/
https://dev.to/karthik_n/progressive-web-apps-building-offline-first-uis-never-lose-your-users-again-2mip
https://cbseacademic.nic.in/web_material/CurriculumMain26/SrSec/Curriculum_SrSec_2025-26.pdf
https://www.pitsolutions.com/services/progressive-web-apps-pwa
https://www.vedantu.com/ncert-books/ncert-books-class-9
https://ncert.nic.in/textbook.php?jesc1=9-16
https://www.educart.co/ncert/ncert-books-class-9
https://www.tiwariacademy.com/ncert-books/
https://motion.ac.in/blog/cbse-class-10-12-syllabus-2025-26-out-major-changes-key-highlights-you-must-know/
https://www.teachoo.com/ncert-books/
https://vinova.sg/progressive-web-apps-pwas-apac/
https://www.ncertbooks.guru/ncert-books-pdf/