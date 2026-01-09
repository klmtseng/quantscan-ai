# QuantScan AI - Financial Research Scanner

QuantScan is a modern, responsive web application designed for quantitative finance researchers. It aggregates and filters research papers related to Momentum strategies, Cryptocurrency, Machine Learning, and High-Frequency Trading (HFT).

![QuantScan Interface](https://via.placeholder.com/800x400?text=QuantScan+Interface+Preview)

## Features

- **Topic Filtering**: Specialized categories for Momentum, Crypto, ML, HFT, Risk, and Fixed Income.
- **Smart Sorting**: Sort papers by Relevance or Publication Date (Newest/Oldest).
- **Date Filtering**: Preset filters (Week, Month, Quarter) and custom date ranges.
- **Dark Mode**: Fully responsive dark/light theme toggle.
- **Modern UI**: Built with Tailwind CSS and React for a clean, glassmorphic aesthetic.
- **Contact Integration**: specific modal for user feedback.

## Tech Stack

- **Frontend**: React 19 (ES Modules), Tailwind CSS
- **AI Integration**: Prepared for Google Gemini API (`@google/genai`)
- **Build System**: No-build setup using ES Modules and `esm.sh` CDN.

## Getting Started

Since this project uses modern ES Modules via CDN, you don't need `npm install`.

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/quantscan-ai.git
   cd quantscan-ai
   ```

2. **Serve the application**
   You need a simple static file server to run the app (to handle ES module imports correctly).

   If you have Python installed:
   ```bash
   python3 -m http.server 8000
   ```
   Or if you use Node.js:
   ```bash
   npx serve .
   ```

3. **Open in Browser**
   Navigate to `http://localhost:8000`

## Configuration

The application is set up to use the Google Gemini API. To enable live scanning:

1. Ensure you have a valid API Key from Google AI Studio.
2. The application expects the key to be injected via `process.env.API_KEY` or configured in `services/geminiService.ts`.

## License

MIT
