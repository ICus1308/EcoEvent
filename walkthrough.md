# EcoEvent Hub - Implementation Walkthrough

Welcome to the **EcoEvent Hub** prototype! I have successfully established the foundational architecture and developed the core UI components for the platform. Here is a walkthrough of what was accomplished based on our implementation plan.

## 1. Project Foundation & Architecture
- initialized **Next.js 15** with the App Router and configured **Tailwind CSS**.
- Installed and set up **shadcn/ui** core components (`Card`, `Button`, `Calendar`, `Badge`, `Select`, `Input`, etc.).
- Designed and initialized the complete PostgreSQL database schema via **Prisma ORM**, including models for `User`, `Event`, `Product`, `BookingOrder`, `Task`, and more.

## 2. Core Domain Features (Eco-Shop & P2P Sharing)
We built the primary marketplace where users can browse sustainable items.
- **Marketplace Feed & Unified Filters** (`/shop`): An advanced grid layout displaying products for Rent, Buy, or Borrow. It features a **Synchronous Unified Filtering System** allowing real-time combinations of Text Search, Categories, Listing Types (Rent/Sale/Both), and Status Tags (On Sale/Free Borrow).
- **Dynamic Item Detail Page** (`/shop/[id]`): If an item supports BOTH Rent and Sale, the UI dynamically allows the user to switch between "Rent Item" (with Calendar + Deposit) and "Buy Outright" (Flat Price). Platform fees (3%) are calculated automatically.
- **My Listings Dashboard** (`/dashboard/my-listings`): A management portal for users and clubs to track their active listings, check revenue, and add new items.
- **Orders & Rentals Tracker** (`/dashboard/orders`): A dashboard tracking active rentals and purchases, clearly displaying the amount of money held securely in the escrow deposit until the item is returned.

## 3. Authentication & RBAC (Role-Based Access Control)
- **Global Header & Quick Auth Modal**: A seamless dialog component built into the global navigation bar (`components/Header.tsx`). Users can easily toggle between Sign In and Sign Up directly from the Homepage without context switching.
- **Registration Flow** (`/register`): Users must select a primary role upon signing up (`CUSTOMER`, `VERIFIED_STUDENT`, `VENDOR`). Contextual tooltips explain the benefits of each role (e.g. `.edu.vn` perks).
- **Login Flow** (`/login`): Integrated UI ready for Supabase Auth.

## 4. AI Event Planner & Dashboard
- **AI Planner Interface** (`/ai-planner`): An interactive tool designed to integrate with Gemini (`@google/genai`). Users can input event parameters (e.g., Wedding, 100 guests, 15M VND budget). The system simulates an AI response that returns a sustainable event timeline and a cost-comparison module (Traditional vs. Eco-Friendly).
- **Event Dashboard Workspace** (`/dashboard/events/[id]`): A comprehensive control center for managing an event.

## 5. Secure Checkout, Escrow & Communication
- **Checkout Flow** (`/checkout`): A simulated 3-step checkout process.
  - **Review:** Displays the auto-generated digital rental agreement and order summary.
  - **Payment (VietQR):** Simulates the VietQR/SePay payment gateway where the user scans a code to pay the rental + deposit.
  - **Success:** Redirects users to manage their order or message the host securely.
- **In-App Messaging** (`/messages`): A real-time chat interface for renters and lenders to coordinate pick-up times, ask questions about items, and resolve issues. Includes contextual banners showing which rental item the chat is about.
- **Homepage Landing** (`/`): A beautiful, modern landing page welcoming users to the platform and explaining the core value proposition of AI planning and P2P sharing.

> [!TIP]
> **Next Steps:** 
> The UI prototypes are complete. We can now begin connecting the backend APIs, setting up Supabase Auth, integrating the real Gemini API for the planner, and seeding the database with live test data!
