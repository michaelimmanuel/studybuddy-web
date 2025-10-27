# Course to Question Bank Renaming Guide (Frontend Only)

## Overview
This document tracks the renaming of "Course" to "Question Bank" across the frontend codebase.

## Status: IN PROGRESS

---

## Completed Changes

### 1. Types (`src/types/index.ts`)
✅ **Completed:**
- Renamed `Course` interface to `QuestionBank`
- Renamed `GetAllCoursesResponse` to `GetAllQuestionBanksResponse`
- Renamed `CourseFormData` to `QuestionBankFormData`
- Renamed `CreateCourseRequest` to `CreateQuestionBankRequest`
- Renamed `UpdateCourseRequest` to `UpdateQuestionBankRequest`
- Renamed `CreateCourseResponse` to `CreateQuestionBankResponse`
- Renamed `UpdateCourseResponse` to `UpdateQuestionBankResponse`
- Updated field names: `courses` → `questionBanks`, `totalCourses` → `totalQuestionBanks`

⚠️ **Still Needs Manual Updates:**
- `GetCourseByIdResponse` → `GetQuestionBankByIdResponse` (2 occurrences on lines 10 and 56)
- `course: Course` → `questionBank: QuestionBank` (update both response interfaces)
- `CourseStats` → `QuestionBankStats`
- `PopularCourse` → `PopularQuestionBank`
- `CourseStatsResponse` → `QuestionBankStatsResponse`
- All `course` field references in Question interface

### 2. Admin Navigation (`src/app/admin/layout.tsx`)
✅ **Completed:**
- Updated navigation label from "Courses" to "Question Banks"

---

## Files That Need Updates

### Priority 1: Core Components

#### `src/components/admin/CourseManagement.tsx`
- [ ] Rename file to `QuestionBankManagement.tsx`
- [ ] Update all `Course` type references to `QuestionBank`
- [ ] Update API calls from `/api/courses` to `/api/courses` (keep same for now since backend unchanged)
- [ ] Update all variable names: `course` → `questionBank`, `courses` → `questionBanks`
- [ ] Update UI text: "Course" → "Question Bank", "Courses" → "Question Banks"

#### `src/app/admin/courses/page.tsx`
- [ ] Consider renaming directory from `courses` to `question-banks`
- [ ] Update imports to use `QuestionBank` types
- [ ] Update component references to `QuestionBankManagement`

#### `src/app/admin/courses/[id]/page.tsx`
- [ ] Update file location if directory is renamed
- [ ] Update all `Course` type references to `QuestionBank`
- [ ] Update variable names: `course` → `questionBank`, `courseId` → `questionBankId`
- [ ] Update imports for modal components
- [ ] Update UI text

#### `src/components/admin/modals/EditCourseModal.tsx`
- [ ] Rename to `EditQuestionBankModal.tsx`
- [ ] Update all type references and variable names
- [ ] Update form labels and UI text

#### `src/components/admin/modals/DeleteCourseModal.tsx`
- [ ] Rename to `DeleteQuestionBankModal.tsx`
- [ ] Update all type references and variable names
- [ ] Update confirmation messages

#### `src/components/admin/modals/CreateCourseModal.tsx`
- [ ] Rename to `CreateQuestionBankModal.tsx`
- [ ] Update all type references and variable names
- [ ] Update form labels and UI text

### Priority 2: Question Management

#### `src/components/PracticeQuestions.tsx`
- [ ] Update `courseId` prop to `questionBankId`
- [ ] Update API calls from `/api/courses/${courseId}/questions` to `/api/courses/${questionBankId}/questions`
- [ ] Update type imports: `GetCourseQuestionsResponse` → `GetQuestionBankQuestionsResponse`

#### `src/components/admin/QuestionBank.tsx`
- [ ] Already named correctly! Just verify it uses updated types

#### `src/components/admin/modals/*QuestionModal.tsx`
- [ ] Update any `courseId` references to `questionBankId`
- [ ] Update UI text from "Course" to "Question Bank"

### Priority 3: Dashboard & Stats

#### `src/components/admin/DashboardOverview.tsx`
- [ ] Update `CourseStats` to `QuestionBankStats`
- [ ] Update `PopularCourse` to `PopularQuestionBank`
- [ ] Update all UI text: "Course" → "Question Bank"
- [ ] Update dashboard cards and labels

#### `src/app/admin/dashboard/page.tsx`
- [ ] Update import from `CourseManagement` to `QuestionBankManagement`

---

## Search & Replace Patterns

### Type References
```
Course → QuestionBank
GetCourseByIdResponse → GetQuestionBankByIdResponse
GetAllCoursesResponse → GetAllQuestionBanksResponse
CourseFormData → QuestionBankFormData
CreateCourseRequest → CreateQuestionBankRequest
UpdateCourseRequest → UpdateQuestionBankRequest
CreateCourseResponse → CreateQuestionBankResponse
UpdateCourseResponse → UpdateQuestionBankResponse
CourseStats → QuestionBankStats
PopularCourse → PopularQuestionBank
CourseStatsResponse → QuestionBankStatsResponse
GetCourseQuestionsResponse → GetQuestionBankQuestionsResponse
```

### Variable Names
```
course → questionBank
courses → questionBanks
courseId → questionBankId
courseData → questionBankData
selectedCourse → selectedQuestionBank
```

### UI Text
```
"Course" → "Question Bank"
"Courses" → "Question Banks"
"course" → "question bank"
"courses" → "question banks"
"Add Course" → "Add Question Bank"
"Edit Course" → "Edit Question Bank"
"Delete Course" → "Delete Question Bank"
"Create Course" → "Create Question Bank"
"Course Title" → "Question Bank Title"
"Course Description" → "Question Bank Description"
```

---

## Important Notes

1. **Backend API Routes:** Keep API routes unchanged (`/api/courses`) since we're only updating frontend terminology
2. **Database:** No database changes needed - this is UI-only
3. **Field Names:** When updating field names in types, ensure the API response mapping still works correctly
4. **Testing:** After each component update, test:
   - List view
   - Create functionality
   - Edit functionality
   - Delete functionality
   - Question management within the bank

---

## Next Steps

1. Complete manual updates to `src/types/index.ts` for remaining Course references
2. Update all component files in priority order
3. Test each updated component
4. Update any documentation or README files

---

## Questions/Decisions

- [ ] Should we rename the `/admin/courses` route to `/admin/question-banks`?
- [ ] Should we keep the file structure as `courses/[id]` or rename to `question-banks/[id]`?
- [ ] Are there any other "Course" references in documentation that need updating?
