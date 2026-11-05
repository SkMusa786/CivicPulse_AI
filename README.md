# 🚀 CivicPulse AI

### AI-Powered Smart Civic Issue Reporting & Resolution Platform

**Transforming citizen complaints into actionable civic solutions
through Artificial Intelligence.**

```{=html}
<p align="center">
```
`<a href="https://civicai-smart-civic-issue-reporting-resolution-pl.ai.studio">`{=html}
`<strong>`{=html}🌐 LIVE DEMO --- Explore CivicPulse
AI`</strong>`{=html} `</a>`{=html}
```{=html}
</p>
```

------------------------------------------------------------------------

## 🌍 Overview

**CivicPulse AI** is an AI-powered civic issue reporting and resolution
platform designed to bridge the gap between citizens and municipal
authorities.

It enables citizens to report public infrastructure problems such as
damaged roads, potholes, drainage blockages, garbage accumulation, and
other civic issues through an intuitive digital platform.

Powered by **Google Gemini AI**, the platform analyzes uploaded images,
identifies recognizable civic problems, assesses their severity, and
recommends appropriate departments and corrective actions.

CivicPulse AI also provides dedicated interfaces for administrators and
municipal officers to manage complaints and coordinate resolution
activities.

**Our mission:** Make cities smarter, safer, and more responsive through
intelligent technology.

## 🌐 Live Application

**Try CivicPulse AI:**\
https://civicai-smart-civic-issue-reporting-resolution-pl.ai.studio

## 🎯 Problem We Address

Traditional civic complaint systems can face challenges such as:

-   Limited transparency in complaint management.
-   Delays in identifying and prioritizing infrastructure issues.
-   Difficulty categorizing complaints and assigning responsible
    departments.
-   Communication gaps between citizens and authorities.
-   Limited data-driven insight for planning civic improvements.

CivicPulse AI addresses these challenges with AI-assisted image analysis
and a centralized complaint management platform.

## 💡 Our Solution

CivicPulse AI brings citizens and civic authorities together through a
unified digital workflow:

1.  Citizens submit civic complaints and supporting photographs.
2.  Gemini AI analyzes uploaded images and identifies recognizable
    issues.
3.  The system provides issue categories, severity recommendations, and
    suggested departments.
4.  Administrators oversee complaints and coordinate the workflow.
5.  Municipal officers manage their assigned responsibilities.
6.  **SpotGuard AI** provides conceptual infrastructure improvement
    recommendations, estimated costs, materials, and implementation
    guidance.

## ✨ Key Features

### 1. AI-Powered Civic Issue Detection

-   Upload photographs of civic infrastructure problems.
-   Analyze images using Google Gemini Vision.
-   Identify recognizable civic issues.
-   Recommend issue categories and severity levels.
-   Suggest responsible departments and corrective actions.
-   Return confidence information and manual-review recommendations.
-   Report when an image does not contain a recognizable civic issue
    instead of inventing a classification.

### 2. SpotGuard AI --- Infrastructure Improvement Assistant

SpotGuard AI helps turn observed infrastructure problems into potential
improvement plans.

-   Analyzes visible conditions and potential risks.
-   Suggests infrastructure improvements.
-   Provides estimated implementation costs in INR.
-   Recommends materials and implementation methods.
-   Offers maintenance guidance.
-   Highlights access and permission considerations.
-   Generates conceptual AI-powered visual previews based on the
    uploaded scene.

### 3. Role-Based Access

The platform provides three dedicated access roles:

  -----------------------------------------------------------------------
  Role                                Responsibility
  ----------------------------------- -----------------------------------
  Citizen                             Report civic issues and use
                                      citizen-facing features.

  Administrator                       Oversee and manage the civic
                                      complaint workflow.

  Municipal Officer                   Handle assigned civic
                                      responsibilities and resolution
                                      activities.
  -----------------------------------------------------------------------

Authentication is implemented using JSON Web Tokens (JWT).

### 4. Centralized Complaint Management

A shared backend connects citizens, administrators, and municipal
officers, supporting a more organized complaint management workflow.

### 5. Secure AI Integration

-   Gemini API requests are processed through the Express backend.
-   API credentials remain on the server and are not exposed to the
    browser.
-   Protected AI endpoints require valid citizen authentication.
-   AI failures are reported explicitly rather than replaced with sample
    predictions.

## 🧠 AI Integration

CivicPulse AI integrates Google's Gemini models for image understanding
and infrastructure improvement assistance.

  -----------------------------------------------------------------------
  AI Component                        Purpose
  ----------------------------------- -----------------------------------
  Gemini Vision (`gemini-2.5-flash`)  Civic issue identification and
                                      image analysis.

  Gemini Image                        Conceptual infrastructure
  (`gemini-2.5-flash-image`)          improvement previews.
  -----------------------------------------------------------------------

### AI API Endpoints

#### `POST /api/ai/analyze-image`

Analyzes an uploaded image and returns structured information,
including:

-   Detected civic issue.
-   Issue category.
-   Severity recommendation.
-   Recommended department.
-   Confidence information.
-   Suggested corrective action.
-   Manual-review status.

If no civic issue is recognizable, the endpoint reports that rather than
inventing a result.

#### `POST /api/ai/spotguard`

Analyzes visible infrastructure conditions and returns:

-   Potential risks and improvement recommendations.
-   Estimated costs in INR.
-   Suggested materials.
-   Implementation guidance.
-   Maintenance recommendations.
-   Access and permission considerations.
-   AI-generated conceptual preview.

**Request requirements for both endpoints:**

-   Authentication: Valid citizen JWT.
-   Content-Type: `image/jpeg`, `image/png`, or `image/webp`.
-   Maximum request body: 10 MB.
-   Request body: Raw image bytes.

## 🛠️ Technology Stack

  Layer                         Technologies
  ----------------------------- -------------------------
  Frontend                      React, TypeScript, Vite
  Backend                       Node.js, Express.js
  Database                      MongoDB
  Authentication                JSON Web Tokens (JWT)
  AI Integration                Google Gemini API
  Image Understanding           Gemini Vision
  Conceptual Image Generation   Gemini Image Model
  Development Tools             VS Code, Git, GitHub

## 🏗️ System Architecture

CivicPulse AI follows a client-server architecture. The frontend
communicates with the Express REST API, which handles authentication,
database operations, and server-side Gemini requests.

``` text
              CITIZEN / ADMIN / OFFICER
                         |
                         v
               REACT + VITE FRONTEND
                         |
                         v
                  EXPRESS REST API
                         |
             +-----------+-----------+
             |           |           |
             v           v           v
          JWT AUTH   COMPLAINTS   AI SERVICES
             |           |           |
             |           v           v
             |        MONGODB    GOOGLE GEMINI
             |                       |
             |             +---------+---------+
             |             |                   |
             |             v                   v
             |        GEMINI VISION       GEMINI IMAGE
             |             |                   |
             +-------------+-------------------+
                           |
                           v
                    API RESPONSE
                           |
                           v
                   REACT FRONTEND
```

## ⚙️ Getting Started

Follow these steps to run CivicPulse AI locally.

### Prerequisites

Install the following:

-   [Node.js](https://nodejs.org/)
-   npm
-   [MongoDB](https://www.mongodb.com/)
-   [Google Gemini API key](https://aistudio.google.com/apikey)

### 1. Clone the Repository

``` bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <YOUR_PROJECT_DIRECTORY>
```

Replace the placeholders with your actual GitHub repository URL and
project directory name.

### 2. Install Dependencies

``` bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file from the example:

``` bash
cp .env.example .env
```

Configure the required values:

``` env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_secret_key
GEMINI_API_KEY=your_gemini_api_key

GEMINI_VISION_MODEL=gemini-2.5-flash
GEMINI_IMAGE_MODEL=gemini-2.5-flash-image
```

Use a strong, private JWT secret and a valid Gemini API key. Never
commit `.env` or expose credentials in frontend code.

### 4. Initialize Demo Accounts

``` bash
npm run server:seed
```

This command initializes the three predefined demo accounts. Their
passwords are configured by the backend seed script and are not included
in frontend source code.

### 5. Start the Backend

In one terminal:

``` bash
npm run server:dev
```

### 6. Start the Frontend

In a second terminal:

``` bash
npm run dev
```

Vite will display the local development URL in the terminal.

## 🔐 Demo Login Accounts

The application supports three predefined demo roles:

  Role                Email
  ------------------- -----------------------
  Citizen             `citizen@civicai.com`
  Administrator       `admin@civicai.com`
  Municipal Officer   `officer@civicai.com`

Run `npm run server:seed` to initialize the accounts. Use the demo
passwords configured in the backend seed script.

## 📡 API Reference

  -------------------------------------------------------------------------
  Method                  Endpoint                  Description
  ----------------------- ------------------------- -----------------------
  `POST`                  `/api/ai/analyze-image`   AI-powered civic image
                                                    analysis

  `POST`                  `/api/ai/spotguard`       Infrastructure analysis
                                                    and improvement
                                                    recommendations
  -------------------------------------------------------------------------

Both endpoints require citizen authentication and accept raw JPEG, PNG,
or WEBP image data up to 10 MB.

## 🧪 Validation

Run the following commands to check the project:

**TypeScript / Lint Check**

``` bash
npm run lint
```

**Production Build**

``` bash
npm run build
```

## 🔒 Security & Reliability

CivicPulse AI incorporates the following safeguards:

-   JWT-based authentication for protected routes.
-   Gemini API credentials are kept on the backend.
-   Environment variables are used for sensitive configuration.
-   AI endpoints validate authentication and supported image content
    types.
-   Image uploads are limited to 10 MB.
-   AI failures are surfaced explicitly; the application does not
    substitute fabricated sample predictions.

## 📌 Current Limitations

-   The original complaint photograph is currently stored in the MongoDB
    complaint document.
-   SpotGuard uploads and generated previews are returned to the browser
    and are not yet persisted as reusable image URLs.
-   Durable image hosting and automated notifications are planned future
    enhancements.

## 🚧 Future Enhancements

Our roadmap includes:

-   Cloud-based image storage with reusable image URLs.
-   Automated notifications for complaint updates.
-   Real-time complaint status tracking.
-   Civic issue analytics and geographic heatmaps.
-   Geographic visualization of reported infrastructure problems.
-   AI-assisted complaint prioritization and trend analysis.
-   Integration with municipal authorities and existing civic systems.

## 🌱 Impact & Vision

CivicPulse AI aims to create a more transparent, efficient, and
intelligent civic ecosystem.

By combining citizen participation, artificial intelligence, and digital
complaint management, we envision a future where civic problems can be
identified earlier, prioritized intelligently, and addressed more
efficiently.

**Better Reporting. Smarter Decisions. Stronger Communities.**

------------------------------------------------------------------------

## 👨‍💻 Built With Passion

Developed as part of the **GDG 24-Hour Hackathon** by:

### 🏆 Team Hack_Warriors

**Organized by Google Developer Groups (GDG)**

We believe technology is most powerful when it solves real-world
problems.

**Let's build smarter cities together! 🚀**

------------------------------------------------------------------------

```{=html}
<p align="center">
```
`<strong>`{=html}© 2026 CivicPulse AI \| Team
Hack_Warriors`</strong>`{=html}`<br>`{=html} `<em>`{=html}Empowering
Citizens. Connecting Communities. Transforming Cities.`</em>`{=html}
```{=html}
</p>
```
