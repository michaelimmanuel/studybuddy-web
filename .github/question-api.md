# ❓ Questions API

Question bank management with rich answer explanations for enhanced learning.

## Base URL
```
http://localhost:8000/api
```

## Course Question Routes

### Get Course Questions
```http
GET /api/courses/:id/questions
```
**Access:** Authenticated (enrolled users or admins)

**Parameters:**
- `id` (UUID) - Course ID

**Query Parameters:**
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 10, max: 100)
- `search` (string, optional) - Search term for question text

**Response (200):**
```json
{
  "course": {
    "id": "course-uuid",
    "title": "Introduction to Programming"
  },
  "questions": [
    {
      "id": "question-uuid",
      "text": "What is a variable in programming?",
      "createdAt": "2025-10-01T10:00:00.000Z",
      "updatedAt": "2025-10-01T10:00:00.000Z",
      "course": {
        "id": "course-uuid",
        "title": "Introduction to Programming"
      },
      "answers": [
        {
          "id": "answer-uuid-1",
          "text": "A container for storing data values"
          // Note: isCorrect and explanation only visible to admins
        },
        {
          "id": "answer-uuid-2", 
          "text": "A type of function"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

**Admin Response (includes isCorrect and explanation):**
```json
{
  "questions": [
    {
      "id": "question-uuid",
      "text": "What is a variable in programming?",
      "answers": [
        {
          "id": "answer-uuid-1",
          "text": "A container for storing data values",
          "isCorrect": true,
          "explanation": "Correct! A variable is indeed a container that holds data values. It's a fundamental concept in programming where you can store and manipulate data."
        },
        {
          "id": "answer-uuid-2",
          "text": "A type of function", 
          "isCorrect": false,
          "explanation": "Incorrect. A function is a block of code that performs a task, while a variable stores data. These are different concepts in programming."
        }
      ]
    }
  ]
}
```

---

### Create Question
```http
POST /api/courses/:id/questions
```
**Access:** Admin only

**Parameters:**
- `id` (UUID) - Course ID

**Request Body:**
```json
{
  "text": "What is a variable in programming?",
  "answers": [
    {
      "text": "A container for storing data values",
      "isCorrect": true,
      "explanation": "Correct! A variable is indeed a container that holds data values. It's a fundamental concept in programming where you can store and manipulate data."
    },
    {
      "text": "A type of function",
      "isCorrect": false,
      "explanation": "Incorrect. A function is a block of code that performs a task, while a variable stores data. These are different concepts."
    },
    {
      "text": "A programming language",
      "isCorrect": false,
      "explanation": "Incorrect. A programming language is a tool used to write code, whereas a variable is a concept within programming for storing data."
    }
  ]
}
```

**Validation Rules:**
- **Question text:** 10-1000 characters (required)
- **Answers:** 2-6 answers required
- **At least 1 correct answer** required
- **Answer text:** 1-500 characters each (required)
- **Explanation:** 0-1000 characters (optional)

**Response (201):**
```json
{
  "message": "Question created successfully",
  "question": {
    "id": "question-uuid",
    "text": "What is a variable in programming?",
    "courseId": "course-uuid",
    "createdAt": "2025-10-01T10:00:00.000Z",
    "updatedAt": "2025-10-01T10:00:00.000Z",
    "answers": [
      {
        "id": "answer-uuid-1",
        "text": "A container for storing data values",
        "isCorrect": true,
        "explanation": "Correct! A variable is indeed a container..."
      },
      {
        "id": "answer-uuid-2",
        "text": "A type of function",
        "isCorrect": false,
        "explanation": "Incorrect. A function is a block of code..."
      }
    ]
  }
}
```

---

### Get Course Question Statistics
```http
GET /api/courses/:id/questions/stats
```
**Access:** Admin only

**Parameters:**
- `id` (UUID) - Course ID

**Response (200):**
```json
{
  "course": {
    "id": "course-uuid",
    "title": "Introduction to Programming"
  },
  "stats": {
    "totalQuestions": 25,
    "questionsWithMultipleCorrectAnswers": 3,
    "averageAnswersPerQuestion": 3.8,
    "questionsCreatedThisWeek": 5,
    "questionsCreatedThisMonth": 15
  }
}
```

## Individual Question Routes

### Get Question by ID
```http
GET /api/questions/:id
```
**Access:** Authenticated users

**Parameters:**
- `id` (UUID) - Question ID

**Response (200):**
```json
{
  "question": {
    "id": "question-uuid",
    "text": "What is a variable in programming?",
    "courseId": "course-uuid",
    "createdAt": "2025-10-01T10:00:00.000Z",
    "updatedAt": "2025-10-01T10:00:00.000Z",
    "course": {
      "id": "course-uuid",
      "title": "Introduction to Programming"
    },
    "answers": [
      {
        "id": "answer-uuid-1",
        "text": "A container for storing data values"
        // isCorrect and explanation only for admins
      }
    ]
  }
}
```

---

### Update Question
```http
PUT /api/questions/:id
```
**Access:** Admin only

**Parameters:**
- `id` (UUID) - Question ID

**Request Body:**
```json
{
  "text": "What is a variable in programming? (Updated)",
  "answers": [
    {
      "text": "A container for storing data values",
      "isCorrect": true,
      "explanation": "Updated explanation: A variable is a named storage location..."
    },
    {
      "text": "A type of function",
      "isCorrect": false,
      "explanation": "Functions and variables serve different purposes in programming."
    }
  ]
}
```

**Response (200):**
```json
{
  "message": "Question updated successfully",
  "question": {
    "id": "question-uuid",
    "text": "What is a variable in programming? (Updated)",
    "courseId": "course-uuid",
    "updatedAt": "2025-10-01T12:00:00.000Z",
    "answers": [
      {
        "id": "answer-uuid-1",
        "text": "A container for storing data values",
        "isCorrect": true,
        "explanation": "Updated explanation: A variable is a named storage location..."
      }
    ]
  }
}
```

---

### Delete Question
```http
DELETE /api/questions/:id
```
**Access:** Admin only

**Parameters:**
- `id` (UUID) - Question ID

**Response (200):**
```json
{
  "message": "Question deleted successfully"
}
```

## Answer Explanation Feature

### 🆕 Enhanced Learning with Explanations

The question system now supports detailed explanations for each answer:

**For Admins:**
- ✅ Can add explanations when creating/editing questions
- ✅ Can see all explanations and correct answers
- ✅ Can use explanations to improve question quality

**For Students:**
- ❌ Explanations are hidden during normal viewing
- ✅ Can be shown explanations in practice/quiz mode (frontend choice)
- ✅ Enhanced learning when explanations are revealed

### Example Usage Patterns

1. **Study Mode**: Show explanations immediately after student answers
2. **Quiz Mode**: Hide explanations until quiz completion
3. **Review Mode**: Show all explanations for learning reinforcement
4. **Admin Preview**: Always show explanations for content review

## Permission Matrix

| Action | Student | Enrolled Student | Admin |
|--------|---------|------------------|-------|
| View questions | ❌ | ✅ | ✅ |
| See correct answers | ❌ | ❌ | ✅ |
| See explanations | ❌ | ❌ | ✅ |
| Create questions | ❌ | ❌ | ✅ |
| Edit questions | ❌ | ❌ | ✅ |
| Delete questions | ❌ | ❌ | ✅ |
| View statistics | ❌ | ❌ | ✅ |

## Error Responses

### Course Not Found (404)
```json
{
  "message": "Course not found"
}
```

### Question Not Found (404)
```json
{
  "message": "Question not found"
}
```

### Access Denied (403)
```json
{
  "message": "Access denied. You must be enrolled in this course."
}
```

### Admin Required (403)
```json
{
  "message": "Access denied. Admin privileges required."
}
```

### Validation Error (400)
```json
{
  "message": "Validation error",
  "details": [
    {
      "field": "text",
      "message": "Question text must be between 10-1000 characters"
    },
    {
      "field": "answers",
      "message": "At least one answer must be marked as correct"
    }
  ]
}
```

## Testing Examples

### Get Course Questions (Student)
```bash
curl -X GET "http://localhost:8000/api/courses/COURSE_ID/questions?page=1&limit=5" \
  -H "Cookie: better-auth.session_token=STUDENT_SESSION_TOKEN"
```

### Create Question with Explanations (Admin)
```bash
curl -X POST http://localhost:8000/api/courses/COURSE_ID/questions \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=ADMIN_SESSION_TOKEN" \
  -d '{
    "text": "What is a variable in programming?",
    "answers": [
      {
        "text": "A container for storing data values",
        "isCorrect": true,
        "explanation": "Correct! Variables are fundamental in programming - they act as named containers that can hold different types of data values."
      },
      {
        "text": "A type of function",
        "isCorrect": false,
        "explanation": "Incorrect. Functions are blocks of reusable code, while variables store data. They serve different purposes in programming."
      }
    ]
  }'
```

### Update Question (Admin)
```bash
curl -X PUT http://localhost:8000/api/questions/QUESTION_ID \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=ADMIN_SESSION_TOKEN" \
  -d '{
    "text": "Updated question text",
    "answers": [
      {
        "text": "Updated answer",
        "isCorrect": true,
        "explanation": "Updated explanation"
      }
    ]
  }'
```

### Get Question Statistics (Admin)
```bash
curl -X GET "http://localhost:8000/api/courses/COURSE_ID/questions/stats" \
  -H "Cookie: better-auth.session_token=ADMIN_SESSION_TOKEN"
```