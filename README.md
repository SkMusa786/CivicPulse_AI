# CivicPulse AI

### AI-Powered Civic Issue Reporting, Resolution & Public-Space Improvement Platform

**Better Reporting. Smarter Prioritization. Transparent Resolution.**

**Live application:** [Explore CivicPulse
AI](https://civicai-smart-civic-issue-reporting-resolution-pl.ai.studio)

------------------------------------------------------------------------

## 1. Product Overview

CivicPulse AI is a civic technology platform that connects citizens,
administrators, and municipal officers through a centralized
issue-reporting and resolution workflow. It integrates Google Gemini
multimodal AI for civic-issue image analysis and SpotGuard AI for
conceptual public-space improvement recommendations.

Citizens can report infrastructure problems with photographs,
descriptions, and location details. Administrators can review reports
and coordinate assignment, while municipal officers manage assigned
complaints and record resolution progress. Citizens can then follow the
status of their reports.

AI outputs are decision-support recommendations. They do not replace
administrator verification, municipal inspection, or professional
judgment.

## 2. Problem Statement

Traditional civic complaint processes can face: - Limited visibility
into complaint status and ownership. - Delays in recognizing and
prioritizing serious infrastructure problems. - Difficulty categorizing
complaints and routing them to the right department. - Communication
gaps between citizens, administrators, and field officers. - Limited use
of complaint data to guide preventive public-space improvements.

CivicPulse AI brings reporting, AI-assisted analysis, complaint
coordination, and improvement recommendations into one platform.

## 3. Final Product Workflow

``` text
Citizen submits photo + description + location
                     |
                     v
             CivicPulse Frontend
                     |
                     v
               Express Backend
                     |
        +------------+-------------+
        |            |             |
        v            v             v
    JWT Auth    Complaint DB   Gemini AI
                                  |
                         Image + text analysis
                                  |
                         Category / severity /
                         department suggestions
                                  |
                                  v
                         Administrator review
                                  |
                                  v
                         Officer assignment
                                  |
                                  v
                         Officer updates status
                                  |
                                  v
                         Citizen tracks progress
```

### Complaint lifecycle

1.  **Report:** Citizen submits an issue photograph, description, and
    location.
2.  **Analyze:** The backend sends the image to Gemini for multimodal
    analysis.
3.  **Structure:** The AI response provides issue details such as
    category, severity recommendation, and suggested department.
4.  **Review:** An administrator reviews the report and AI-assisted
    information.
5.  **Assign:** The complaint is coordinated with the responsible
    officer.
6.  **Resolve:** The officer updates progress and records resolution
    information.
7.  **Track:** The citizen follows the complaint status through the
    platform.

## 4. Key Features

### AI-Assisted Civic Issue Analysis

-   Analyzes uploaded civic-issue photographs using Gemini multimodal
    image understanding.
-   Suggests issue descriptions, categories, severity levels, and
    responsible departments.
-   Provides possible corrective actions.
-   Can indicate when an image does not show a recognizable civic issue
    or requires manual review.

### Role-Based Workspaces

  -----------------------------------------------------------------------
  Role                                Responsibilities
  ----------------------------------- -----------------------------------
  Citizen                             Submit reports, provide supporting
                                      details, and track progress.

  Administrator                       Review reports, oversee complaint
                                      handling, and coordinate
                                      assignment.

  Municipal Officer                   Manage assigned complaints, update
                                      progress, and record resolution
                                      details.
  -----------------------------------------------------------------------

Authentication uses JSON Web Tokens (JWT), with protected backend
routes.

### Centralized Complaint Management

A shared Express backend connects role-specific interfaces to MongoDB
complaint data, supporting a coordinated reporting and resolution
workflow.

### SpotGuard AI --- Public-Space Improvement Assistant

SpotGuard AI analyzes visible public-space conditions and generates
conceptual recommendations, which may include: - Potential
infrastructure and maintenance improvements. - Suggested materials and
implementation approaches. - Indicative cost estimates in INR. -
Maintenance guidance. - Access, safety, and permission considerations. -
AI-generated conceptual visual previews, when the configured image model
is available.

Recommendations and costs are indicative, not engineering assessments,
quotations, approvals, or guarantees. Actual work requires site
inspection and authorization.

## 5. AI and Technical Methodology

CivicPulse AI combines pretrained multimodal AI with conventional
backend application logic.

### 5.1 Multimodal Image Understanding

**Technology:** Google Gemini (`gemini-2.5-flash`, as configured)

The backend sends the uploaded image to Gemini. The model interprets
visible information and returns structured analysis. This is an
integration of a pretrained multimodal model; the project does not claim
to train a custom computer-vision model.

### 5.2 Natural Language Understanding

Gemini interprets the citizen's written description alongside the image
context to produce useful summaries and recommendations.

### 5.3 Structured AI Output and Backend Processing

The Express backend processes the AI response and uses the resulting
information in the application workflow. The backend is responsible for
authentication, validation, database operations, and role-based access.
AI-generated classifications and recommendations should be reviewed by
an administrator.

### 5.4 Complaint Prioritization --- Weighted Scoring Method

A transparent prioritization method can combine:

-   **Severity (S):** How serious is the issue?
-   **Public impact (I):** How many people or how much public
    infrastructure may be affected?
-   **Urgency (U):** How quickly may attention be required?

Proposed weighted formula:

\[ P = 0.5S + 0.3I + 0.2U \]

Each factor is scored from 1 to 10. Severity receives the greatest
weight, followed by public impact and urgency.

        Score Suggested priority
  ----------- --------------------
    8.0--10.0 Critical
     6.0--7.9 High
     4.0--5.9 Medium
     1.0--3.9 Low

**Implementation note:** This formula is documented as a proposed
product method. It must not be represented as an active feature unless
the scoring logic, factor inputs, database persistence, and dashboard
sorting have been implemented and tested. Gemini's severity
recommendation alone is not the same as a weighted priority score.

### 5.5 Generative AI for Improvement Previews

The configured Gemini image model can generate conceptual visual
previews of possible public-space improvements. These previews
illustrate ideas; they are not photographs of completed work.

### 5.6 AI-Assisted Workflow vs. Autonomous Agent

The documented design uses Gemini for analysis and recommendations,
while application code manages authentication, storage, permissions, and
workflow transitions. Calling a Gemini API does not, by itself, make the
application an autonomous AI agent. An agentic extension would need
defined tools, multi-step planning, permissions, approval checkpoints,
and audit logs.

## 6. System Architecture

``` text
+------------------------------------------------------+
|                  React + Vite Client                  |
|             Citizen | Admin | Officer                |
+----------------------------+-------------------------+
                             | HTTPS / REST
                             v
+------------------------------------------------------+
|                 Node.js + Express API                |
|                                                      |
| Authentication | Complaint APIs | AI Services       |
| Validation     | Business Logic | SpotGuard         |
+----------------------+-------------------------------+
                       |
              +--------+---------+
              |                  |
              v                  v
+----------------------+  +----------------------------+
|       MongoDB        |  |      Google Gemini API     |
| Users and complaints |  | Multimodal image analysis  |
| Workflow data        |  | Image generation           |
+----------------------+  +----------------------------+
```

  -----------------------------------------------------------------------
  Component                           Responsibility
  ----------------------------------- -----------------------------------
  React, TypeScript, Vite             User interfaces and role-specific
                                      workflows.

  Node.js, Express, TypeScript        REST APIs, business logic,
                                      validation, and orchestration.

  MongoDB, Mongoose                   Persistence of application and
                                      complaint data.

  JWT                                 Authentication for protected
                                      routes.

  Google Gemini API                   Image understanding and
                                      AI-generated recommendations.

  Gemini image model                  Conceptual improvement-preview
                                      generation.
  -----------------------------------------------------------------------

Gemini credentials are used on the server and must never be exposed to
the browser.

## 7. Technology Stack

  Layer                         Technology
  ----------------------------- ------------------------------------
  Frontend                      React, TypeScript, Vite
  Backend                       Node.js, Express.js, TypeScript
  Database                      MongoDB
  Data modeling                 Mongoose
  Authentication                JSON Web Tokens (JWT)
  AI integration                Google Gemini API, `@google/genai`
  Image analysis                Gemini multimodal model
  Conceptual image generation   Gemini image model
  Development tools             VS Code, Git, GitHub

## 8. API Reference

  -------------------------------------------------------------------------
  Method                  Endpoint                  Purpose
  ----------------------- ------------------------- -----------------------
  `POST`                  `/api/ai/analyze-image`   Analyze a civic-issue
                                                    image and return
                                                    structured
                                                    recommendations.

  `POST`                  `/api/ai/spotguard`       Analyze a public-space
                                                    image and generate
                                                    improvement
                                                    recommendations.
  -------------------------------------------------------------------------

Both endpoints require a valid citizen JWT and accept raw JPEG, PNG, or
WEBP image data up to 10 MB, according to the project configuration.

## 9. Run Locally

### Prerequisites

-   [Node.js](https://nodejs.org/)
-   npm
-   [MongoDB](https://www.mongodb.com/)
-   [Google AI Studio API key](https://aistudio.google.com/apikey)

### 1. Clone the repository

``` bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <YOUR_PROJECT_DIRECTORY>
```

Replace the placeholders with your repository URL and project directory.

### 2. Install dependencies

``` bash
npm install
```

### 3. Configure environment variables

Create `.env` from `.env.example` and configure the backend values:

``` env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_random_secret
GEMINI_API_KEY=your_gemini_api_key

GEMINI_VISION_MODEL=gemini-2.5-flash
GEMINI_IMAGE_MODEL=gemini-2.5-flash-image
```

Use model identifiers supported by your Google AI project and code
configuration. Never commit `.env`, API keys, database credentials, or
private secrets.

### 4. Initialize demo accounts

``` bash
npm run server:seed
```

The seed script creates the predefined demo accounts. Refer to the
backend seed script for the current demo credentials.

### 5. Start the backend

``` bash
npm run server:dev
```

### 6. Start the frontend

Open a second terminal:

``` bash
npm run dev
```

Open the local URL printed by Vite.

## 10. Validation

Run the available project checks:

``` bash
npm run lint
npm run build
```

Before release, test database connectivity, all role logins, protected
API access, image upload, Gemini response handling, complaint
assignment, officer updates, and citizen status tracking in the target
environment.

## 11. Security and Reliability

-   Keep Gemini API keys and database credentials on the backend.
-   Use environment variables for secrets and deployment configuration.
-   Protect private API routes with JWT authentication and role
    authorization.
-   Validate uploaded image content types and enforce the configured
    size limit.
-   Surface AI service failures explicitly; do not substitute fabricated
    AI results.
-   Require human review before acting on AI-generated severity or
    department recommendations.
-   Treat generated cost estimates and conceptual previews as advisory.
-   Use HTTPS and restrict production CORS to trusted frontend origins.

## 12. Current Scope and Limitations

The project documentation identifies the following limitations; verify
them against the current deployed build: - Original complaint
photographs are stored in the MongoDB complaint document. - SpotGuard
uploads and generated previews are returned to the browser and are not
yet persisted as reusable image URLs. - Automated notifications and
durable reusable image hosting are not yet part of the documented
implementation. - AI analysis depends on Gemini service availability,
model access, and quota. - AI recommendations can be incorrect and
require administrator or qualified-personnel review. - The weighted
priority formula above remains proposed until its implementation is
confirmed.

## 13. Roadmap

1.  Implement and validate weighted complaint prioritization using
    severity, public impact, and urgency.
2.  Persist priority scores and add priority-based sorting and filtering
    to the administrator dashboard.
3.  Add durable cloud image storage and reusable image URLs.
4.  Add notifications for assignment and status changes.
5.  Add civic issue analytics, trend analysis, and geographic heatmaps.
6.  Add an audit history for complaint assignment and resolution.
7.  Integrate with municipal systems through approved APIs and
    workflows.
8.  Evaluate AI recommendations against reviewed real-world reports.

## 14. Expected Impact

CivicPulse AI aims to support easier civic reporting, more structured
information for administrators, better coordination with municipal
officers, transparent complaint tracking, and preventive public-space
improvement planning.

It is a decision-support and coordination platform. It complements,
rather than replaces, municipal inspection, professional engineering
judgment, and official approval processes.

## 15. Hackathon Project

Developed for the **GDG 24-Hour Hackathon** by **Team Hack_Warriors**.

**Organized by:** Google Developer Groups (GDG)

------------------------------------------------------------------------

```{=html}
<p align="center">
```
**CivicPulse AI**

*Empowering Citizens. Connecting Communities. Transforming Cities.*

**© 2026 Team Hack_Warriors**

```{=html}
</p>
```
