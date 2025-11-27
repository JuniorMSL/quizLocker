# 🎯 Anti-Cheating & Exam Management Features

## 📋 Exam Duplication

### Overview
Teachers can duplicate existing exams to quickly create new versions without manually recreating all questions and options.

### How to Use
1. Navigate to the teacher dashboard
2. Find the exam you want to duplicate
3. Click the **Copy** icon (📋) in the exam actions
4. Confirm the duplication
5. A new exam will be created with:
   - Title: `[Original Title] (Copy)`
   - All questions and options copied
   - Start time: Tomorrow
   - End time: Tomorrow + 1 hour
   - Same duration and close mode

### Use Cases
- Create multiple versions of the same exam
- Reuse exam templates for different classes
- Create practice exams from real exams
- Quickly set up retake exams

### Technical Details
- **API Endpoint**: `POST /api/exams/[id]/duplicate`
- **Deep Copy**: All questions, options, and settings are duplicated
- **New IDs**: The duplicate gets new database IDs
- **No Attempts**: The duplicate starts with zero attempts

---

## 🔀 Randomized Question Order

### Overview
To prevent cheating, each student receives questions in a **unique but consistent order**. Student A and Student B will see questions in different sequences.

### How It Works

#### For Students
- When you start an exam, questions are automatically shuffled
- Your question order is **unique to you**
- If you refresh the page, you'll see the **same order** (not re-shuffled)
- Other students taking the same exam will see questions in a **different order**

#### For Teachers
- No configuration needed - this is automatic
- Each student's order is deterministic (based on their User ID + Exam ID)
- You can still monitor all attempts normally
- Scoring is unaffected by question order

### Technical Implementation

#### Seeded Shuffle Algorithm
```typescript
// Each student gets a unique seed
const seed = `${userId}-${examId}`

// Seed produces consistent shuffle
shuffleQuestionsForUser(questions, userId, examId)
```

#### Key Features
1. **Deterministic**: Same user + exam = same order every time
2. **Unique**: Different users = different orders
3. **Consistent**: Refreshing the page doesn't change order
4. **Fair**: All students see all questions, just in different sequences

#### Algorithm Details
- Uses **Linear Congruential Generator** (LCG) for seeded randomness
- Implements **Fisher-Yates shuffle** with seeded RNG
- Hash function converts `userId-examId` string to numeric seed
- Guarantees uniform distribution of question orders

### Benefits

#### Anti-Cheating
- ✅ Students can't copy answers in order
- ✅ Looking at neighbor's screen is less effective
- ✅ Sharing screenshots becomes harder
- ✅ Each student must focus on their own exam

#### Fairness
- ✅ All students see the same questions
- ✅ No advantage from question order
- ✅ Consistent experience for each student
- ✅ No randomness during the exam (no re-shuffles)

### Example

**Original Question Order:**
1. What is 2+2?
2. What is the capital of France?
3. What is H2O?

**Student A sees:**
1. What is H2O?
2. What is 2+2?
3. What is the capital of France?

**Student B sees:**
1. What is the capital of France?
2. What is H2O?
3. What is 2+2?

**Student A refreshes page:**
1. What is H2O? (same order as before)
2. What is 2+2?
3. What is the capital of France?

---

## 🔐 Security Considerations

### Question Order
- Shuffle happens **server-side** (cannot be manipulated by client)
- Seed is based on **database IDs** (not predictable)
- Order is **cached in memory** during exam session
- No way for students to see original order

### Exam Duplication
- Only **teachers** can duplicate exams
- Ownership is verified before duplication
- Duplicates are **independent** (editing one doesn't affect the other)
- Student attempts are **not copied** (fresh start)

---

## 📊 Impact on Existing Features

### Monitoring & Stats
- ✅ Works normally - all attempts are tracked
- ✅ Scores are calculated correctly regardless of order
- ✅ Question statistics remain accurate

### Resume Functionality
- ✅ Students see the same shuffled order when resuming
- ✅ Answers are preserved correctly
- ✅ Progress tracking works as expected

### Late Codes
- ✅ Compatible with late access codes
- ✅ Shuffled order applies to late attempts too

---

## 🧪 Testing

### Test Duplication
1. Create an exam with 3+ questions
2. Click duplicate button
3. Verify new exam appears with "(Copy)" suffix
4. Edit the duplicate - original should be unchanged
5. Check that all questions and options are present

### Test Question Randomization
1. Create an exam with 5+ questions
2. Have 2 different students start the exam
3. Compare their question orders - should be different
4. Have one student refresh - order should stay the same
5. Check that both students can complete and submit

---

## 💡 Future Enhancements

### Possible Additions
- [ ] Option to randomize **option order** within questions
- [ ] Teacher toggle to enable/disable randomization per exam
- [ ] Bulk duplicate multiple exams
- [ ] Duplicate with date offset configuration
- [ ] Show "shuffled" indicator to students
- [ ] Analytics on question order effectiveness
