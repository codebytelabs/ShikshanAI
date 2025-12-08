-- =============================================
-- LESSON SECTIONS SEED DATA
-- Comprehensive Curriculum Content Feature
-- Class 10 Mathematics - Real Numbers Chapter
-- Requirements: 1.1, 1.2, 4.1, 4.2, 4.3
-- =============================================

-- Topic: Euclid's Division Lemma (55555555-5555-5555-5555-555555555501)
INSERT INTO public.lesson_sections (topic_id, section_type, title, content, display_order, ncert_ref) VALUES
-- Introduction
('55555555-5555-5555-5555-555555555501', 'introduction', 'Introduction to Euclid''s Division Lemma',
'Welcome to the fascinating world of number theory! In this lesson, we will explore Euclid''s Division Lemma, one of the most fundamental concepts in mathematics.

Euclid''s Division Lemma is named after the ancient Greek mathematician Euclid, who lived around 300 BCE. This lemma forms the foundation for many important results in number theory, including finding the HCF (Highest Common Factor) of two numbers.

**Learning Objectives:**
- Understand what Euclid''s Division Lemma states
- Learn how to apply the lemma to find HCF
- Solve problems using Euclid''s Division Algorithm', 0, 'NCERT Class 10 Math, Ch. 1, pp. 2-5'),

-- Concept 1
('55555555-5555-5555-5555-555555555501', 'concept', 'Understanding the Lemma',
'**Euclid''s Division Lemma states:**

For any two positive integers a and b, there exist unique integers q and r such that:

a = bq + r, where 0 ≤ r < b

Here:
- **a** is the dividend (the number being divided)
- **b** is the divisor (the number we divide by)
- **q** is the quotient (how many times b fits into a)
- **r** is the remainder (what''s left over)

**Key Points:**
1. The remainder r is always non-negative (≥ 0)
2. The remainder r is always less than the divisor b
3. The quotient q and remainder r are unique for given a and b', 10, 'NCERT Class 10 Math, Ch. 1, pp. 2-3'),

-- Example 1
('55555555-5555-5555-5555-555555555501', 'example', 'Worked Example: Applying the Lemma',
'**Example:** Apply Euclid''s Division Lemma to find q and r when a = 17 and b = 5.

**Solution:**
Step 1: We need to find q and r such that 17 = 5q + r, where 0 ≤ r < 5

Step 2: Divide 17 by 5
- 17 ÷ 5 = 3 remainder 2
- So q = 3 and r = 2

Step 3: Verify: 17 = 5 × 3 + 2 = 15 + 2 = 17 ✓

Step 4: Check conditions:
- r = 2 ≥ 0 ✓
- r = 2 < 5 ✓

**Answer:** q = 3, r = 2', 20, 'NCERT Class 10 Math, Ch. 1, Example 1'),

-- Formula
('55555555-5555-5555-5555-555555555501', 'formula', 'Euclid''s Division Lemma Formula',
'**The Formula:**

a = bq + r

where:
- a = dividend (positive integer)
- b = divisor (positive integer)
- q = quotient (non-negative integer)
- r = remainder (0 ≤ r < b)

**When to use:**
- Finding HCF of two numbers
- Proving divisibility properties
- Solving number theory problems', 30, 'NCERT Class 10 Math, Ch. 1, p. 2'),

-- Remember
('55555555-5555-5555-5555-555555555501', 'remember', 'Key Points to Remember',
'⭐ **Important Points:**

1. The remainder is ALWAYS less than the divisor
2. The remainder is ALWAYS non-negative (≥ 0)
3. Both quotient and remainder are UNIQUE
4. This lemma works only for positive integers

**Common Mistakes to Avoid:**
- Don''t confuse dividend with divisor
- Remember: remainder < divisor (not ≤)
- The lemma doesn''t apply to negative numbers directly', 40, NULL),

-- Summary
('55555555-5555-5555-5555-555555555501', 'summary', 'Summary: Euclid''s Division Lemma',
'**What we learned:**

✅ Euclid''s Division Lemma: a = bq + r (0 ≤ r < b)
✅ Every division of positive integers gives a unique quotient and remainder
✅ The remainder is always less than the divisor
✅ This lemma is the foundation for finding HCF

**Next Steps:**
In the next topic, we''ll learn how to use this lemma repeatedly to find the HCF of two numbers using Euclid''s Division Algorithm.', 50, 'NCERT Class 10 Math, Ch. 1, pp. 2-5');

-- Topic: Fundamental Theorem of Arithmetic (55555555-5555-5555-5555-555555555502)
INSERT INTO public.lesson_sections (topic_id, section_type, title, content, display_order, ncert_ref) VALUES
('55555555-5555-5555-5555-555555555502', 'introduction', 'Introduction to Fundamental Theorem of Arithmetic',
'The Fundamental Theorem of Arithmetic is one of the most important theorems in mathematics. It tells us something remarkable about numbers: every composite number can be broken down into prime factors in exactly one way!

**Learning Objectives:**
- Understand what the Fundamental Theorem of Arithmetic states
- Learn to find prime factorization of numbers
- Apply the theorem to find HCF and LCM', 0, 'NCERT Class 10 Math, Ch. 1, pp. 6-10'),

('55555555-5555-5555-5555-555555555502', 'concept', 'The Theorem Explained',
'**Fundamental Theorem of Arithmetic:**

Every composite number can be expressed as a product of primes, and this factorization is unique (apart from the order of factors).

**In simple words:**
- Take any composite number (like 12, 30, or 100)
- You can always write it as a product of prime numbers
- There''s only ONE way to do this (ignoring order)

**Examples:**
- 12 = 2 × 2 × 3 = 2² × 3
- 30 = 2 × 3 × 5
- 100 = 2 × 2 × 5 × 5 = 2² × 5²', 10, 'NCERT Class 10 Math, Ch. 1, pp. 6-7'),

('55555555-5555-5555-5555-555555555502', 'example', 'Finding Prime Factorization',
'**Example:** Find the prime factorization of 420.

**Solution using Factor Tree:**
Step 1: Start with 420
Step 2: 420 = 2 × 210
Step 3: 210 = 2 × 105
Step 4: 105 = 3 × 35
Step 5: 35 = 5 × 7

**Prime Factorization:** 420 = 2 × 2 × 3 × 5 × 7 = 2² × 3 × 5 × 7

**Verification:** 2² × 3 × 5 × 7 = 4 × 3 × 5 × 7 = 12 × 35 = 420 ✓', 20, 'NCERT Class 10 Math, Ch. 1, Example 3'),

('55555555-5555-5555-5555-555555555502', 'formula', 'HCF and LCM using Prime Factorization',
'**Finding HCF:**
HCF = Product of smallest powers of common prime factors

**Finding LCM:**
LCM = Product of greatest powers of all prime factors

**Important Relationship:**
HCF(a, b) × LCM(a, b) = a × b

**Example:** For 12 = 2² × 3 and 18 = 2 × 3²
- HCF = 2¹ × 3¹ = 6 (smallest powers of common factors)
- LCM = 2² × 3² = 36 (greatest powers of all factors)
- Verify: 6 × 36 = 216 = 12 × 18 ✓', 30, 'NCERT Class 10 Math, Ch. 1, pp. 8-9'),

('55555555-5555-5555-5555-555555555502', 'remember', 'Key Points to Remember',
'⭐ **Remember These:**

1. Every composite number has a UNIQUE prime factorization
2. Prime numbers cannot be factorized further
3. 1 is neither prime nor composite

**For HCF:** Take SMALLEST powers of COMMON primes
**For LCM:** Take GREATEST powers of ALL primes

**Quick Check:** HCF × LCM = Product of the two numbers', 40, NULL),

('55555555-5555-5555-5555-555555555502', 'summary', 'Summary: Fundamental Theorem of Arithmetic',
'**Key Takeaways:**

✅ Every composite number = unique product of primes
✅ Prime factorization helps find HCF and LCM
✅ HCF uses smallest powers of common factors
✅ LCM uses greatest powers of all factors
✅ HCF × LCM = Product of the numbers

**Practice Tip:** Always verify your HCF and LCM using the relationship formula!', 50, 'NCERT Class 10 Math, Ch. 1, pp. 6-10');

-- Topic: Irrational Numbers (55555555-5555-5555-5555-555555555503)
INSERT INTO public.lesson_sections (topic_id, section_type, title, content, display_order, ncert_ref) VALUES
('55555555-5555-5555-5555-555555555503', 'introduction', 'Introduction to Irrational Numbers',
'Have you ever wondered if all numbers can be written as fractions? The ancient Greeks discovered something surprising - some numbers cannot be expressed as p/q where p and q are integers!

These special numbers are called **irrational numbers**, and they include famous numbers like √2, √3, and π.

**Learning Objectives:**
- Understand what makes a number irrational
- Learn to prove that certain numbers are irrational
- Identify irrational numbers', 0, 'NCERT Class 10 Math, Ch. 1, pp. 11-14'),

('55555555-5555-5555-5555-555555555503', 'concept', 'What are Irrational Numbers?',
'**Definition:**
A number is irrational if it CANNOT be expressed in the form p/q, where p and q are integers and q ≠ 0.

**Characteristics of Irrational Numbers:**
1. Their decimal expansion is non-terminating
2. Their decimal expansion is non-repeating
3. They cannot be written as simple fractions

**Examples of Irrational Numbers:**
- √2 = 1.41421356...
- √3 = 1.73205080...
- π = 3.14159265...
- e = 2.71828182...

**Examples of Rational Numbers (NOT irrational):**
- √4 = 2 (perfect square)
- √9 = 3 (perfect square)
- 0.333... = 1/3 (repeating decimal)', 10, 'NCERT Class 10 Math, Ch. 1, pp. 11-12'),

('55555555-5555-5555-5555-555555555503', 'example', 'Proving √2 is Irrational',
'**Theorem:** √2 is irrational.

**Proof by Contradiction:**

Step 1: Assume √2 is rational
So √2 = p/q where p, q are coprime integers (HCF = 1)

Step 2: Square both sides
2 = p²/q²
p² = 2q²

Step 3: This means p² is even, so p must be even
Let p = 2m for some integer m

Step 4: Substitute: (2m)² = 2q²
4m² = 2q²
q² = 2m²

Step 5: This means q² is even, so q must be even

Step 6: But if both p and q are even, they have common factor 2
This contradicts our assumption that HCF(p,q) = 1

**Conclusion:** Our assumption was wrong. √2 is irrational. ∎', 20, 'NCERT Class 10 Math, Ch. 1, Theorem 1.3'),

('55555555-5555-5555-5555-555555555503', 'remember', 'Key Points to Remember',
'⭐ **Remember:**

**Irrational numbers have:**
- Non-terminating decimals
- Non-repeating decimals
- Cannot be written as p/q

**Quick identification:**
- √n is irrational if n is NOT a perfect square
- √2, √3, √5, √6, √7, √8, √10... are all irrational
- √4 = 2, √9 = 3, √16 = 4... are rational

**Proof technique:** Use contradiction!', 30, NULL),

('55555555-5555-5555-5555-555555555503', 'summary', 'Summary: Irrational Numbers',
'**What we learned:**

✅ Irrational numbers cannot be expressed as p/q
✅ They have non-terminating, non-repeating decimals
✅ √n is irrational when n is not a perfect square
✅ We can prove irrationality using contradiction

**Famous Irrational Numbers:**
- √2 ≈ 1.414
- √3 ≈ 1.732
- π ≈ 3.14159
- e ≈ 2.71828', 40, 'NCERT Class 10 Math, Ch. 1, pp. 11-14');

-- Topic: Decimal Expansions (55555555-5555-5555-5555-555555555504)
INSERT INTO public.lesson_sections (topic_id, section_type, title, content, display_order, ncert_ref) VALUES
('55555555-5555-5555-5555-555555555504', 'introduction', 'Decimal Expansions of Rational Numbers',
'Every rational number can be expressed as a decimal. But what kind of decimal? In this lesson, we''ll discover the fascinating patterns in decimal expansions of rational numbers.

**Learning Objectives:**
- Understand terminating and non-terminating decimals
- Identify which fractions give terminating decimals
- Convert between fractions and decimals', 0, 'NCERT Class 10 Math, Ch. 1, pp. 15-18'),

('55555555-5555-5555-5555-555555555504', 'concept', 'Types of Decimal Expansions',
'**Rational numbers have two types of decimal expansions:**

**1. Terminating Decimals:**
- End after a finite number of digits
- Examples: 1/2 = 0.5, 3/4 = 0.75, 7/8 = 0.875

**2. Non-terminating Repeating Decimals:**
- Go on forever but have a repeating pattern
- Examples: 1/3 = 0.333..., 1/7 = 0.142857142857...

**Key Theorem:**
A rational number p/q (in lowest terms) has a terminating decimal expansion if and only if the prime factorization of q has only 2s and 5s.

**Why 2 and 5?** Because our decimal system is base 10, and 10 = 2 × 5', 10, 'NCERT Class 10 Math, Ch. 1, pp. 15-16'),

('55555555-5555-5555-5555-555555555504', 'example', 'Identifying Decimal Types',
'**Example 1:** Does 13/125 have a terminating decimal?

Solution:
- 125 = 5³ (only 5s in prime factorization)
- Yes, it terminates!
- 13/125 = 13/5³ = 13 × 8/1000 = 104/1000 = 0.104

**Example 2:** Does 7/30 have a terminating decimal?

Solution:
- 30 = 2 × 3 × 5 (has 3 in factorization!)
- No, it does NOT terminate
- 7/30 = 0.2333... (repeating)

**Example 3:** Does 17/8 have a terminating decimal?

Solution:
- 8 = 2³ (only 2s in prime factorization)
- Yes, it terminates!
- 17/8 = 2.125', 20, 'NCERT Class 10 Math, Ch. 1, Example 7'),

('55555555-5555-5555-5555-555555555504', 'formula', 'The Terminating Decimal Rule',
'**Rule for Terminating Decimals:**

For a fraction p/q in lowest terms:

**Terminating** if q = 2ⁿ × 5ᵐ (only 2s and 5s)

**Non-terminating** if q has any prime factor other than 2 or 5

**Quick Check Method:**
1. Reduce fraction to lowest terms
2. Find prime factors of denominator
3. If only 2s and 5s → Terminating
4. If any other prime → Non-terminating repeating', 30, 'NCERT Class 10 Math, Ch. 1, Theorem 1.5'),

('55555555-5555-5555-5555-555555555504', 'remember', 'Key Points to Remember',
'⭐ **Remember:**

**Terminating decimals:** Denominator has ONLY 2s and 5s
- 1/2, 1/4, 1/5, 1/8, 1/10, 1/16, 1/20, 1/25...

**Non-terminating repeating:** Denominator has OTHER primes
- 1/3, 1/6, 1/7, 1/9, 1/11, 1/12, 1/13...

**Tip:** Always reduce to lowest terms first!', 40, NULL),

('55555555-5555-5555-5555-555555555504', 'summary', 'Summary: Decimal Expansions',
'**Key Takeaways:**

✅ Rational numbers → Terminating OR Repeating decimals
✅ Irrational numbers → Non-terminating, Non-repeating
✅ Terminating: denominator = 2ⁿ × 5ᵐ only
✅ Always reduce fraction first before checking

**The Complete Picture:**
- Terminating decimals are rational
- Repeating decimals are rational
- Non-repeating infinite decimals are irrational', 50, 'NCERT Class 10 Math, Ch. 1, pp. 15-18');
