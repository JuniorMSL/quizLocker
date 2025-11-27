# 🔑 Late Access Code System

## Overview
The late access code system allows students to access exams that have already ended, provided the exam is configured with `PERMISSIVE` close mode and the teacher has generated late codes.

## Features

### For Teachers
1. **Generate Late Codes** - From the exam monitoring page
   - Click the "+" button in the "Late Access Codes" section
   - Each code can be used a limited number of times (default: 1)
   - Codes are unique and randomly generated

2. **Share Codes** - Copy codes and share with students who need late access
   - Click the copy icon next to any code
   - Monitor remaining usages

### For Students
1. **View Missed Exams** - Exams that have ended appear as "missed" in the dashboard
   - If the exam has `PERMISSIVE` mode, a "Enter Late Code" button appears
   - If the exam has `STRICT` mode, it shows as "Closed" (no late access)

2. **Enter Late Code** - Two ways to access:
   - **From Dashboard** (NEW): Click "Enter Late Code" button → Modal appears → Enter code → Start exam
   - **From Lobby**: Navigate to exam lobby → Enter code in the form → Start exam

## User Flow

### Student Dashboard Flow
```
1. Student sees missed exam with PERMISSIVE mode
2. Clicks "Enter Late Code" button
3. Modal opens with code input field
4. Student enters code from teacher
5. Code is validated
6. If valid: Student is redirected to exam
7. If invalid: Error message shown
```

### Teacher Flow
```
1. Teacher creates exam with PERMISSIVE close mode
2. Exam ends
3. Teacher generates late codes from monitoring page
4. Teacher shares code with student (email, chat, etc.)
5. Student uses code to access exam
6. Code usage count decrements
```

## Technical Implementation

### Components
- **`LateCodeModal.tsx`** - Modal component for entering late codes
- **`ExamCard.tsx`** - Exam card with integrated late code functionality
- **`ExamLobby.tsx`** - Lobby page with late code form (existing)

### API Endpoints
- **`POST /api/attempts/start`** - Validates late code and creates attempt
- **`POST /api/late-codes`** - Generates new late code (teacher only)

### Database
- **`LateCode` model** - Stores codes with:
  - `code`: Unique identifier
  - `examId`: Associated exam
  - `usagesRemaining`: Number of times code can be used
  - `expiresAt`: Optional expiration date

## Security
- Codes are randomly generated (16 bytes, hex encoded)
- Each code can only be used a limited number of times
- Codes are tied to specific exams
- Only students with valid codes can access closed exams
- Teachers can monitor code usage

## UX Improvements
- **Modal Interface**: Students don't need to navigate away from dashboard
- **Real-time Validation**: Immediate feedback on code validity
- **Visual Feedback**: Clear error messages and loading states
- **Accessibility**: Keyboard navigation, focus management, auto-uppercase input
