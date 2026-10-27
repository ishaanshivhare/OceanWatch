# Prompt for AI Assistant: OceanWatch Web Application

**Role:** You are an expert Full-Stack Web Developer specialized in building highly interactive, modern, and scalable applications using Next.js.

**Task:** Build a complete web application (frontend and backend) named "OceanWatch". 

## 1. Project Overview
**OceanWatch** is an integrated platform for ocean hazard reporting and visualization. It serves dual purposes: displaying official early warnings from INCOIS (Indian National Centre for Ocean Information Services) and allowing authenticated users to submit crowdsourced hazard incident reports.

## 2. Tech Stack
*   **Framework:** Next.js (App Router)
*   **Styling:** Tailwind CSS
*   **UI Components:** shadcn/ui (Radix UI) + Lucide React for icons
*   **Authentication:** Clerk
*   **Mapping:** React-Leaflet (or Mapbox GL JS) for the interactive map
*   **Database/ORM:** Prisma with PostgreSQL (or Supabase) for storing user reports
*   **Icons/Typography:** Inter font (to simulate San Francisco/Apple typography)

## 3. UI/UX & Design Principles
The application must strictly follow modern, **Apple-like design principles**:
*   **Minimalism:** Lots of negative space (whitespace), clean lines, and no clutter.
*   **Typography:** Large, bold, and clear headings. High contrast for readability.
*   **Styling:** Subtle use of glassmorphism (translucent blurs), soft drop shadows, and rounded corners (e.g., `rounded-2xl` or `rounded-3xl`).
*   **Navigation:** Simple, intuitive navigation (e.g., a sleek top blurred navbar or a floating bottom tab bar for mobile).
*   **Color Palette:** Monochromatic base (whites, light grays, dark text) with vibrant, purposeful accent colors for hazards (Red for Critical, Orange/Yellow for Warning, Blue for Advisory).

## 4. Core Features & Requirements

### Feature 1: INCOIS Early Warning & Advisory Ingestion
*   Create a dedicated section or sidebar/feed that displays official warnings (e.g., High Wave Alerts, Tsunami warnings, Cyclone tracks).
*   Since live INCOIS API integration might require specific credentials, please implement a robust **mock API service** (`/api/incois`) that returns structured JSON data for these advisories, which the frontend will fetch and display cleanly.

### Feature 2: Crowdsourced Hazard Incident Reporting
*   Users must be authenticated via **Clerk** to submit a report.
*   Create a clean, multi-step or well-organized form using shadcn/ui components (Select, Input, Textarea, Button).
*   **Form Fields:** 
    *   Hazard Type (e.g., Oil Spill, Algal Bloom, Rogue Wave, Marine Life Stranding)
    *   Urgency/Severity Level (Low, Medium, High, Critical)
    *   Location (Auto-detect via browser Geolocation API or allow manual map pinning)
    *   Description (Text area)
*   Create a backend API route (`/api/reports`) to handle `POST` requests and save this data to the database.

### Feature 3: Interactive Map View (The Core Hub)
*   The main dashboard should feature a large, interactive map.
*   Fetch data from both the INCOIS mock API and the user reports database.
*   Display **geotagged hazard pins** on the map.
*   **Pin Styling:** Use distinct colored dots based on urgency (e.g., Red = Critical/High, Yellow = Medium, Blue = Low/Advisory). Implement subtle pulsing animations for critical alerts using Tailwind.
*   Clicking a pin should open a sleek popup/tooltip card with the hazard details, time reported, and source (INCOIS vs. Crowdsourced).

## 5. Step-by-Step Implementation Plan (Instructions for the AI)

1.  **Project Setup:** Initialize the Next.js app, configure Tailwind CSS, install shadcn/ui, and set up the layout file with the Inter font.
2.  **Authentication:** Integrate Clerk. Protect the `/report` route so only logged-in users can access it. Add login/user profile buttons to the sleek navbar.
3.  **Database & Schema:** Define the Prisma schema for `HazardReport` (id, title, description, latitude, longitude, severity, source, userId, createdAt).
4.  **UI Layout:** Build the main dashboard layout featuring the Map component taking up the majority of the screen, with a floating or slide-out panel for the INCOIS feed.
5.  **Map Integration:** Implement the map component. Ensure it loads smoothly and centers on a default coastal location. 
6.  **API Development:** Build the `GET` and `POST` routes for reports and the mock `GET` route for INCOIS data.
7.  **Data Fetching & State:** Wire up the frontend to fetch data from the APIs and populate the map markers.
8.  **Polish & Refine:** Apply Apple-like styling touches—blur effects on the navbar, smooth transitions, toast notifications (shadcn) for successful report submissions, and mobile responsiveness.

Please provide the code in logical steps, starting with project setup and the database schema, followed by the API routes, and concluding with the UI components and map integration.