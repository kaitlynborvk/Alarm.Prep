# Alarm Prep

A Progressive Web App (PWA) for GMAT and LSAT exam preparation through quiz alarms. Users must answer questions correctly to turn off their alarms, making studying a daily habit.

## Features

- **Quiz Alarms**: Set alarms that require answering exam questions to turn off
- **Exam Types**: Support for GMAT and LSAT question types
- **Question Categories**: 
  - GMAT: Quantitative, Verbal, Data Insights
  - LSAT: Reading Comprehension, Logical Reasoning
- **Statistics**: Track your performance across different question types
- **Settings**: Configure exam preferences and alarm settings
- **PWA Ready**: Installable on mobile devices

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **PWA**: next-pwa
- **Mobile**: Capacitor (for future App Store deployment)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd AlarmPrep-main
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── page.tsx        # Home page with alarm management
│   ├── settings/       # Settings page
│   ├── stats/          # Statistics page
│   └── layout.tsx      # Root layout
├── components/         # Reusable components
│   └── BottomNav.tsx   # Bottom navigation
└── globals.css         # Global styles
```

## Usage

1. **First Time Setup**: Choose your exam type (GMAT or LSAT)
2. **Create Alarms**: Tap the "+" button to set new quiz alarms
3. **Configure Questions**: Select question types, categories, and difficulty
4. **Track Progress**: View statistics in the Stats tab
5. **Customize Settings**: Adjust preferences in the Settings tab

## Development

The app is built as a PWA and can be installed on mobile devices. For iOS deployment, the project includes Capacitor configuration for future App Store submission.

## License

MIT License
