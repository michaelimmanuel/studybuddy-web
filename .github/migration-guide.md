# 🔄 Frontend Migration Guide: Quiz to Question-Based Architecture

## 📋 Overview

Your backend has been successfully migrated from a quiz-based system to a simplified question-based architecture. This guide will help you update your frontend to work with the new API endpoints while maintaining the same user experience.

## 🏗️ Architecture Changes

### Before (Quiz-based)
```
Course → Quiz → Questions → Answers
```

### After (Question-based)
```
Course → Questions → Answers
```

**Key Benefits:**
- ✅ Simplified data model
- ✅ Direct course-to-question relationships
- ✅ More flexible question management
- ✅ Easier admin workflows

---

## 🔧 Required Frontend Updates

### 1. **API Endpoint Changes**

Replace all quiz-related API calls with question-based endpoints:

#### **Before (Quiz endpoints):**
```javascript
// ❌ Old quiz endpoints
GET    /api/quizzes/course/:courseId
POST   /api/quizzes
GET    /api/quizzes/:id
PUT    /api/quizzes/:id
DELETE /api/quizzes/:id
POST   /api/quizzes/:id/submit
GET    /api/quizzes/:id/submissions
```

#### **After (Question endpoints):**
```javascript
// ✅ New question endpoints
GET    /api/courses/:id/questions         // Get course questions
POST   /api/courses/:id/questions         // Create question (Admin)
GET    /api/questions/:id                 // Get single question
PUT    /api/questions/:id                 // Update question (Admin)
DELETE /api/questions/:id                 // Delete question (Admin)
GET    /api/courses/:id/questions/stats   // Get course question statistics (Admin)
```

### 2. **Data Structure Updates**

#### **Quiz List → Question List**

**Before (Quiz response):**
```javascript
{
  "course": {
    "id": "course-uuid",
    "title": "Introduction to Programming"
  },
  "quizzes": [
    {
      "id": "quiz-uuid",
      "title": "Variables Quiz",
      "timeLimit": 30,
      "questionCount": 10,
      "submissionCount": 25
    }
  ]
}
```

**After (Question response):**
```javascript
{
  "course": {
    "id": "course-uuid", 
    "title": "Introduction to Programming"
  },
  "questions": [
    {
      "id": "question-uuid",
      "text": "What is a variable in programming?",
      "createdAt": "2025-09-30T10:00:00.000Z",
      "answers": [
        {
          "id": "answer-uuid-1",
          "text": "A container for storing data"
          // Note: isCorrect is only visible to admins
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

#### **Quiz Creation → Question Creation**

**Before (Create Quiz):**
```javascript
// ❌ Old quiz creation
const createQuiz = async (quizData) => {
  const response = await fetch('/api/quizzes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      courseId: courseId,
      title: "Variables Quiz",
      timeLimit: 30,
      questions: [
        {
          text: "What is a variable?",
          answers: [
            { text: "A container", isCorrect: true },
            { text: "A function", isCorrect: false }
          ]
        }
      ]
    })
  });
};
```

**After (Create Question):**
```javascript
// ✅ New question creation (one at a time)
const createQuestion = async (courseId, questionData) => {
  const response = await fetch(`/api/courses/${courseId}/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: "What is a variable?",
      answers: [
        { text: "A container for storing data", isCorrect: true },
        { text: "A type of function", isCorrect: false },
        { text: "A programming language", isCorrect: false }
      ]
    })
  });
};
```

---

## 🎯 Specific Component Updates

### 3. **Quiz List Component → Question Bank Component**

Update your quiz list component to show individual questions:

```javascript
// ✅ Updated QuestionBank Component
const QuestionBank = ({ courseId }) => {
  const [questions, setQuestions] = useState([]);
  const [pagination, setPagination] = useState({});
  
  useEffect(() => {
    const fetchQuestions = async () => {
      const response = await fetch(`/api/courses/${courseId}/questions?page=1&limit=10`);
      const data = await response.json();
      setQuestions(data.questions);
      setPagination(data.pagination);
    };
    
    fetchQuestions();
  }, [courseId]);

  return (
    <div className="question-bank">
      <h2>Question Bank</h2>
      {questions.map(question => (
        <div key={question.id} className="question-card">
          <h3>{question.text}</h3>
          <div className="answers">
            {question.answers.map(answer => (
              <div key={answer.id} className="answer">
                {answer.text}
                {/* isCorrect only visible to admins */}
              </div>
            ))}
          </div>
          <small>Created: {new Date(question.createdAt).toLocaleDateString()}</small>
        </div>
      ))}
      
      {/* Pagination component */}
      <Pagination 
        current={pagination.page}
        total={pagination.totalPages}
        onChange={handlePageChange}
      />
    </div>
  );
};
```

### 4. **Quiz Creation Form → Question Creation Form**

Transform your quiz creation form to create individual questions:

```javascript
// ✅ Updated QuestionCreation Component
const QuestionCreationForm = ({ courseId, onQuestionCreated }) => {
  const [questionText, setQuestionText] = useState('');
  const [answers, setAnswers] = useState([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false }
  ]);

  const addAnswer = () => {
    if (answers.length < 6) {
      setAnswers([...answers, { text: '', isCorrect: false }]);
    }
  };

  const removeAnswer = (index) => {
    if (answers.length > 2) {
      setAnswers(answers.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (questionText.length < 10 || questionText.length > 1000) {
      alert('Question text must be between 10-1000 characters');
      return;
    }
    
    const hasCorrectAnswer = answers.some(answer => answer.isCorrect);
    if (!hasCorrectAnswer) {
      alert('At least one answer must be marked as correct');
      return;
    }

    try {
      const response = await fetch(`/api/courses/${courseId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: questionText,
          answers: answers.filter(answer => answer.text.trim())
        })
      });

      if (response.ok) {
        const data = await response.json();
        onQuestionCreated(data.question);
        // Reset form
        setQuestionText('');
        setAnswers([
          { text: '', isCorrect: false },
          { text: '', isCorrect: false }
        ]);
      }
    } catch (error) {
      console.error('Error creating question:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="question-creation-form">
      <div className="form-group">
        <label>Question Text (10-1000 characters):</label>
        <textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Enter your question here..."
          minLength={10}
          maxLength={1000}
          required
        />
        <small>{questionText.length}/1000 characters</small>
      </div>

      <div className="answers-section">
        <label>Answers (2-6 answers required):</label>
        {answers.map((answer, index) => (
          <div key={index} className="answer-input">
            <input
              type="text"
              value={answer.text}
              onChange={(e) => {
                const newAnswers = [...answers];
                newAnswers[index].text = e.target.value;
                setAnswers(newAnswers);
              }}
              placeholder={`Answer ${index + 1}`}
              maxLength={500}
              required
            />
            <label>
              <input
                type="checkbox"
                checked={answer.isCorrect}
                onChange={(e) => {
                  const newAnswers = [...answers];
                  newAnswers[index].isCorrect = e.target.checked;
                  setAnswers(newAnswers);
                }}
              />
              Correct
            </label>
            {answers.length > 2 && (
              <button type="button" onClick={() => removeAnswer(index)}>
                Remove
              </button>
            )}
          </div>
        ))}
        
        {answers.length < 6 && (
          <button type="button" onClick={addAnswer}>
            Add Answer
          </button>
        )}
      </div>

      <button type="submit">Create Question</button>
    </form>
  );
};
```

### 5. **Quiz Taking Experience → Practice Questions**

Transform the quiz-taking experience into a practice question interface:

```javascript
// ✅ Updated Practice Component
const PracticeQuestions = ({ courseId }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      const response = await fetch(`/api/courses/${courseId}/questions`);
      const data = await response.json();
      setQuestions(data.questions);
    };
    
    fetchQuestions();
  }, [courseId]);

  const handleAnswerSelect = (questionId, answerId) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answerId
    });
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion) return <div>Loading...</div>;

  return (
    <div className="practice-questions">
      {!showResults ? (
        <div className="question-container">
          <div className="progress">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
          
          <h2>{currentQuestion.text}</h2>
          
          <div className="answers">
            {currentQuestion.answers.map(answer => (
              <label key={answer.id} className="answer-option">
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value={answer.id}
                  checked={selectedAnswers[currentQuestion.id] === answer.id}
                  onChange={() => handleAnswerSelect(currentQuestion.id, answer.id)}
                />
                {answer.text}
              </label>
            ))}
          </div>
          
          <button 
            onClick={nextQuestion}
            disabled={!selectedAnswers[currentQuestion.id]}
          >
            {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Practice'}
          </button>
        </div>
      ) : (
        <div className="results">
          <h2>Practice Complete!</h2>
          <p>You answered {Object.keys(selectedAnswers).length} questions.</p>
          <button onClick={() => window.location.reload()}>
            Practice Again
          </button>
        </div>
      )}
    </div>
  );
};
```

### 6. **Admin Statistics Dashboard**

Update your admin dashboard to show question statistics:

```javascript
// ✅ Updated Admin Dashboard
const AdminQuestionStats = ({ courseId }) => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      const response = await fetch(`/api/courses/${courseId}/questions/stats`);
      const data = await response.json();
      setStats(data.stats);
    };
    
    fetchStats();
  }, [courseId]);

  if (!stats) return <div>Loading stats...</div>;

  return (
    <div className="admin-stats">
      <h3>Question Bank Statistics</h3>
      <div className="stats-grid">
        <div className="stat-card">
          <h4>Total Questions</h4>
          <p>{stats.totalQuestions}</p>
        </div>
        <div className="stat-card">
          <h4>Questions with Multiple Correct Answers</h4>
          <p>{stats.questionsWithMultipleCorrectAnswers}</p>
        </div>
        <div className="stat-card">
          <h4>Average Answers per Question</h4>
          <p>{stats.averageAnswersPerQuestion}</p>
        </div>
        <div className="stat-card">
          <h4>Questions Created This Week</h4>
          <p>{stats.questionsCreatedThisWeek}</p>
        </div>
        <div className="stat-card">
          <h4>Questions Created This Month</h4>
          <p>{stats.questionsCreatedThisMonth}</p>
        </div>
      </div>
    </div>
  );
};
```

---

## 🔐 Permission Handling

### 7. **Role-Based UI Updates**

Update your UI to handle different user roles:

```javascript
// ✅ Role-based component rendering
const QuestionManagement = ({ courseId, userRole, isEnrolled }) => {
  return (
    <div className="question-management">
      {/* All authenticated users can view questions */}
      {isEnrolled && <QuestionBank courseId={courseId} userRole={userRole} />}
      
      {/* Only admins can create/edit questions */}
      {userRole === 'admin' && (
        <>
          <QuestionCreationForm courseId={courseId} />
          <AdminQuestionStats courseId={courseId} />
        </>
      )}
      
      {/* Students get practice mode */}
      {isEnrolled && userRole !== 'admin' && (
        <PracticeQuestions courseId={courseId} />
      )}
    </div>
  );
};
```

---

## 🎨 UI/UX Recommendations

### 8. **Navigation Updates**

Update your navigation to reflect the new structure:

```javascript
// ✅ Updated navigation
const CourseNavigation = ({ courseId, userRole }) => {
  return (
    <nav className="course-nav">
      <Link to={`/courses/${courseId}`}>Course Overview</Link>
      <Link to={`/courses/${courseId}/questions`}>Question Bank</Link>
      {userRole === 'admin' && (
        <>
          <Link to={`/courses/${courseId}/questions/create`}>Create Questions</Link>
          <Link to={`/courses/${courseId}/questions/stats`}>Statistics</Link>
        </>
      )}
      <Link to={`/courses/${courseId}/practice`}>Practice Questions</Link>
    </nav>
  );
};
```

### 9. **Loading States & Error Handling**

Add proper loading and error states:

```javascript
// ✅ Enhanced error handling
const useQuestions = (courseId) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/courses/${courseId}/questions`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setQuestions(data.questions);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [courseId]);

  return { questions, loading, error, refetch: () => fetchQuestions() };
};
```

---

## ✅ Migration Checklist

- [ ] **Update API endpoints** from quiz to question-based
- [ ] **Update data structures** to handle individual questions
- [ ] **Transform quiz list** into question bank component
- [ ] **Update creation forms** to create one question at a time
- [ ] **Modify practice interface** to work with questions directly
- [ ] **Update admin dashboard** to show question statistics
- [ ] **Implement role-based permissions** for UI components
- [ ] **Update navigation** to reflect new structure
- [ ] **Add loading states** and error handling
- [ ] **Test all CRUD operations** for questions
- [ ] **Test pagination** and search functionality
- [ ] **Verify admin-only features** work correctly

---

## 🚀 Benefits of Migration

### For Students:
- ✅ **Better Practice Experience**: Direct access to course questions
- ✅ **Flexible Learning**: Can practice individual questions or sets
- ✅ **Simpler Interface**: No confusing quiz structures

### For Admins:
- ✅ **Easier Question Management**: Create/edit questions individually
- ✅ **Better Organization**: Questions directly linked to courses
- ✅ **Flexible Usage**: Questions can be used for various purposes
- ✅ **Improved Statistics**: Better insights into question banks

### For Developers:
- ✅ **Simplified Data Model**: Fewer relationships to manage
- ✅ **Better Performance**: Direct queries without joins
- ✅ **Easier Maintenance**: Cleaner code structure
- ✅ **Future-Proof**: Easy to extend for various use cases

---

## 🔧 Testing Strategy

1. **Unit Tests**: Test individual question CRUD operations
2. **Integration Tests**: Test course-question relationships
3. **E2E Tests**: Test complete user workflows
4. **Permission Tests**: Verify role-based access controls
5. **Performance Tests**: Test pagination and search

---

*This migration maintains the same user experience while providing a more flexible and maintainable backend architecture.*