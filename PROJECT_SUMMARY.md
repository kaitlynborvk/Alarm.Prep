# AlarmPrep - Smart Alarm Quiz App

## 📖 Project Overview

**AlarmPrep** is a Next.js/Capacitor mobile app that combines alarm functionality with educational quiz features. Users must correctly answer GMAT or LSAT questions to turn off their alarm, making wake-up time productive study time.

### 🎯 Core Purpose
- **Smart Alarm System**: Schedule alarms that trigger educational quizzes
- **Forced Learning**: Users must answer questions correctly to dismiss the alarm
- **Test Prep Focus**: Supports GMAT and LSAT question categories
- **Cross-Platform**: Web interface + iOS mobile app via Capacitor

---

## 🏗️ Architecture & Tech Stack

### **Frontend**
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety throughout
- **Tailwind CSS** - Utility-first styling
- **Capacitor** - Cross-platform mobile deployment

### **Backend**
- **Next.js API Routes** - Server-side endpoints
- **Prisma ORM** - Database management
- **Railway PostgreSQL** - Cloud database hosting

### **Mobile**
- **Capacitor iOS** - Native iOS deployment
- **Local Notifications** - iOS notification system
- **Haptic Feedback** - Enhanced user experience

---

## 📁 Project Structure

```
AlarmPrep-main/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main app (alarm interface)
│   │   ├── admin/page.tsx        # Question management (web-only)
│   │   ├── settings/page.tsx     # User settings
│   │   ├── stats/page.tsx        # User statistics
│   │   └── api/questions/route.ts # Question CRUD API
│   ├── components/
│   │   ├── AlarmScreen.tsx       # Quiz modal interface
│   │   └── BottomNav.tsx         # Navigation component
│   └── services/
│       ├── alarmService.ts       # Core alarm logic
│       ├── iosService.ts         # iOS-specific features
│       └── dataService.ts        # Database operations
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Initial data seeding
├── ios/                          # iOS Capacitor project
└── public/                       # Static assets
```

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Git

### **Setup Instructions**

1. **Clone Repository**
   ```bash
   git clone https://github.com/kaitlynborvk/Alarm.Prep.git
   cd Alarm.Prep
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create `.env.local` file:
   ```env
   # Railway PostgreSQL Database
   DATABASE_URL="postgresql://username:password@host:port/database"
   ```
   
4. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```
   Access at: http://localhost:3000

---

## 🎮 Core Features

### **🔔 Alarm System**
- **Schedule Alarms**: Set custom wake-up times
- **Quiz Triggers**: Alarms launch educational quizzes
- **Snooze Prevention**: Must answer correctly to dismiss
- **Background Processing**: Continues running when app is closed

### **📚 Question Management**
- **Admin Interface**: Web-only question creation/editing
- **LaTeX Support**: Mathematical expressions with live preview
- **Question Types**: GMAT (Quantitative, Verbal, Data) & LSAT (Reading, Logical)
- **Difficulty Levels**: Easy, Intermediate, Hard
- **Categories**: Detailed subcategories for targeted practice

### **📱 Mobile Features**
- **iOS Notifications**: Native alarm notifications
- **Haptic Feedback**: Physical vibration responses
- **Offline Support**: Works without internet connection
- **Background Execution**: Continues running in background

---

## 🛠️ Development Guidelines

### **Code Organization**
- **Services**: Business logic in `/src/services/`
- **Components**: Reusable UI in `/src/components/`
- **API Routes**: Backend endpoints in `/src/app/api/`
- **Types**: TypeScript definitions throughout

### **Key Services**

#### **AlarmService** (`alarmService.ts`)
```typescript
// Core alarm functionality
- scheduleAlarm(time: Date, questionType: string)
- triggerAlarm(question: Question)
- handleAnswer(answer: string, correctAnswer: string)
- snoozeAlarm(minutes: number)
```

#### **IOSService** (`iosService.ts`)
```typescript
// iOS-specific features
- requestNotificationPermissions()
- scheduleNotification(date: Date, title: string)
- triggerHapticFeedback(type: 'light' | 'medium' | 'heavy')
```

### **Database Schema** (Prisma)
```prisma
model Question {
  id            Int      @id @default(autoincrement())
  exam          String   // "GMAT" | "LSAT"
  type          String   // Question category
  subcategory   String   // Specific topic
  text          String   // Question content (supports LaTeX)
  correctAnswer String   // First choice (correct)
  choices       String[] // All answer choices
  difficulty    String   // "easy" | "intermediate" | "hard"
  explanation   String?  // Optional explanation
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

---

## 📝 LaTeX Integration

### **Mathematical Notation Support**
- **Inline Math**: `$x^2$` → x²
- **Display Math**: `$$\frac{a}{b}$$` → (a)/(b)
- **Common Symbols**: `\pi` → π, `\sqrt{x}` → √(x)
- **Live Preview**: Real-time rendering in admin interface

### **LaTeX Helper Buttons**
- Quick insertion of common mathematical symbols
- Available in all text input fields
- Automatic cursor positioning for complex expressions

---

## 🌐 Deployment

### **Web Deployment**
- **Platform**: Railway/Vercel
- **Database**: Railway PostgreSQL
- **Environment**: Production environment variables required

### **iOS Deployment**
```bash
# Build for iOS
npm run build
npx cap sync ios
npx cap open ios
# Build in Xcode
```

---

## 🔧 Configuration

### **Exam Types & Categories**
```typescript
const EXAMS = ["GMAT", "LSAT"] as const;
const QUESTION_TYPES = {
  GMAT: [
    { id: "quantitative", name: "Quantitative Reasoning" },
    { id: "verbal", name: "Verbal Reasoning" },
    { id: "data", name: "Data Insights" },
  ],
  LSAT: [
    { id: "reading", name: "Reading Comprehension" },
    { id: "logical", name: "Logical Reasoning" },
  ],
};
```

### **App Settings**
- **Default Alarm**: 7:00 AM
- **Snooze Duration**: 5 minutes
- **Question Pool**: Random selection from selected categories
- **Offline Fallback**: Built-in questions when database unavailable

---

## 🎯 Current Status

### **✅ Completed Features**
- ✅ Core alarm scheduling and triggering
- ✅ Quiz modal with LaTeX rendering
- ✅ Admin question management interface
- ✅ iOS notification integration
- ✅ Database integration (Railway PostgreSQL)
- ✅ Question categorization system
- ✅ Live LaTeX preview in admin
- ✅ Mobile-responsive design
- ✅ Background alarm processing

### **🚧 Recent Updates**
- **LaTeX Preview System**: Improved mathematical notation display
- **Enhanced Admin UI**: Live previews for all input fields
- **Question Management**: Streamlined creation/editing workflow
- **Mobile Optimization**: Better iOS integration

---

## 📚 Key Files to Understand

### **For Backend Development**
- `src/app/api/questions/route.ts` - Question CRUD operations
- `src/services/dataService.ts` - Database queries
- `prisma/schema.prisma` - Data models

### **For Frontend Development**
- `src/app/page.tsx` - Main alarm interface
- `src/components/AlarmScreen.tsx` - Quiz modal
- `src/app/admin/page.tsx` - Question management

### **For Mobile Development**
- `src/services/iosService.ts` - iOS integrations
- `ios/` - Capacitor iOS project
- `capacitor.config.ts` - Mobile configuration

---

## 🤝 Collaboration Workflow

### **Git Workflow**
```bash
# Before starting work
git pull origin main

# After making changes
git add .
git commit -m "Description of changes"
git push origin main
```

### **Development Environment**
- Always pull latest changes before coding
- Test on both web and mobile when possible
- Use TypeScript for all new code
- Follow existing code patterns and conventions

### **Testing**
- **Web**: Test admin interface at `/admin`
- **Mobile**: Test alarm functionality on iOS device/simulator
- **Database**: Verify questions save/load correctly

---

## 📞 Need Help?

### **Common Issues**
- **Database Connection**: Check `.env.local` DATABASE_URL
- **iOS Build**: Ensure Xcode and iOS SDK are updated
- **LaTeX Rendering**: Check browser console for KaTeX errors

### **Resources**
- **Next.js Docs**: https://nextjs.org/docs
- **Capacitor Docs**: https://capacitorjs.com/docs
- **Prisma Docs**: https://www.prisma.io/docs

---

**Last Updated**: July 10, 2025
**Current Version**: v1.0 with LaTeX preview improvements
