-- =============================================
-- ADDITIONAL PRACTICE QUESTIONS
-- Comprehensive Curriculum Content Feature
-- Requirements: 3.1, 3.2, 3.3, 4.3
-- =============================================

-- Ensure ncert_ref column exists (may be missing in some deployments)
ALTER TABLE public.practice_questions ADD COLUMN IF NOT EXISTS ncert_ref TEXT;

-- Real Numbers - Euclid's Division Lemma (10+ questions)
INSERT INTO public.practice_questions (topic_id, question, question_type, options, correct_answer, hint, solution, ncert_ref, difficulty) VALUES
('55555555-5555-5555-5555-555555555501', 'Use Euclid''s division algorithm to find the HCF of 135 and 225.', 'numerical', NULL, '45',
'Start by dividing the larger number by the smaller. Continue until remainder is 0.',
'Step 1: 225 = 135 × 1 + 90
Step 2: 135 = 90 × 1 + 45
Step 3: 90 = 45 × 2 + 0

Since remainder is 0, HCF = 45', 'NCERT Class 10 Math, Ex 1.1, Q1', 'medium'),

('55555555-5555-5555-5555-555555555501', 'Find the HCF of 867 and 255 using Euclid''s division algorithm.', 'numerical', NULL, '51',
'Apply Euclid''s algorithm: divide larger by smaller, then divisor by remainder.',
'Step 1: 867 = 255 × 3 + 102
Step 2: 255 = 102 × 2 + 51
Step 3: 102 = 51 × 2 + 0

HCF = 51', 'NCERT Class 10 Math, Ex 1.1, Q2', 'medium'),

('55555555-5555-5555-5555-555555555501', 'In Euclid''s division lemma a = bq + r, what is the condition on r?', 'mcq', 
'["r > b", "r < b", "r = b", "r ≤ b"]', 'r < b',
'The remainder must be less than the divisor.',
'In Euclid''s division lemma, the remainder r must satisfy 0 ≤ r < b. This means r is always non-negative and strictly less than the divisor b.', 'NCERT Class 10 Math, Ch. 1, p. 2', 'easy'),

('55555555-5555-5555-5555-555555555501', 'If a = 17, b = 5, find q and r in a = bq + r.', 'short', NULL, 'q = 3, r = 2',
'Divide 17 by 5 to find quotient and remainder.',
'17 ÷ 5 = 3 remainder 2
So 17 = 5 × 3 + 2
Therefore q = 3 and r = 2
Verify: 5 × 3 + 2 = 15 + 2 = 17 ✓', 'NCERT Class 10 Math, Ch. 1, Example 1', 'easy'),

('55555555-5555-5555-5555-555555555501', 'Find HCF of 196 and 38220 using Euclid''s algorithm.', 'numerical', NULL, '196',
'Notice that 38220 is much larger. Start dividing.',
'Step 1: 38220 = 196 × 195 + 0

Since remainder is 0 in first step itself, HCF = 196

Verification: 196 × 195 = 38220 ✓', 'NCERT Class 10 Math, Ex 1.1, Q3', 'hard'),

-- Fundamental Theorem of Arithmetic (10+ questions)
('55555555-5555-5555-5555-555555555502', 'Find the prime factorization of 156.', 'short', NULL, '2² × 3 × 13',
'Divide by smallest primes starting from 2.',
'156 = 2 × 78
78 = 2 × 39
39 = 3 × 13
13 is prime

So 156 = 2 × 2 × 3 × 13 = 2² × 3 × 13', 'NCERT Class 10 Math, Ch. 1, p. 7', 'easy'),

('55555555-5555-5555-5555-555555555502', 'Find HCF of 96 and 404 using prime factorization.', 'numerical', NULL, '4',
'First find prime factorization of both numbers.',
'96 = 2⁵ × 3
404 = 2² × 101

Common factors: 2²
HCF = 2² = 4', 'NCERT Class 10 Math, Ex 1.2, Q1', 'medium'),

('55555555-5555-5555-5555-555555555502', 'Find LCM of 12, 15, and 21 using prime factorization.', 'numerical', NULL, '420',
'Find prime factorization of each, then take highest powers.',
'12 = 2² × 3
15 = 3 × 5
21 = 3 × 7

LCM = 2² × 3 × 5 × 7 = 4 × 3 × 5 × 7 = 420', 'NCERT Class 10 Math, Ex 1.2, Q2', 'medium'),

('55555555-5555-5555-5555-555555555502', 'If HCF(306, 657) = 9, find LCM(306, 657).', 'numerical', NULL, '22338',
'Use the formula: HCF × LCM = Product of numbers.',
'HCF × LCM = 306 × 657
9 × LCM = 201042
LCM = 201042 ÷ 9 = 22338', 'NCERT Class 10 Math, Ex 1.2, Q4', 'medium'),

('55555555-5555-5555-5555-555555555502', 'The Fundamental Theorem of Arithmetic states that every composite number can be expressed as:', 'mcq',
'["Sum of primes", "Product of primes uniquely", "Difference of primes", "Quotient of primes"]', 'Product of primes uniquely',
'Think about what the theorem says about factorization.',
'The Fundamental Theorem of Arithmetic states that every composite number can be expressed as a product of primes, and this factorization is unique (apart from the order of factors).', 'NCERT Class 10 Math, Ch. 1, p. 6', 'easy'),

-- Irrational Numbers (10+ questions)
('55555555-5555-5555-5555-555555555503', 'Which of the following is an irrational number?', 'mcq',
'["√16", "√25", "√7", "√49"]', '√7',
'Check which numbers are perfect squares.',
'√16 = 4, √25 = 5, √49 = 7 are all rational (perfect squares).
√7 is irrational because 7 is not a perfect square.', 'NCERT Class 10 Math, Ch. 1, p. 11', 'easy'),

('55555555-5555-5555-5555-555555555503', 'Prove that √3 is irrational.', 'short', NULL, 'Proof by contradiction',
'Use the same method as proving √2 is irrational.',
'Assume √3 = p/q where p, q are coprime.
Then 3 = p²/q², so p² = 3q²
This means p² is divisible by 3, so p is divisible by 3.
Let p = 3m, then 9m² = 3q², so q² = 3m²
This means q is also divisible by 3.
But this contradicts p, q being coprime.
Therefore √3 is irrational.', 'NCERT Class 10 Math, Ch. 1, Theorem 1.4', 'hard'),

('55555555-5555-5555-5555-555555555503', 'Is 0.101001000100001... rational or irrational?', 'mcq',
'["Rational", "Irrational", "Neither", "Cannot determine"]', 'Irrational',
'Check if the decimal is terminating or repeating.',
'The decimal 0.101001000100001... is non-terminating and non-repeating (the pattern of zeros keeps increasing). Therefore, it is irrational.', 'NCERT Class 10 Math, Ch. 1, p. 12', 'medium'),

('55555555-5555-5555-5555-555555555503', 'Classify √45 as rational or irrational.', 'mcq',
'["Rational", "Irrational"]', 'Irrational',
'Simplify √45 first.',
'√45 = √(9 × 5) = 3√5
Since √5 is irrational, 3√5 is also irrational.
Therefore √45 is irrational.', 'NCERT Class 10 Math, Ch. 1, p. 13', 'easy'),

('55555555-5555-5555-5555-555555555503', 'Is (√2 + √3)² rational or irrational?', 'mcq',
'["Rational", "Irrational"]', 'Irrational',
'Expand the expression first.',
'(√2 + √3)² = 2 + 2√6 + 3 = 5 + 2√6
Since √6 is irrational, 2√6 is irrational.
5 + 2√6 is irrational (sum of rational and irrational).', 'NCERT Class 10 Math, Ch. 1, p. 14', 'hard'),

-- Decimal Expansions (10+ questions)
('55555555-5555-5555-5555-555555555504', 'Without actual division, state whether 13/3125 has a terminating decimal.', 'mcq',
'["Yes, terminating", "No, non-terminating"]', 'Yes, terminating',
'Check the prime factorization of the denominator.',
'3125 = 5⁵ (only 5s in factorization)
Since denominator has only 5s, the decimal terminates.
13/3125 = 13/5⁵ = 13 × 2⁵/10⁵ = 416/100000 = 0.00416', 'NCERT Class 10 Math, Ex 1.4, Q1', 'medium'),

('55555555-5555-5555-5555-555555555504', 'Does 17/8 have a terminating or non-terminating decimal?', 'mcq',
'["Terminating", "Non-terminating repeating", "Non-terminating non-repeating"]', 'Terminating',
'Check the prime factors of 8.',
'8 = 2³ (only 2s in factorization)
Since denominator has only 2s, the decimal terminates.
17/8 = 2.125', 'NCERT Class 10 Math, Ex 1.4, Q2', 'easy'),

('55555555-5555-5555-5555-555555555504', 'Express 0.375 as a fraction in lowest terms.', 'short', NULL, '3/8',
'Write as fraction with denominator as power of 10.',
'0.375 = 375/1000
= 375/1000
= 3/8 (dividing by 125)', 'NCERT Class 10 Math, Ch. 1, p. 16', 'easy'),

('55555555-5555-5555-5555-555555555504', 'Will 77/210 have a terminating decimal?', 'mcq',
'["Yes", "No"]', 'No',
'Reduce to lowest terms and check denominator.',
'77/210 = 11/30 (dividing by 7)
30 = 2 × 3 × 5
Since 3 is in the factorization, it will NOT terminate.
11/30 = 0.3666... (repeating)', 'NCERT Class 10 Math, Ex 1.4, Q3', 'medium'),

('55555555-5555-5555-5555-555555555504', 'Convert 0.̅4̅7̅ (0.474747...) to a fraction.', 'short', NULL, '47/99',
'Let x = 0.474747... and multiply by 100.',
'Let x = 0.474747...
100x = 47.474747...
100x - x = 47
99x = 47
x = 47/99', 'NCERT Class 10 Math, Ch. 1, p. 17', 'hard');
