# Entity-Relationship (ER) Diagram & Schema Specifications
## Project Name: CDAC ExamWeb

This document outlines the conceptual data models, entity relationships, and cardinalities used across the **CDAC ExamWeb** application.

---

## 1. Visual ER Diagram (Mermaid)

```mermaid
erDiagram
    USER ||--o{ EXAM : "creates (Admin/Teacher)"
    USER ||--o{ PRACTICE_TEST : "creates (Admin/Teacher)"
    USER ||--o{ RESULT : "attempts (Student)"
    USER ||--o{ EXAM_PROGRESS : "tracks progress (Student)"
    USER ||--o{ VIOLATION : "commits infraction (Student)"
    USER ||--o{ CERTIFICATE : "earns (Student)"

    EXAM ||--o{ QUESTION : "contains"
    EXAM ||--o{ RESULT : "evaluates"
    EXAM ||--o{ EXAM_PROGRESS : "monitors session"
    EXAM ||--o{ VIOLATION : "logs integrity breaches"
    EXAM ||--o{ CERTIFICATE : "qualifies for"

    PRACTICE_TEST ||--o{ QUESTION : "contains"

    QUESTION ||--o{ RESULT_ANSWER : "referenced in"
    QUESTION ||--o{ PROGRESS_ANSWER : "referenced in"

    RESULT ||--o{ RESULT_ANSWER : "stores response"
    EXAM_PROGRESS ||--o{ PROGRESS_ANSWER : "stores live answer"

    USER {
        ObjectId _id PK
        string name
        string email UK
        string password
        string role "student, teacher, admin"
        string sessionId
        string otp
        datetime otpExpires
        datetime createdAt
    }

    EXAM {
        ObjectId _id PK
        string title
        string category
        string description
        datetime startTime
        datetime endTime
        number durationMinutes
        number passingScore
        number totalMarks
        ObjectId createdBy FK
        boolean resultsPublished
        boolean negativeMarking
        number negativeMarks
    }

    PRACTICE_TEST {
        ObjectId _id PK
        string title
        string description
        string image
        ObjectId createdBy FK
        datetime createdAt
    }

    QUESTION {
        ObjectId _id PK
        ObjectId examId FK
        ObjectId practiceTestId FK
        string text
        string imageUrl
        string type "mcq, subjective, coding"
        number marks
        array options "text, isCorrect"
        array testCases "input, output"
        number wordLimit
    }

    RESULT {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId examId FK
        number score
        number totalQuestions
        number attemptedQuestions
        boolean passed
        datetime submittedAt
    }

    RESULT_ANSWER {
        ObjectId questionId FK
        string selectedOptionText
        string subjectiveAnswer
        string sourceCode
        string language
        boolean isCorrect
        number marksObtained
    }

    EXAM_PROGRESS {
        ObjectId _id PK
        ObjectId studentId FK
        ObjectId examId FK
        ObjectId currentQuestionId FK
    }

    PROGRESS_ANSWER {
        ObjectId questionId FK
        string selectedOptionText
        string subjectiveAnswer
        string sourceCode
        number timeLeft
        boolean locked
    }

    VIOLATION {
        ObjectId _id PK
        ObjectId studentId FK
        ObjectId examId FK
        string violationType "Fullscreen Exit, Tab Change"
        datetime timestamp
    }

    CERTIFICATE {
        ObjectId _id PK
        ObjectId studentId FK
        ObjectId examId FK
        string pdfUrl
        boolean isPublished
        datetime publishedAt
    }

    COURSE {
        ObjectId _id PK
        string category
        string title
        string fullName
        string abbr
        string fees
        array contents
    }

    MESSAGE {
        ObjectId _id PK
        string name
        string email
        string subject
        string message
    }

    TESTIMONIAL {
        ObjectId _id PK
        string name
        string role
        string review
        number rating
    }
```

---

## 2. Entity Specifications & Cardinality Matrix

| Primary Entity | Related Entity | Relationship Type | Cardinality | Description |
| :--- | :--- | :--- | :--- | :--- |
| **User** | **Exam** | One-to-Many (`1 : N`) | `1 : 0..N` | A Teacher or Admin can create multiple examinations. |
| **User** | **PracticeTest** | One-to-Many (`1 : N`) | `1 : 0..N` | A Teacher or Admin can author multiple mock tests. |
| **User** | **Result** | One-to-Many (`1 : N`) | `1 : 0..N` | A Student can attempt multiple assessments, generating separate results. |
| **User** | **ExamProgress** | One-to-One / Many (`1 : N`) | `1 : 0..N` | Tracks live session progress per student per active exam (`unique: studentId + examId`). |
| **User** | **Violation** | One-to-Many (`1 : N`) | `1 : 0..N` | Logs proctoring infractions committed by a student during tests. |
| **User** | **Certificate** | One-to-Many (`1 : N`) | `1 : 0..N` | A student earns certificates upon passing examinations. |
| **Exam** | **Question** | One-to-Many (`1 : N`) | `1 : 1..N` | An examination contains multiple questions of varied types (`mcq`, `subjective`, `coding`). |
| **PracticeTest**| **Question** | One-to-Many (`1 : N`) | `1 : 1..N` | A practice test contains mock assessment questions. |
| **Exam** | **Result** | One-to-Many (`1 : N`) | `1 : 0..N` | An examination has results for every student attempt. |
| **Exam** | **Violation** | One-to-Many (`1 : N`) | `1 : 0..N` | Violations are recorded against a specific examination session. |
| **Exam** | **Certificate** | One-to-Many (`1 : N`) | `1 : 0..N` | Certificates issued specifically for an examination. |

---

## 3. Data Dictionary (Key Schemas)

### 3.1 User (`users`)
- **`_id`**: Primary Key (ObjectId)
- **`email`**: Unique Identifier string used for authentication
- **`password`**: Hashed string stored via `bcrypt`
- **`role`**: Enumerated String (`'student'`, `'teacher'`, `'admin'`)

### 3.2 Exam (`exams`)
- **`_id`**: Primary Key (ObjectId)
- **`createdBy`**: Foreign Key (`User._id`) representing author faculty
- **`passingScore`**: Numeric threshold percentage
- **`durationMinutes`**: Timer limit enforced in `ExamArena.jsx`

### 3.3 Question (`questions`)
- **`_id`**: Primary Key (ObjectId)
- **`examId`**: Optional Foreign Key linking to formal examination (`Exam._id`)
- **`practiceTestId`**: Optional Foreign Key linking to mock exam (`PracticeTest._id`)
- **`type`**: Discriminator string indicating format (`mcq`, `subjective`, `coding`)
- **`options`**: Array of sub-documents containing text and boolean `isCorrect` flag
- **`testCases`**: Array of sub-documents containing standard input/output pairs for code execution

### 3.4 Result (`results`)
- **`_id`**: Primary Key (ObjectId)
- **`userId`**: Foreign Key (`User._id`) identifying the candidate
- **`examId`**: Foreign Key (`Exam._id`) identifying the test
- **`answers`**: Array embedding student choices, source code submissions, and question-level scores
