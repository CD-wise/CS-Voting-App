# Student Voting System - Test Data

## Student ID Authentication Samples

Use these sample student IDs to test the voting system. Each ID represents a different student profile for comprehensive testing.

### Student ID Format
Format: `YYXXXNNNL`
- YY: Year of admission (19-23)
- XXX: Programme code (200=CS, 300=IT, 400=Cybersecurity)
- NNN: Sequential student number
- L: Level indicator (a=400, b=300, c=200, d=100)

### Computer Science Students

#### Level 100 (First Year - 2022 intake)
- `22200001d` - Fresh CS student
- `22200002d` - Fresh CS student
- `22200003d` - Fresh CS student
- `22200004d` - Fresh CS student
- `22200005d` - Fresh CS student

#### Level 200 (Second Year - 2021 intake)
- `21200010c` - Second year CS student
- `21200011c` - Second year CS student
- `21200012c` - Second year CS student
- `21200013c` - Second year CS student
- `21200014c` - Second year CS student

#### Level 300 (Third Year - 2020 intake)
- `20200020b` - Third year CS student
- `20200021b` - Third year CS student
- `20200022b` - Third year CS student
- `20200023b` - Third year CS student
- `20200024b` - Third year CS student

#### Level 400 (Final Year - 2019 intake)
- `19200030a` - Final year CS student
- `19200031a` - Final year CS student
- `19200032a` - Final year CS student
- `19200033a` - Final year CS student
- `19200034a` - Final year CS student

### Information Technology Students

#### Level 100 (2022 intake)
- `22300001d` - Fresh IT student
- `22300002d` - Fresh IT student
- `22300003d` - Fresh IT student

#### Level 200 (2021 intake)
- `21300010c` - Second year IT student
- `21300011c` - Second year IT student
- `21300012c` - Second year IT student

#### Level 300 (2020 intake)
- `20300020b` - Third year IT student
- `20300021b` - Third year IT student
- `20300022b` - Third year IT student

#### Level 400 (2019 intake)
- `19300030a` - Final year IT student
- `19300031a` - Final year IT student
- `19300032a` - Final year IT student

### Cybersecurity Students

#### Level 100 (2022 intake)
- `22400001d` - Fresh Cybersecurity student
- `22400002d` - Fresh Cybersecurity student
- `22400003d` - Fresh Cybersecurity student

#### Level 200 (2021 intake)
- `21400010c` - Second year Cybersecurity student
- `21400011c` - Second year Cybersecurity student
- `21400012c` - Second year Cybersecurity student

#### Level 300 (2020 intake)
- `20400020b` - Third year Cybersecurity student
- `20400021b` - Third year Cybersecurity student
- `20400022b` - Third year Cybersecurity student

#### Level 400 (2019 intake)
- `19400030a` - Final year Cybersecurity student
- `19400031a` - Final year Cybersecurity student
- `19400032a` - Final year Cybersecurity student

### Additional Test Cases

#### 2023 Fresh Intake
- `23200001d` - Very fresh CS student
- `23200002d` - Very fresh CS student
- `23300001d` - Very fresh IT student
- `23400001d` - Very fresh Cybersecurity student

#### 2018 Final Year (Extended)
- `18200040a` - Extended final year CS student
- `18300040a` - Extended final year IT student
- `18400040a` - Extended final year Cybersecurity student

## Testing Scenarios

### Scenario 1: Fresh Student (Level 100)
**Student ID:** `22200001d`
**Expected Details to Enter:**
- Name: John Doe
- Phone: +233241234567
- Email: john.doe@student.edu.gh
- Programme: Computer Science
- Level: 100

### Scenario 2: Senior Student (Level 400)
**Student ID:** `19200030a`
**Expected Details to Enter:**
- Name: Sarah Wilson
- Phone: +233241234568
- Email: sarah.wilson@student.edu.gh
- Programme: Computer Science
- Level: 400

### Scenario 3: IT Student (Level 200)
**Student ID:** `21300010c`
**Expected Details to Enter:**
- Name: Michael Johnson
- Phone: +233241234569
- Email: michael.johnson@student.edu.gh
- Programme: Information Technology
- Level: 200

### Scenario 4: Cybersecurity Student (Level 300)
**Student ID:** `20400020b`
**Expected Details to Enter:**
- Name: Emma Taylor
- Phone: +233241234570
- Email: emma.taylor@student.edu.gh
- Programme: Cybersecurity
- Level: 300

## Voting Categories Available

1. **Presidential** - 3 candidates
2. **Vice President** - 2 candidates
3. **Financial Secretary** - 3 candidates
4. **General Secretary** - 2 candidates
5. **General Organizers** - 3 candidates
6. **WOCOM** - 2 candidates
7. **PRO** - 3 candidates
8. **Part-time Representative** - 2 candidates

## Testing Instructions

1. **Start Testing:**
   - Go to the welcome page
   - Enter any student ID from the list above
   - Copy the generated OTP

2. **Enter Details:**
   - Fill in realistic student information
   - Select appropriate programme and level based on the student ID
   - Paste the copied OTP

3. **Vote:**
   - Vote in each category (8 total)
   - Test the progress tracking
   - Verify vote confirmation

4. **Complete:**
   - Submit all votes
   - Verify confirmation page
   - Test return to home functionality

## Error Testing

### Invalid Student IDs (Should Fail)
- `99999999z` - Non-existent format
- `12345678x` - Invalid format
- `00000000a` - Invalid year/programme combination

### Already Voted Testing
After a student completes voting, try using the same student ID again to test the "already voted" prevention.

## Database Reset for Testing

To reset voting status for testing:
\`\`\`sql
-- Reset all voting status
UPDATE students SET has_voted = false;

-- Clear all votes
DELETE FROM votes;

-- Clear all student details
DELETE FROM student_details;

-- Clear all OTPs
DELETE FROM student_otps;
\`\`\`

## Notes for Developers

- All student IDs are case-insensitive (stored as lowercase)
- OTP expires in 10 minutes
- Each student can only vote once per category
- System prevents duplicate voting attempts
- Session data is cleared after voting completion
\`\`\`

Let's also create a quick reference card component for easy testing:
