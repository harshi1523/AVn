# Venus - Premium Electronics Rental & Sales

A high-performance, aesthetically driven web application for renting and purchasing premium workstations, laptops, and gaming gear. Built with React, Tailwind CSS, and integrated with Google Gemini API for AI-powered media generation.

## 🚀 Core Technologies
- **Frontend Framework:** React 19.2.1
- **Styling:** Tailwind CSS (Custom Stealth Theme, Monochrome)
- **Icons:** Google Material Symbols (Rounded)
- **Typography:** Space Grotesk (Display) & Inter (Sans)
- **AI Integration:** @google/genai (Gemini API)
- **State Management:** Custom React Context Provider (Store)

## ✨ Key Features
- **Dynamic Collection:** Seamlessly browse between Rentals, New Sales, and Certified Recertified products.
- **Hybrid Purchase Logic:** Support for products available for both monthly rental (with tiered tenure plans) and outright purchase.
- **Advanced Filtering:** Category-based navigation (Laptops, Desktops, Monitors, Gaming, etc.) and real-time search.
- **AI Studio Integration:** Built-in AI Video Generator powered by Google's **Veo** model (`veo-3.1-fast-generate-preview`) for creating product demos.
- **User Ecosystem:** 
    - **Cart & Secure Checkout:** Multi-step checkout process with local state management.
    - **Wishlist:** Persistent local storage for favorited items.
    - **Dashboard:** Manage active rentals, order history, and customer support tickets.
- **Interactive UI/UX:**
    - Responsive Menu & Cart Drawers.
    - Glassmorphic navigation bar with scroll-aware styling.
    - Quick View modals for instant product previews.
    - Detailed product pages with verified reviews and technical specifications.

## 🤖 AI Capabilities
The app utilizes the `@google/genai` SDK to interface with:
- **Model:** `veo-3.1-fast-generate-preview`
- **Functionality:** Text-to-video generation for marketing assets.
- **Security:** Implements mandatory API Key selection via `window.aistudio` for secure user-provided keys.

## 📁 Project Structure
- `/components`: Modular UI elements (Hero, Navbar, Listing, ProductDetails, etc.)
- `/lib`: Business logic, mock data, and global state (StoreContext)
- `index.html`: Entry point with Tailwind configuration and Material Symbols integration.
- `App.tsx`: Main routing and view management.

## 🛠 Setup & Requirements
- **API Key:** Requires a valid Google Gemini API Key provided via `process.env.API_KEY`.
- **Environment:** Designed for modern browsers with ES6 module support.

---
*Built as a world-class senior frontend engineer project focusing on performance, accessibility, and high-end design.*