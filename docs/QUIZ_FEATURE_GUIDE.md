# Quiz Feature - User Documentation

## Overview
The quiz feature allows users to take timed or untimed quizzes from purchased or available packages. It includes a modern, interactive interface with progress tracking, image support, and detailed results.

## Pages Created

### 1. Quiz Listing Page
**Path:** `/quiz` (`src/app/(user)/quiz/page.tsx`)

Displays all available quiz packages with:
- Package title and description
- Number of questions
- Time limit (if applicable)
- Price information
- Availability status
- Visual cards with icons
- "Start Quiz" button

**Features:**
- Filters active packages
- Checks availability dates
- Shows unavailable packages with explanation
- Responsive grid layout
- Loading states

### 2. Quiz Taking Page
**Path:** `/quiz/[id]` (`src/app/(user)/quiz/[id]/page.tsx`)

Interactive quiz interface with:
- **Header Section:**
  - Package title
  - Current question number
  - Countdown timer (if time limit set)
  - Progress bar
  - Answered count

- **Question Display:**
  - Question text
  - Question number badge
  - Image support (if imageUrl provided)
  - Multiple choice answers (A, B, C, D format)
  - Selected answer highlighting

- **Navigation:**
  - Previous/Next buttons
  - Question grid navigator (shows answered questions in green)
  - Submit button on last question

- **Features:**
  - Auto-save answer selection
  - Visual feedback for selected answers
  - Question grid with status indicators
  - Countdown timer with warning at <60 seconds
  - Auto-submit when time runs out
  - Confirmation dialog before submission
  - Responsive design

### 3. Results Page
**Path:** `/quiz/[id]/results` (`src/app/(user)/quiz/[id]/results/page.tsx`)

Comprehensive results display with:
- **Score Summary:**
  - Large percentage score
  - Motivational message based on performance
  - Correct/Incorrect/Time breakdown
  - Visual scoring with color coding

- **Performance Breakdown:**
  - Accuracy percentage bar
  - Total questions answered
  - Average time per question

- **Review Section (Toggle):**
  - All questions with answers
  - Correct answers marked
  - Question images displayed
  - Explanations shown (if available)

- **Actions:**
  - Review answers button
  - Retake quiz button
  - Back to quizzes button

**Features:**
- Color-coded score (green: ≥80%, yellow: 60-79%, red: <60%)
- Dynamic motivational messages
- Optional answer review
- Score breakdown statistics

## User Flow

```
Dashboard
    ↓
Quiz List (/quiz)
    ↓
Select Package
    ↓
Quiz Interface (/quiz/[id])
    ↓ (Answer questions)
    ↓
Submit Quiz
    ↓
Results Page (/quiz/[id]/results)
    ↓
[Retake] or [Back to List]
```

## Features

### Timer System
- Optional time limit from package settings
- Real-time countdown display
- Warning indicator when <60 seconds
- Auto-submit when timer reaches 0
- Time spent tracking

### Progress Tracking
- Visual progress bar
- Question counter
- Answered vs. total questions
- Question grid navigator
- Color-coded question status

### Answer Selection
- Radio button interface
- Visual highlighting of selected answer
- Letter labels (A, B, C, D)
- Click anywhere on option to select
- Immediate visual feedback

### Image Support
- Displays question images
- Responsive image sizing
- Border and rounded corners
- Centered alignment

### Navigation
- Previous/Next buttons
- Jump to any question via grid
- Disable Previous on first question
- Submit button on last question
- Confirmation before submit

### Results Analysis
- Percentage score
- Correct count
- Incorrect count
- Time spent
- Average time per question
- Performance color coding

### Review Mode
- Toggle answer review
- Show all questions
- Mark correct answers
- Display explanations
- Show question images

## Data Flow

### Quiz State Management
```typescript
interface QuizState {
  currentIndex: number;           // Current question index
  answers: QuizAnswer[];          // All user answers
  startTime: number;              // Quiz start timestamp
  timeRemaining: number | null;   // Seconds remaining (null if no limit)
}

interface QuizAnswer {
  questionId: string;
  selectedAnswerId: string | null;
}
```

### Results Passing
Results are passed via URL parameters:
- `score` - Percentage score (0-100)
- `correct` - Number of correct answers
- `total` - Total number of questions
- `time` - Time spent in seconds

## Styling & UX

### Color Scheme
- **Primary:** Blue for active elements
- **Success:** Green for correct answers/high scores
- **Warning:** Yellow/Orange for medium scores/timer warning
- **Danger:** Red for low scores/errors
- **Neutral:** Gray for inactive elements

### Visual Indicators
- ✅ Green circle with checkmark for correct
- 🔵 Blue highlight for selected answer
- 🟢 Green badge for answered question
- ⚪ Gray badge for unanswered question
- 🔵 Blue ring for current question

### Responsive Design
- Mobile-first approach
- Flexible grid layouts
- Touch-friendly buttons
- Readable text sizes
- Appropriate spacing

## Integration Points

### API Endpoints Used
```typescript
GET /api/packages              // List all packages
GET /api/packages/:id          // Get package with questions
```

### Type Definitions
```typescript
Package {
  id, title, description, price,
  timeLimit, packageQuestions[], ...
}

PackageQuestion {
  id, packageId, questionId, order,
  question: Question
}

Question {
  id, text, imageUrl?, explanation?,
  answers: Answer[]
}

Answer {
  id, text, isCorrect
}
```

## User Experience

### Starting a Quiz
1. User navigates to `/quiz`
2. Sees available quiz packages
3. Clicks "Start Quiz" on desired package
4. Redirected to quiz interface
5. Timer starts (if applicable)

### Taking the Quiz
1. User reads question and views image (if any)
2. Selects an answer by clicking
3. Visual feedback confirms selection
4. Navigates using Previous/Next or question grid
5. Can jump to any question anytime
6. Progress bar and counter show advancement

### Submitting the Quiz
1. User reaches last question
2. Clicks "Submit Quiz"
3. Confirmation dialog appears
4. Shows unanswered question warning (if any)
5. User confirms submission
6. Loading state during processing
7. Redirected to results page

### Viewing Results
1. Large score display with color coding
2. Motivational message based on performance
3. Breakdown of correct/incorrect/time
4. Performance metrics
5. Optional answer review
6. Options to retake or return to list

## Best Practices

### For Users
- Read all questions carefully
- Review images thoroughly
- Use the question grid to jump around
- Check answered count before submitting
- Use review mode to learn from mistakes

### For Admins Creating Quizzes
- Add clear, concise questions
- Include relevant images when helpful
- Provide explanations for learning
- Set appropriate time limits
- Test quizzes before publishing

## Future Enhancements

### Potential Features
- [ ] Save quiz progress (resume later)
- [ ] Quiz history/attempts tracking
- [ ] Leaderboards
- [ ] Practice mode (see correct answers immediately)
- [ ] Randomize question order
- [ ] Randomize answer order
- [ ] Multi-select questions (multiple correct answers)
- [ ] Detailed analytics (time per question, etc.)
- [ ] Export results as PDF
- [ ] Share results on social media
- [ ] Difficulty ratings
- [ ] Tags/categories for quizzes
- [ ] Search and filter quizzes
- [ ] Bookmark favorite quizzes
- [ ] Quiz recommendations
- [ ] Certificate generation for passing scores

### Technical Improvements
- [ ] Persist quiz state in localStorage (auto-save)
- [ ] Add keyboard shortcuts (numbers for answers, arrow keys for navigation)
- [ ] Implement answer submission to backend
- [ ] Store quiz results in database
- [ ] Add quiz attempt history
- [ ] Implement detailed analytics
- [ ] Add question shuffle option
- [ ] Support for different question types
- [ ] Accessibility improvements (ARIA labels, keyboard nav)
- [ ] Progressive Web App features (offline mode)

## Accessibility

Current accessibility features:
- Semantic HTML structure
- Clear focus indicators
- Keyboard navigable
- Screen reader friendly labels
- High contrast color schemes
- Readable font sizes

## Performance Considerations

- Questions loaded once at start
- Client-side state management (no re-fetching)
- Optimized images with max-height
- Minimal API calls
- Efficient re-renders
- Lazy loading for results

## Security

- User authentication required
- Package access validation
- No answer exposure during quiz
- Results calculated client-side (could be moved server-side)
- Time limit enforcement

---

**Created:** October 26, 2025  
**Status:** ✅ Complete and Ready for Testing
