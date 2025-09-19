# FitTracker - Mobile-First Fitness Tracker

A modern, Progressive Web App (PWA) fitness tracker built with React and Tailwind CSS. Track your daily steps, monitor calories burned, log activities, and view your fitness history - all from your mobile browser.

## 🚀 Features

### Core Features
- **Real-time Step Counter**: Uses device motion sensors for automatic step tracking
- **Daily Dashboard**: View today's steps, calories burned, and distance walked
- **7-Day History**: Track your progress with visual charts and daily summaries
- **Manual Activity Entry**: Add steps and exercises when motion sensors aren't available
- **Progress Tracking**: Set daily step goals and monitor your progress
- **Data Export**: Export your fitness history as CSV

### Technical Features
- **Mobile-First Design**: Optimized for mobile devices with responsive layout
- **Progressive Web App**: Install on your home screen, works offline
- **Local Storage**: All data stored locally on your device
- **Motion Sensor Integration**: Automatic step detection where supported
- **Modern UI**: Clean design with Tailwind CSS and shadcn/ui components

## 🛠️ Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fittracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

## 📱 Usage

### Dashboard
- View today's step count, calories burned, and distance
- Monitor progress towards your daily step goal
- Add manual entries when needed

### History
- Review the last 7 days of activity
- View average statistics
- Export data as CSV file

### Settings
- Set your daily step goal
- Configure profile information for better calorie calculations
- Manage app data

### PWA Installation
1. Open the app in your mobile browser
2. Look for "Add to Home Screen" prompt
3. Tap "Add" to install the app on your device

## 🧪 Testing

### Manual QA Checklist

#### Dashboard Functionality
- [ ] Step counter displays correctly
- [ ] Progress bar updates with step count
- [ ] Goal percentage calculates accurately
- [ ] Calories calculation works (steps × 0.04)
- [ ] Distance calculation works (steps × 0.762m)
- [ ] Manual entry button appears when motion sensors unavailable

#### Motion Sensor Integration
- [ ] Requests permission on supported devices
- [ ] Tracks steps automatically when walking
- [ ] Falls back to manual entry gracefully
- [ ] Step count persists between sessions

#### History View
- [ ] Shows last 7 days of data
- [ ] Displays accurate averages
- [ ] CSV export generates valid file
- [ ] Progress bars render correctly

#### Settings
- [ ] Step goal updates and persists
- [ ] Profile information saves correctly
- [ ] Clear data function works
- [ ] Toast notifications appear

#### PWA Features
- [ ] Manifest loads correctly
- [ ] App installs on home screen
- [ ] Works offline after first load
- [ ] Service worker caches resources

#### Responsive Design
- [ ] Works on various screen sizes
- [ ] Touch interactions work properly
- [ ] Navigation is accessible
- [ ] Text is readable at all sizes

### Unit Tests

Basic unit tests for core logic:

```bash
npm test
```

Tests cover:
- Calorie calculation formula
- Distance calculation
- Data storage and retrieval
- Step counter logic

## 🏗️ Architecture

### Component Structure
```
src/
├── components/
│   ├── Dashboard.tsx      # Main dashboard view
│   ├── History.tsx        # Activity history
│   ├── Settings.tsx       # App configuration
│   ├── ManualEntry.tsx    # Add activities modal
│   └── Navigation.tsx     # Bottom navigation
├── services/
│   ├── motionSensor.ts    # Device motion handling
│   └── storageService.ts  # Local data management
├── types/
│   └── fitness.ts         # TypeScript definitions
└── App.tsx               # Main app shell
```

### Data Model

```typescript
interface DailyActivity {
  date: string;
  steps: number;
  calories: number;
  distance: number;
  manualEntries: ManualEntry[];
}

interface UserProfile {
  stepGoal: number;
  weight?: number;
  height?: number;
  age?: number;
}

interface FitnessData {
  profile: UserProfile;
  activities: DailyActivity[];
  lastSync: number;
}
```

### Storage Schema
Data is stored in localStorage under the key `fitness-tracker-data`:
- User profile and preferences
- Daily activity records
- Manual activity entries
- Last sync timestamp

## 🎨 Design System

Built with a modern, health-focused design system:
- **Primary Colors**: Vibrant teal/green (#10b981)
- **Secondary Colors**: Warm orange for calories, blue for distance
- **Typography**: Clean, readable fonts with proper hierarchy
- **Components**: Based on shadcn/ui with custom variants
- **Animations**: Smooth transitions and micro-interactions

## 🔧 Configuration

### Motion Sensor Settings
- Threshold: 1.2 (adjustable for sensitivity)
- Fallback: Manual entry when sensors unavailable
- Permissions: Requests access on supported devices

### Calculation Formulas
- **Calories**: steps × 0.04
- **Distance**: steps × 0.762 meters (average step length)

## 📊 Browser Support

- **Motion Sensors**: iOS Safari 13+, Chrome Android 71+
- **PWA Features**: All modern browsers
- **Core Functionality**: Works in all browsers with localStorage

## 🚀 Deployment

The app can be deployed to any static hosting service:
- Netlify
- Vercel
- GitHub Pages
- Firebase Hosting

Build the project with `npm run build` and upload the `dist` folder.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues or questions:
1. Check the manual QA checklist
2. Review browser console for errors
3. Ensure device has motion sensor support for automatic tracking
4. Use manual entry as fallback

---

**Note**: This is an MVP focused on core fitness tracking functionality. Future versions may include additional features like workout plans, social sharing, or cloud sync.