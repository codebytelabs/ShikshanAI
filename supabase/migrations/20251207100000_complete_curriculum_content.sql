-- =============================================
-- COMPLETE CBSE CLASS 9 & 10 CURRICULUM CONTENT
-- Based on CBSE 2025-26 Syllabus
-- =============================================

-- =============================================
-- CLASS 9 MATHEMATICS CHAPTERS
-- =============================================

INSERT INTO public.chapters (id, subject_id, name, chapter_number, ncert_ref, display_order) VALUES 
  ('44444444-4444-4444-4444-444444444901', '33333333-3333-3333-3333-333333333303', 'Number Systems', 1, 'NCERT Class 9 Math, Ch. 1', 1),
  ('44444444-4444-4444-4444-444444444902', '33333333-3333-3333-3333-333333333303', 'Polynomials', 2, 'NCERT Class 9 Math, Ch. 2', 2),
  ('44444444-4444-4444-4444-444444444903', '33333333-3333-3333-3333-333333333303', 'Coordinate Geometry', 3, 'NCERT Class 9 Math, Ch. 3', 3),
  ('44444444-4444-4444-4444-444444444904', '33333333-3333-3333-3333-333333333303', 'Linear Equations in Two Variables', 4, 'NCERT Class 9 Math, Ch. 4', 4),
  ('44444444-4444-4444-4444-444444444905', '33333333-3333-3333-3333-333333333303', 'Introduction to Euclid''s Geometry', 5, 'NCERT Class 9 Math, Ch. 5', 5),
  ('44444444-4444-4444-4444-444444444906', '33333333-3333-3333-3333-333333333303', 'Lines and Angles', 6, 'NCERT Class 9 Math, Ch. 6', 6),
  ('44444444-4444-4444-4444-444444444907', '33333333-3333-3333-3333-333333333303', 'Triangles', 7, 'NCERT Class 9 Math, Ch. 7', 7),
  ('44444444-4444-4444-4444-444444444908', '33333333-3333-3333-3333-333333333303', 'Quadrilaterals', 8, 'NCERT Class 9 Math, Ch. 8', 8),
  ('44444444-4444-4444-4444-444444444909', '33333333-3333-3333-3333-333333333303', 'Areas of Parallelograms and Triangles', 9, 'NCERT Class 9 Math, Ch. 9', 9),
  ('44444444-4444-4444-4444-444444444910', '33333333-3333-3333-3333-333333333303', 'Circles', 10, 'NCERT Class 9 Math, Ch. 10', 10),
  ('44444444-4444-4444-4444-444444444911', '33333333-3333-3333-3333-333333333303', 'Constructions', 11, 'NCERT Class 9 Math, Ch. 11', 11),
  ('44444444-4444-4444-4444-444444444912', '33333333-3333-3333-3333-333333333303', 'Heron''s Formula', 12, 'NCERT Class 9 Math, Ch. 12', 12),
  ('44444444-4444-4444-4444-444444444913', '33333333-3333-3333-3333-333333333303', 'Surface Areas and Volumes', 13, 'NCERT Class 9 Math, Ch. 13', 13),
  ('44444444-4444-4444-4444-444444444914', '33333333-3333-3333-3333-333333333303', 'Statistics', 14, 'NCERT Class 9 Math, Ch. 14', 14),
  ('44444444-4444-4444-4444-444444444915', '33333333-3333-3333-3333-333333333303', 'Probability', 15, 'NCERT Class 9 Math, Ch. 15', 15)
ON CONFLICT DO NOTHING;

-- =============================================
-- CLASS 9 SCIENCE CHAPTERS
-- =============================================

INSERT INTO public.chapters (id, subject_id, name, chapter_number, ncert_ref, display_order) VALUES 
  ('44444444-4444-4444-4444-444444444921', '33333333-3333-3333-3333-333333333304', 'Matter in Our Surroundings', 1, 'NCERT Class 9 Science, Ch. 1', 1),
  ('44444444-4444-4444-4444-444444444922', '33333333-3333-3333-3333-333333333304', 'Is Matter Around Us Pure?', 2, 'NCERT Class 9 Science, Ch. 2', 2),
  ('44444444-4444-4444-4444-444444444923', '33333333-3333-3333-3333-333333333304', 'Atoms and Molecules', 3, 'NCERT Class 9 Science, Ch. 3', 3),
  ('44444444-4444-4444-4444-444444444924', '33333333-3333-3333-3333-333333333304', 'Structure of the Atom', 4, 'NCERT Class 9 Science, Ch. 4', 4),
  ('44444444-4444-4444-4444-444444444925', '33333333-3333-3333-3333-333333333304', 'The Fundamental Unit of Life', 5, 'NCERT Class 9 Science, Ch. 5', 5),
  ('44444444-4444-4444-4444-444444444926', '33333333-3333-3333-3333-333333333304', 'Tissues', 6, 'NCERT Class 9 Science, Ch. 6', 6),
  ('44444444-4444-4444-4444-444444444927', '33333333-3333-3333-3333-333333333304', 'Motion', 7, 'NCERT Class 9 Science, Ch. 7', 7),
  ('44444444-4444-4444-4444-444444444928', '33333333-3333-3333-3333-333333333304', 'Force and Laws of Motion', 8, 'NCERT Class 9 Science, Ch. 8', 8),
  ('44444444-4444-4444-4444-444444444929', '33333333-3333-3333-3333-333333333304', 'Gravitation', 9, 'NCERT Class 9 Science, Ch. 9', 9),
  ('44444444-4444-4444-4444-444444444930', '33333333-3333-3333-3333-333333333304', 'Work and Energy', 10, 'NCERT Class 9 Science, Ch. 10', 10),
  ('44444444-4444-4444-4444-444444444931', '33333333-3333-3333-3333-333333333304', 'Sound', 11, 'NCERT Class 9 Science, Ch. 11', 11),
  ('44444444-4444-4444-4444-444444444932', '33333333-3333-3333-3333-333333333304', 'Improvement in Food Resources', 12, 'NCERT Class 9 Science, Ch. 12', 12)
ON CONFLICT DO NOTHING;

-- =============================================
-- REMAINING CLASS 10 MATHEMATICS CHAPTERS (9-15)
-- =============================================

INSERT INTO public.chapters (id, subject_id, name, chapter_number, ncert_ref, display_order) VALUES 
  ('44444444-4444-4444-4444-444444444409', '33333333-3333-3333-3333-333333333301', 'Some Applications of Trigonometry', 9, 'NCERT Class 10 Math, Ch. 9', 9),
  ('44444444-4444-4444-4444-444444444410', '33333333-3333-3333-3333-333333333301', 'Circles', 10, 'NCERT Class 10 Math, Ch. 10', 10),
  ('44444444-4444-4444-4444-444444444420', '33333333-3333-3333-3333-333333333301', 'Constructions', 11, 'NCERT Class 10 Math, Ch. 11', 11),
  ('44444444-4444-4444-4444-444444444421', '33333333-3333-3333-3333-333333333301', 'Areas Related to Circles', 12, 'NCERT Class 10 Math, Ch. 12', 12),
  ('44444444-4444-4444-4444-444444444422', '33333333-3333-3333-3333-333333333301', 'Surface Areas and Volumes', 13, 'NCERT Class 10 Math, Ch. 13', 13),
  ('44444444-4444-4444-4444-444444444423', '33333333-3333-3333-3333-333333333301', 'Statistics', 14, 'NCERT Class 10 Math, Ch. 14', 14),
  ('44444444-4444-4444-4444-444444444424', '33333333-3333-3333-3333-333333333301', 'Probability', 15, 'NCERT Class 10 Math, Ch. 15', 15)
ON CONFLICT DO NOTHING;

-- =============================================
-- REMAINING CLASS 10 SCIENCE CHAPTERS (9-16)
-- =============================================

INSERT INTO public.chapters (id, subject_id, name, chapter_number, ncert_ref, display_order) VALUES 
  ('44444444-4444-4444-4444-444444444419', '33333333-3333-3333-3333-333333333302', 'Heredity and Evolution', 9, 'NCERT Class 10 Science, Ch. 9', 9),
  ('44444444-4444-4444-4444-444444444425', '33333333-3333-3333-3333-333333333302', 'Light - Reflection and Refraction', 10, 'NCERT Class 10 Science, Ch. 10', 10),
  ('44444444-4444-4444-4444-444444444426', '33333333-3333-3333-3333-333333333302', 'Human Eye and Colourful World', 11, 'NCERT Class 10 Science, Ch. 11', 11),
  ('44444444-4444-4444-4444-444444444427', '33333333-3333-3333-3333-333333333302', 'Electricity', 12, 'NCERT Class 10 Science, Ch. 12', 12),
  ('44444444-4444-4444-4444-444444444428', '33333333-3333-3333-3333-333333333302', 'Magnetic Effects of Electric Current', 13, 'NCERT Class 10 Science, Ch. 13', 13),
  ('44444444-4444-4444-4444-444444444429', '33333333-3333-3333-3333-333333333302', 'Sources of Energy', 14, 'NCERT Class 10 Science, Ch. 14', 14),
  ('44444444-4444-4444-4444-444444444430', '33333333-3333-3333-3333-333333333302', 'Our Environment', 15, 'NCERT Class 10 Science, Ch. 15', 15),
  ('44444444-4444-4444-4444-444444444431', '33333333-3333-3333-3333-333333333302', 'Sustainable Management of Natural Resources', 16, 'NCERT Class 10 Science, Ch. 16', 16)
ON CONFLICT DO NOTHING;


-- =============================================
-- CLASS 9 MATHEMATICS TOPICS
-- =============================================

-- Chapter 1: Number Systems
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555559101', '44444444-4444-4444-4444-444444444901', 'Rational Numbers on Number Line', 3, 'pp. 1-5', 1),
  ('55555555-5555-5555-5555-555555559102', '44444444-4444-4444-4444-444444444901', 'Irrational Numbers', 4, 'pp. 6-12', 2),
  ('55555555-5555-5555-5555-555555559103', '44444444-4444-4444-4444-444444444901', 'Real Numbers and Their Decimal Expansions', 3, 'pp. 13-18', 3),
  ('55555555-5555-5555-5555-555555559104', '44444444-4444-4444-4444-444444444901', 'Operations on Real Numbers', 3, 'pp. 19-24', 4),
  ('55555555-5555-5555-5555-555555559105', '44444444-4444-4444-4444-444444444901', 'Laws of Exponents for Real Numbers', 3, 'pp. 25-30', 5)
ON CONFLICT DO NOTHING;

-- Chapter 2: Polynomials
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555559201', '44444444-4444-4444-4444-444444444902', 'Polynomials in One Variable', 3, 'pp. 32-36', 1),
  ('55555555-5555-5555-5555-555555559202', '44444444-4444-4444-4444-444444444902', 'Zeros of a Polynomial', 3, 'pp. 37-42', 2),
  ('55555555-5555-5555-5555-555555559203', '44444444-4444-4444-4444-444444444902', 'Remainder Theorem', 3, 'pp. 43-48', 3),
  ('55555555-5555-5555-5555-555555559204', '44444444-4444-4444-4444-444444444902', 'Factorisation of Polynomials', 4, 'pp. 49-56', 4),
  ('55555555-5555-5555-5555-555555559205', '44444444-4444-4444-4444-444444444902', 'Algebraic Identities', 4, 'pp. 57-64', 5)
ON CONFLICT DO NOTHING;

-- Chapter 3: Coordinate Geometry
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555559301', '44444444-4444-4444-4444-444444444903', 'Cartesian System', 3, 'pp. 66-72', 1),
  ('55555555-5555-5555-5555-555555559302', '44444444-4444-4444-4444-444444444903', 'Plotting Points in the Plane', 3, 'pp. 73-78', 2)
ON CONFLICT DO NOTHING;

-- Chapter 4: Linear Equations in Two Variables
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555559401', '44444444-4444-4444-4444-444444444904', 'Linear Equations', 3, 'pp. 80-86', 1),
  ('55555555-5555-5555-5555-555555559402', '44444444-4444-4444-4444-444444444904', 'Solution of a Linear Equation', 3, 'pp. 87-92', 2),
  ('55555555-5555-5555-5555-555555559403', '44444444-4444-4444-4444-444444444904', 'Graph of a Linear Equation', 4, 'pp. 93-100', 3)
ON CONFLICT DO NOTHING;

-- Chapter 5: Introduction to Euclid's Geometry
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555559501', '44444444-4444-4444-4444-444444444905', 'Euclid''s Definitions and Axioms', 3, 'pp. 102-108', 1),
  ('55555555-5555-5555-5555-555555559502', '44444444-4444-4444-4444-444444444905', 'Euclid''s Five Postulates', 3, 'pp. 109-114', 2)
ON CONFLICT DO NOTHING;

-- Chapter 6: Lines and Angles
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555559601', '44444444-4444-4444-4444-444444444906', 'Basic Terms and Definitions', 3, 'pp. 116-120', 1),
  ('55555555-5555-5555-5555-555555559602', '44444444-4444-4444-4444-444444444906', 'Pairs of Angles', 4, 'pp. 121-128', 2),
  ('55555555-5555-5555-5555-555555559603', '44444444-4444-4444-4444-444444444906', 'Parallel Lines and Transversal', 4, 'pp. 129-136', 3),
  ('55555555-5555-5555-5555-555555559604', '44444444-4444-4444-4444-444444444906', 'Angle Sum Property of Triangle', 3, 'pp. 137-142', 4)
ON CONFLICT DO NOTHING;

-- Chapter 7: Triangles
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555559701', '44444444-4444-4444-4444-444444444907', 'Congruence of Triangles', 4, 'pp. 144-152', 1),
  ('55555555-5555-5555-5555-555555559702', '44444444-4444-4444-4444-444444444907', 'Criteria for Congruence', 5, 'pp. 153-164', 2),
  ('55555555-5555-5555-5555-555555559703', '44444444-4444-4444-4444-444444444907', 'Properties of Triangles', 4, 'pp. 165-174', 3),
  ('55555555-5555-5555-5555-555555559704', '44444444-4444-4444-4444-444444444907', 'Inequalities in a Triangle', 3, 'pp. 175-180', 4)
ON CONFLICT DO NOTHING;

-- Chapter 8: Quadrilaterals
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555559801', '44444444-4444-4444-4444-444444444908', 'Angle Sum Property', 2, 'pp. 182-186', 1),
  ('55555555-5555-5555-5555-555555559802', '44444444-4444-4444-4444-444444444908', 'Types of Quadrilaterals', 4, 'pp. 187-194', 2),
  ('55555555-5555-5555-5555-555555559803', '44444444-4444-4444-4444-444444444908', 'Properties of Parallelogram', 4, 'pp. 195-204', 3),
  ('55555555-5555-5555-5555-555555559804', '44444444-4444-4444-4444-444444444908', 'Mid-point Theorem', 3, 'pp. 205-210', 4)
ON CONFLICT DO NOTHING;

-- Chapter 9: Areas of Parallelograms and Triangles
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555559901', '44444444-4444-4444-4444-444444444909', 'Figures on Same Base', 3, 'pp. 212-218', 1),
  ('55555555-5555-5555-5555-555555559902', '44444444-4444-4444-4444-444444444909', 'Parallelograms on Same Base', 3, 'pp. 219-226', 2),
  ('55555555-5555-5555-5555-555555559903', '44444444-4444-4444-4444-444444444909', 'Triangles on Same Base', 3, 'pp. 227-234', 3)
ON CONFLICT DO NOTHING;

-- Chapter 10: Circles
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555591001', '44444444-4444-4444-4444-444444444910', 'Circles and Its Related Terms', 3, 'pp. 236-242', 1),
  ('55555555-5555-5555-5555-555555591002', '44444444-4444-4444-4444-444444444910', 'Angle Subtended by a Chord', 4, 'pp. 243-252', 2),
  ('55555555-5555-5555-5555-555555591003', '44444444-4444-4444-4444-444444444910', 'Perpendicular from Centre to Chord', 3, 'pp. 253-260', 3),
  ('55555555-5555-5555-5555-555555591004', '44444444-4444-4444-4444-444444444910', 'Cyclic Quadrilaterals', 3, 'pp. 261-268', 4)
ON CONFLICT DO NOTHING;

-- Chapter 11: Constructions
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555591101', '44444444-4444-4444-4444-444444444911', 'Basic Constructions', 4, 'pp. 270-278', 1),
  ('55555555-5555-5555-5555-555555591102', '44444444-4444-4444-4444-444444444911', 'Constructions of Triangles', 4, 'pp. 279-288', 2)
ON CONFLICT DO NOTHING;

-- Chapter 12: Heron's Formula
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555591201', '44444444-4444-4444-4444-444444444912', 'Area of Triangle Using Heron''s Formula', 3, 'pp. 290-298', 1),
  ('55555555-5555-5555-5555-555555591202', '44444444-4444-4444-4444-444444444912', 'Application of Heron''s Formula', 3, 'pp. 299-306', 2)
ON CONFLICT DO NOTHING;

-- Chapter 13: Surface Areas and Volumes
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555591301', '44444444-4444-4444-4444-444444444913', 'Surface Area of Cube and Cuboid', 3, 'pp. 308-316', 1),
  ('55555555-5555-5555-5555-555555591302', '44444444-4444-4444-4444-444444444913', 'Surface Area of Cylinder', 3, 'pp. 317-324', 2),
  ('55555555-5555-5555-5555-555555591303', '44444444-4444-4444-4444-444444444913', 'Surface Area of Cone', 3, 'pp. 325-332', 3),
  ('55555555-5555-5555-5555-555555591304', '44444444-4444-4444-4444-444444444913', 'Surface Area of Sphere', 3, 'pp. 333-340', 4),
  ('55555555-5555-5555-5555-555555591305', '44444444-4444-4444-4444-444444444913', 'Volume of Cube and Cuboid', 3, 'pp. 341-348', 5),
  ('55555555-5555-5555-5555-555555591306', '44444444-4444-4444-4444-444444444913', 'Volume of Cylinder', 3, 'pp. 349-356', 6),
  ('55555555-5555-5555-5555-555555591307', '44444444-4444-4444-4444-444444444913', 'Volume of Cone', 3, 'pp. 357-364', 7),
  ('55555555-5555-5555-5555-555555591308', '44444444-4444-4444-4444-444444444913', 'Volume of Sphere', 3, 'pp. 365-372', 8)
ON CONFLICT DO NOTHING;

-- Chapter 14: Statistics
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555591401', '44444444-4444-4444-4444-444444444914', 'Collection and Presentation of Data', 3, 'pp. 374-382', 1),
  ('55555555-5555-5555-5555-555555591402', '44444444-4444-4444-4444-444444444914', 'Graphical Representation of Data', 4, 'pp. 383-394', 2),
  ('55555555-5555-5555-5555-555555591403', '44444444-4444-4444-4444-444444444914', 'Measures of Central Tendency', 4, 'pp. 395-406', 3)
ON CONFLICT DO NOTHING;

-- Chapter 15: Probability
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555591501', '44444444-4444-4444-4444-444444444915', 'Probability - An Experimental Approach', 4, 'pp. 408-420', 1)
ON CONFLICT DO NOTHING;


-- =============================================
-- CLASS 9 SCIENCE TOPICS
-- =============================================

-- Chapter 1: Matter in Our Surroundings
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555592101', '44444444-4444-4444-4444-444444444921', 'Physical Nature of Matter', 3, 'pp. 1-6', 1),
  ('55555555-5555-5555-5555-555555592102', '44444444-4444-4444-4444-444444444921', 'Characteristics of Particles of Matter', 3, 'pp. 7-12', 2),
  ('55555555-5555-5555-5555-555555592103', '44444444-4444-4444-4444-444444444921', 'States of Matter', 4, 'pp. 13-20', 3),
  ('55555555-5555-5555-5555-555555592104', '44444444-4444-4444-4444-444444444921', 'Change of State of Matter', 4, 'pp. 21-28', 4),
  ('55555555-5555-5555-5555-555555592105', '44444444-4444-4444-4444-444444444921', 'Evaporation', 3, 'pp. 29-34', 5)
ON CONFLICT DO NOTHING;

-- Chapter 2: Is Matter Around Us Pure?
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555592201', '44444444-4444-4444-4444-444444444922', 'Pure Substances', 3, 'pp. 36-42', 1),
  ('55555555-5555-5555-5555-555555592202', '44444444-4444-4444-4444-444444444922', 'Mixtures', 4, 'pp. 43-50', 2),
  ('55555555-5555-5555-5555-555555592203', '44444444-4444-4444-4444-444444444922', 'Solutions', 4, 'pp. 51-58', 3),
  ('55555555-5555-5555-5555-555555592204', '44444444-4444-4444-4444-444444444922', 'Separation of Mixtures', 5, 'pp. 59-70', 4),
  ('55555555-5555-5555-5555-555555592205', '44444444-4444-4444-4444-444444444922', 'Physical and Chemical Changes', 3, 'pp. 71-76', 5)
ON CONFLICT DO NOTHING;

-- Chapter 3: Atoms and Molecules
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555592301', '44444444-4444-4444-4444-444444444923', 'Laws of Chemical Combination', 3, 'pp. 78-84', 1),
  ('55555555-5555-5555-5555-555555592302', '44444444-4444-4444-4444-444444444923', 'Atoms', 4, 'pp. 85-92', 2),
  ('55555555-5555-5555-5555-555555592303', '44444444-4444-4444-4444-444444444923', 'Molecules', 4, 'pp. 93-100', 3),
  ('55555555-5555-5555-5555-555555592304', '44444444-4444-4444-4444-444444444923', 'Writing Chemical Formulae', 4, 'pp. 101-108', 4),
  ('55555555-5555-5555-5555-555555592305', '44444444-4444-4444-4444-444444444923', 'Molecular Mass and Mole Concept', 4, 'pp. 109-118', 5)
ON CONFLICT DO NOTHING;

-- Chapter 4: Structure of the Atom
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555592401', '44444444-4444-4444-4444-444444444924', 'Charged Particles in Matter', 3, 'pp. 120-126', 1),
  ('55555555-5555-5555-5555-555555592402', '44444444-4444-4444-4444-444444444924', 'Structure of an Atom', 4, 'pp. 127-136', 2),
  ('55555555-5555-5555-5555-555555592403', '44444444-4444-4444-4444-444444444924', 'Distribution of Electrons in Shells', 4, 'pp. 137-146', 3),
  ('55555555-5555-5555-5555-555555592404', '44444444-4444-4444-4444-444444444924', 'Valency', 3, 'pp. 147-152', 4),
  ('55555555-5555-5555-5555-555555592405', '44444444-4444-4444-4444-444444444924', 'Atomic Number and Mass Number', 3, 'pp. 153-160', 5)
ON CONFLICT DO NOTHING;

-- Chapter 5: The Fundamental Unit of Life
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555592501', '44444444-4444-4444-4444-444444444925', 'What is a Cell?', 3, 'pp. 162-168', 1),
  ('55555555-5555-5555-5555-555555592502', '44444444-4444-4444-4444-444444444925', 'Structural Organisation of a Cell', 5, 'pp. 169-180', 2),
  ('55555555-5555-5555-5555-555555592503', '44444444-4444-4444-4444-444444444925', 'Cell Organelles', 5, 'pp. 181-194', 3)
ON CONFLICT DO NOTHING;

-- Chapter 6: Tissues
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555592601', '44444444-4444-4444-4444-444444444926', 'Plant Tissues', 5, 'pp. 196-210', 1),
  ('55555555-5555-5555-5555-555555592602', '44444444-4444-4444-4444-444444444926', 'Animal Tissues', 5, 'pp. 211-226', 2)
ON CONFLICT DO NOTHING;

-- Chapter 7: Motion
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555592701', '44444444-4444-4444-4444-444444444927', 'Describing Motion', 4, 'pp. 228-238', 1),
  ('55555555-5555-5555-5555-555555592702', '44444444-4444-4444-4444-444444444927', 'Measuring Rate of Motion', 4, 'pp. 239-250', 2),
  ('55555555-5555-5555-5555-555555592703', '44444444-4444-4444-4444-444444444927', 'Graphical Representation of Motion', 4, 'pp. 251-262', 3),
  ('55555555-5555-5555-5555-555555592704', '44444444-4444-4444-4444-444444444927', 'Equations of Motion', 4, 'pp. 263-274', 4),
  ('55555555-5555-5555-5555-555555592705', '44444444-4444-4444-4444-444444444927', 'Uniform Circular Motion', 3, 'pp. 275-282', 5)
ON CONFLICT DO NOTHING;

-- Chapter 8: Force and Laws of Motion
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555592801', '44444444-4444-4444-4444-444444444928', 'Balanced and Unbalanced Forces', 3, 'pp. 284-292', 1),
  ('55555555-5555-5555-5555-555555592802', '44444444-4444-4444-4444-444444444928', 'First Law of Motion', 4, 'pp. 293-302', 2),
  ('55555555-5555-5555-5555-555555592803', '44444444-4444-4444-4444-444444444928', 'Inertia and Mass', 3, 'pp. 303-310', 3),
  ('55555555-5555-5555-5555-555555592804', '44444444-4444-4444-4444-444444444928', 'Second Law of Motion', 4, 'pp. 311-322', 4),
  ('55555555-5555-5555-5555-555555592805', '44444444-4444-4444-4444-444444444928', 'Third Law of Motion', 4, 'pp. 323-334', 5),
  ('55555555-5555-5555-5555-555555592806', '44444444-4444-4444-4444-444444444928', 'Conservation of Momentum', 4, 'pp. 335-346', 6)
ON CONFLICT DO NOTHING;

-- Chapter 9: Gravitation
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555592901', '44444444-4444-4444-4444-444444444929', 'Gravitation', 4, 'pp. 348-358', 1),
  ('55555555-5555-5555-5555-555555592902', '44444444-4444-4444-4444-444444444929', 'Free Fall', 3, 'pp. 359-368', 2),
  ('55555555-5555-5555-5555-555555592903', '44444444-4444-4444-4444-444444444929', 'Mass and Weight', 3, 'pp. 369-376', 3),
  ('55555555-5555-5555-5555-555555592904', '44444444-4444-4444-4444-444444444929', 'Thrust and Pressure', 3, 'pp. 377-386', 4),
  ('55555555-5555-5555-5555-555555592905', '44444444-4444-4444-4444-444444444929', 'Archimedes'' Principle', 4, 'pp. 387-398', 5)
ON CONFLICT DO NOTHING;

-- Chapter 10: Work and Energy
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555593001', '44444444-4444-4444-4444-444444444930', 'Work', 4, 'pp. 400-410', 1),
  ('55555555-5555-5555-5555-555555593002', '44444444-4444-4444-4444-444444444930', 'Energy', 4, 'pp. 411-422', 2),
  ('55555555-5555-5555-5555-555555593003', '44444444-4444-4444-4444-444444444930', 'Rate of Doing Work', 3, 'pp. 423-432', 3)
ON CONFLICT DO NOTHING;

-- Chapter 11: Sound
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555593101', '44444444-4444-4444-4444-444444444931', 'Production of Sound', 3, 'pp. 434-442', 1),
  ('55555555-5555-5555-5555-555555593102', '44444444-4444-4444-4444-444444444931', 'Propagation of Sound', 4, 'pp. 443-454', 2),
  ('55555555-5555-5555-5555-555555593103', '44444444-4444-4444-4444-444444444931', 'Reflection of Sound', 4, 'pp. 455-466', 3),
  ('55555555-5555-5555-5555-555555593104', '44444444-4444-4444-4444-444444444931', 'Range of Hearing', 3, 'pp. 467-476', 4),
  ('55555555-5555-5555-5555-555555593105', '44444444-4444-4444-4444-444444444931', 'Applications of Ultrasound', 3, 'pp. 477-486', 5),
  ('55555555-5555-5555-5555-555555593106', '44444444-4444-4444-4444-444444444931', 'Structure of Human Ear', 3, 'pp. 487-494', 6)
ON CONFLICT DO NOTHING;

-- Chapter 12: Improvement in Food Resources
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555593201', '44444444-4444-4444-4444-444444444932', 'Improvement in Crop Yields', 5, 'pp. 496-512', 1),
  ('55555555-5555-5555-5555-555555593202', '44444444-4444-4444-4444-444444444932', 'Animal Husbandry', 5, 'pp. 513-530', 2)
ON CONFLICT DO NOTHING;


-- =============================================
-- REMAINING CLASS 10 MATHEMATICS TOPICS
-- =============================================

-- Chapter 3: Pair of Linear Equations (existing chapter, add topics)
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555550301', '44444444-4444-4444-4444-444444444403', 'Graphical Method of Solution', 4, 'pp. 44-54', 1),
  ('55555555-5555-5555-5555-555555550302', '44444444-4444-4444-4444-444444444403', 'Algebraic Methods of Solving', 5, 'pp. 55-68', 2),
  ('55555555-5555-5555-5555-555555550303', '44444444-4444-4444-4444-444444444403', 'Equations Reducible to Linear Form', 3, 'pp. 69-76', 3)
ON CONFLICT DO NOTHING;

-- Chapter 4: Quadratic Equations (existing chapter, add topics)
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555550401', '44444444-4444-4444-4444-444444444404', 'Quadratic Equations', 3, 'pp. 78-86', 1),
  ('55555555-5555-5555-5555-555555550402', '44444444-4444-4444-4444-444444444404', 'Solution by Factorisation', 4, 'pp. 87-96', 2),
  ('55555555-5555-5555-5555-555555550403', '44444444-4444-4444-4444-444444444404', 'Solution by Completing Square', 4, 'pp. 97-106', 3),
  ('55555555-5555-5555-5555-555555550404', '44444444-4444-4444-4444-444444444404', 'Nature of Roots', 3, 'pp. 107-114', 4)
ON CONFLICT DO NOTHING;

-- Chapter 5: Arithmetic Progressions (existing chapter, add topics)
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555550501', '44444444-4444-4444-4444-444444444405', 'Arithmetic Progressions', 3, 'pp. 116-124', 1),
  ('55555555-5555-5555-5555-555555550502', '44444444-4444-4444-4444-444444444405', 'nth Term of an AP', 4, 'pp. 125-136', 2),
  ('55555555-5555-5555-5555-555555550503', '44444444-4444-4444-4444-444444444405', 'Sum of First n Terms', 4, 'pp. 137-150', 3)
ON CONFLICT DO NOTHING;

-- Chapter 6: Triangles (existing chapter, add topics)
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555550601', '44444444-4444-4444-4444-444444444406', 'Similar Figures', 3, 'pp. 152-160', 1),
  ('55555555-5555-5555-5555-555555550602', '44444444-4444-4444-4444-444444444406', 'Similarity of Triangles', 5, 'pp. 161-178', 2),
  ('55555555-5555-5555-5555-555555550603', '44444444-4444-4444-4444-444444444406', 'Criteria for Similarity', 4, 'pp. 179-192', 3),
  ('55555555-5555-5555-5555-555555550604', '44444444-4444-4444-4444-444444444406', 'Areas of Similar Triangles', 3, 'pp. 193-202', 4),
  ('55555555-5555-5555-5555-555555550605', '44444444-4444-4444-4444-444444444406', 'Pythagoras Theorem', 4, 'pp. 203-216', 5)
ON CONFLICT DO NOTHING;

-- Chapter 7: Coordinate Geometry (existing chapter, add topics)
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555550701', '44444444-4444-4444-4444-444444444407', 'Distance Formula', 4, 'pp. 218-230', 1),
  ('55555555-5555-5555-5555-555555550702', '44444444-4444-4444-4444-444444444407', 'Section Formula', 4, 'pp. 231-244', 2),
  ('55555555-5555-5555-5555-555555550703', '44444444-4444-4444-4444-444444444407', 'Area of a Triangle', 3, 'pp. 245-256', 3)
ON CONFLICT DO NOTHING;

-- Chapter 8: Introduction to Trigonometry (existing chapter, add topics)
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555550801', '44444444-4444-4444-4444-444444444408', 'Trigonometric Ratios', 4, 'pp. 258-270', 1),
  ('55555555-5555-5555-5555-555555550802', '44444444-4444-4444-4444-444444444408', 'Trigonometric Ratios of Specific Angles', 4, 'pp. 271-284', 2),
  ('55555555-5555-5555-5555-555555550803', '44444444-4444-4444-4444-444444444408', 'Trigonometric Ratios of Complementary Angles', 3, 'pp. 285-296', 3),
  ('55555555-5555-5555-5555-555555550804', '44444444-4444-4444-4444-444444444408', 'Trigonometric Identities', 4, 'pp. 297-312', 4)
ON CONFLICT DO NOTHING;

-- Chapter 9: Some Applications of Trigonometry
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555550901', '44444444-4444-4444-4444-444444444409', 'Heights and Distances', 5, 'pp. 314-340', 1)
ON CONFLICT DO NOTHING;

-- Chapter 10: Circles
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555551001', '44444444-4444-4444-4444-444444444410', 'Tangent to a Circle', 4, 'pp. 342-356', 1),
  ('55555555-5555-5555-5555-555555551002', '44444444-4444-4444-4444-444444444410', 'Number of Tangents from a Point', 4, 'pp. 357-372', 2)
ON CONFLICT DO NOTHING;

-- Chapter 11: Constructions
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555551101', '44444444-4444-4444-4444-444444444420', 'Division of a Line Segment', 3, 'pp. 374-384', 1),
  ('55555555-5555-5555-5555-555555551102', '44444444-4444-4444-4444-444444444420', 'Construction of Tangents', 4, 'pp. 385-398', 2)
ON CONFLICT DO NOTHING;

-- Chapter 12: Areas Related to Circles
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555551201', '44444444-4444-4444-4444-444444444421', 'Perimeter and Area of a Circle', 3, 'pp. 400-412', 1),
  ('55555555-5555-5555-5555-555555551202', '44444444-4444-4444-4444-444444444421', 'Areas of Sector and Segment', 4, 'pp. 413-428', 2),
  ('55555555-5555-5555-5555-555555551203', '44444444-4444-4444-4444-444444444421', 'Areas of Combinations of Figures', 4, 'pp. 429-444', 3)
ON CONFLICT DO NOTHING;

-- Chapter 13: Surface Areas and Volumes
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555551301', '44444444-4444-4444-4444-444444444422', 'Surface Area of Combination of Solids', 4, 'pp. 446-460', 1),
  ('55555555-5555-5555-5555-555555551302', '44444444-4444-4444-4444-444444444422', 'Volume of Combination of Solids', 4, 'pp. 461-476', 2),
  ('55555555-5555-5555-5555-555555551303', '44444444-4444-4444-4444-444444444422', 'Conversion of Solid from One Shape to Another', 4, 'pp. 477-492', 3),
  ('55555555-5555-5555-5555-555555551304', '44444444-4444-4444-4444-444444444422', 'Frustum of a Cone', 3, 'pp. 493-506', 4)
ON CONFLICT DO NOTHING;

-- Chapter 14: Statistics
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555551401', '44444444-4444-4444-4444-444444444423', 'Mean of Grouped Data', 4, 'pp. 508-524', 1),
  ('55555555-5555-5555-5555-555555551402', '44444444-4444-4444-4444-444444444423', 'Mode of Grouped Data', 3, 'pp. 525-538', 2),
  ('55555555-5555-5555-5555-555555551403', '44444444-4444-4444-4444-444444444423', 'Median of Grouped Data', 4, 'pp. 539-554', 3),
  ('55555555-5555-5555-5555-555555551404', '44444444-4444-4444-4444-444444444423', 'Graphical Representation of Data', 3, 'pp. 555-568', 4)
ON CONFLICT DO NOTHING;

-- Chapter 15: Probability
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555551501', '44444444-4444-4444-4444-444444444424', 'Probability - A Theoretical Approach', 5, 'pp. 570-600', 1)
ON CONFLICT DO NOTHING;


-- =============================================
-- REMAINING CLASS 10 SCIENCE TOPICS
-- =============================================

-- Chapter 3: Metals and Non-metals (existing chapter, add topics)
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555550131', '44444444-4444-4444-4444-444444444413', 'Physical Properties of Metals and Non-metals', 4, 'pp. 48-58', 1),
  ('55555555-5555-5555-5555-555555550132', '44444444-4444-4444-4444-444444444413', 'Chemical Properties of Metals', 5, 'pp. 59-72', 2),
  ('55555555-5555-5555-5555-555555550133', '44444444-4444-4444-4444-444444444413', 'How do Metals and Non-metals React?', 4, 'pp. 73-84', 3),
  ('55555555-5555-5555-5555-555555550134', '44444444-4444-4444-4444-444444444413', 'Occurrence of Metals', 4, 'pp. 85-96', 4),
  ('55555555-5555-5555-5555-555555550135', '44444444-4444-4444-4444-444444444413', 'Corrosion', 3, 'pp. 97-104', 5)
ON CONFLICT DO NOTHING;

-- Chapter 4: Carbon and its Compounds (existing chapter, add topics)
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555550141', '44444444-4444-4444-4444-444444444414', 'Bonding in Carbon', 4, 'pp. 106-116', 1),
  ('55555555-5555-5555-5555-555555550142', '44444444-4444-4444-4444-444444444414', 'Versatile Nature of Carbon', 4, 'pp. 117-128', 2),
  ('55555555-5555-5555-5555-555555550143', '44444444-4444-4444-4444-444444444414', 'Chemical Properties of Carbon Compounds', 4, 'pp. 129-140', 3),
  ('55555555-5555-5555-5555-555555550144', '44444444-4444-4444-4444-444444444414', 'Important Carbon Compounds', 4, 'pp. 141-154', 4),
  ('55555555-5555-5555-5555-555555550145', '44444444-4444-4444-4444-444444444414', 'Soaps and Detergents', 3, 'pp. 155-164', 5)
ON CONFLICT DO NOTHING;

-- Chapter 5: Life Processes (existing chapter, add topics)
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555550151', '44444444-4444-4444-4444-444444444415', 'Nutrition', 5, 'pp. 166-184', 1),
  ('55555555-5555-5555-5555-555555550152', '44444444-4444-4444-4444-444444444415', 'Respiration', 4, 'pp. 185-198', 2),
  ('55555555-5555-5555-5555-555555550153', '44444444-4444-4444-4444-444444444415', 'Transportation', 5, 'pp. 199-216', 3),
  ('55555555-5555-5555-5555-555555550154', '44444444-4444-4444-4444-444444444415', 'Excretion', 4, 'pp. 217-230', 4)
ON CONFLICT DO NOTHING;

-- Chapter 6: Control and Coordination (existing chapter, add topics)
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555550161', '44444444-4444-4444-4444-444444444416', 'Animals - Nervous System', 5, 'pp. 232-250', 1),
  ('55555555-5555-5555-5555-555555550162', '44444444-4444-4444-4444-444444444416', 'Coordination in Plants', 4, 'pp. 251-264', 2),
  ('55555555-5555-5555-5555-555555550163', '44444444-4444-4444-4444-444444444416', 'Hormones in Animals', 4, 'pp. 265-280', 3)
ON CONFLICT DO NOTHING;

-- Chapter 7: Electricity (existing chapter - was 7, now 12 in new syllabus)
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555550171', '44444444-4444-4444-4444-444444444417', 'Electric Current and Circuit', 4, 'pp. 282-296', 1),
  ('55555555-5555-5555-5555-555555550172', '44444444-4444-4444-4444-444444444417', 'Electric Potential and Potential Difference', 3, 'pp. 297-308', 2),
  ('55555555-5555-5555-5555-555555550173', '44444444-4444-4444-4444-444444444417', 'Ohm''s Law', 4, 'pp. 309-322', 3),
  ('55555555-5555-5555-5555-555555550174', '44444444-4444-4444-4444-444444444417', 'Resistance of a System of Resistors', 4, 'pp. 323-338', 4),
  ('55555555-5555-5555-5555-555555550175', '44444444-4444-4444-4444-444444444417', 'Heating Effect of Electric Current', 4, 'pp. 339-354', 5),
  ('55555555-5555-5555-5555-555555550176', '44444444-4444-4444-4444-444444444417', 'Electric Power', 3, 'pp. 355-366', 6)
ON CONFLICT DO NOTHING;

-- Chapter 8: Magnetic Effects of Electric Current (existing chapter)
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555550181', '44444444-4444-4444-4444-444444444418', 'Magnetic Field and Field Lines', 4, 'pp. 368-382', 1),
  ('55555555-5555-5555-5555-555555550182', '44444444-4444-4444-4444-444444444418', 'Magnetic Field due to Current', 4, 'pp. 383-398', 2),
  ('55555555-5555-5555-5555-555555550183', '44444444-4444-4444-4444-444444444418', 'Force on Current-Carrying Conductor', 4, 'pp. 399-414', 3),
  ('55555555-5555-5555-5555-555555550184', '44444444-4444-4444-4444-444444444418', 'Electric Motor', 3, 'pp. 415-426', 4),
  ('55555555-5555-5555-5555-555555550185', '44444444-4444-4444-4444-444444444418', 'Electromagnetic Induction', 4, 'pp. 427-442', 5),
  ('55555555-5555-5555-5555-555555550186', '44444444-4444-4444-4444-444444444418', 'Electric Generator', 3, 'pp. 443-456', 6)
ON CONFLICT DO NOTHING;

-- Chapter 9: Heredity and Evolution
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555550191', '44444444-4444-4444-4444-444444444419', 'Accumulation of Variation', 3, 'pp. 458-468', 1),
  ('55555555-5555-5555-5555-555555550192', '44444444-4444-4444-4444-444444444419', 'Heredity', 5, 'pp. 469-488', 2),
  ('55555555-5555-5555-5555-555555550193', '44444444-4444-4444-4444-444444444419', 'Evolution', 4, 'pp. 489-506', 3),
  ('55555555-5555-5555-5555-555555550194', '44444444-4444-4444-4444-444444444419', 'Speciation', 3, 'pp. 507-518', 4),
  ('55555555-5555-5555-5555-555555550195', '44444444-4444-4444-4444-444444444419', 'Evolution and Classification', 3, 'pp. 519-530', 5)
ON CONFLICT DO NOTHING;

-- Chapter 10: Light - Reflection and Refraction
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555551011', '44444444-4444-4444-4444-444444444425', 'Reflection of Light', 4, 'pp. 532-548', 1),
  ('55555555-5555-5555-5555-555555551012', '44444444-4444-4444-4444-444444444425', 'Spherical Mirrors', 5, 'pp. 549-570', 2),
  ('55555555-5555-5555-5555-555555551013', '44444444-4444-4444-4444-444444444425', 'Refraction of Light', 4, 'pp. 571-588', 3),
  ('55555555-5555-5555-5555-555555551014', '44444444-4444-4444-4444-444444444425', 'Refraction by Spherical Lenses', 5, 'pp. 589-612', 4),
  ('55555555-5555-5555-5555-555555551015', '44444444-4444-4444-4444-444444444425', 'Power of a Lens', 3, 'pp. 613-624', 5)
ON CONFLICT DO NOTHING;

-- Chapter 11: Human Eye and Colourful World
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555551111', '44444444-4444-4444-4444-444444444426', 'The Human Eye', 4, 'pp. 626-640', 1),
  ('55555555-5555-5555-5555-555555551112', '44444444-4444-4444-4444-444444444426', 'Defects of Vision and Their Correction', 4, 'pp. 641-656', 2),
  ('55555555-5555-5555-5555-555555551113', '44444444-4444-4444-4444-444444444426', 'Refraction of Light through a Prism', 3, 'pp. 657-668', 3),
  ('55555555-5555-5555-5555-555555551114', '44444444-4444-4444-4444-444444444426', 'Dispersion of White Light', 3, 'pp. 669-680', 4),
  ('55555555-5555-5555-5555-555555551115', '44444444-4444-4444-4444-444444444426', 'Atmospheric Refraction', 3, 'pp. 681-692', 5),
  ('55555555-5555-5555-5555-555555551116', '44444444-4444-4444-4444-444444444426', 'Scattering of Light', 3, 'pp. 693-704', 6)
ON CONFLICT DO NOTHING;

-- Chapter 14: Sources of Energy
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555551411', '44444444-4444-4444-4444-444444444429', 'What is a Good Source of Energy?', 3, 'pp. 706-716', 1),
  ('55555555-5555-5555-5555-555555551412', '44444444-4444-4444-4444-444444444429', 'Conventional Sources of Energy', 4, 'pp. 717-732', 2),
  ('55555555-5555-5555-5555-555555551413', '44444444-4444-4444-4444-444444444429', 'Alternative Sources of Energy', 5, 'pp. 733-752', 3),
  ('55555555-5555-5555-5555-555555551414', '44444444-4444-4444-4444-444444444429', 'Environmental Consequences', 3, 'pp. 753-764', 4)
ON CONFLICT DO NOTHING;

-- Chapter 15: Our Environment
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555551511', '44444444-4444-4444-4444-444444444430', 'Ecosystem and Its Components', 4, 'pp. 766-782', 1),
  ('55555555-5555-5555-5555-555555551512', '44444444-4444-4444-4444-444444444430', 'Food Chains and Webs', 4, 'pp. 783-798', 2),
  ('55555555-5555-5555-5555-555555551513', '44444444-4444-4444-4444-444444444430', 'Ozone Layer and Its Depletion', 3, 'pp. 799-812', 3),
  ('55555555-5555-5555-5555-555555551514', '44444444-4444-4444-4444-444444444430', 'Managing the Garbage We Produce', 3, 'pp. 813-826', 4)
ON CONFLICT DO NOTHING;

-- Chapter 16: Sustainable Management of Natural Resources
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555551611', '44444444-4444-4444-4444-444444444431', 'Why Do We Need to Manage Our Resources?', 3, 'pp. 828-840', 1),
  ('55555555-5555-5555-5555-555555551612', '44444444-4444-4444-4444-444444444431', 'Forests and Wildlife', 4, 'pp. 841-858', 2),
  ('55555555-5555-5555-5555-555555551613', '44444444-4444-4444-4444-444444444431', 'Water for All', 4, 'pp. 859-876', 3),
  ('55555555-5555-5555-5555-555555551614', '44444444-4444-4444-4444-444444444431', 'Coal and Petroleum', 3, 'pp. 877-890', 4)
ON CONFLICT DO NOTHING;


-- =============================================
-- ADDITIONAL PRACTICE QUESTIONS
-- =============================================

-- Class 9 Math Questions
INSERT INTO public.practice_questions (topic_id, question, question_type, options, correct_answer, hint, solution, ncert_ref, difficulty) VALUES 
  ('55555555-5555-5555-5555-555555559102', 'Prove that √2 is irrational.', 'short', NULL, 'Proof by contradiction', 'Assume √2 is rational, i.e., √2 = p/q where p and q are coprime integers.', 'Assume √2 = p/q (coprime). Then 2 = p²/q², so p² = 2q². This means p² is even, so p is even. Let p = 2k. Then 4k² = 2q², so q² = 2k². This means q is also even. But p and q cannot both be even if they are coprime. Contradiction. Hence √2 is irrational.', 'NCERT Class 9 Math, Ch. 1', 'medium'),
  ('55555555-5555-5555-5555-555555559201', 'Find the degree of the polynomial 5x³ - 4x² + 7x - 2.', 'mcq', '["1", "2", "3", "4"]', '3', 'The degree is the highest power of the variable.', 'The highest power of x in 5x³ - 4x² + 7x - 2 is 3. Therefore, the degree is 3.', 'NCERT Class 9 Math, Ch. 2', 'easy'),
  ('55555555-5555-5555-5555-555555559301', 'In which quadrant does the point (-3, 4) lie?', 'mcq', '["First", "Second", "Third", "Fourth"]', 'Second', 'Check the signs of x and y coordinates.', 'For (-3, 4): x is negative and y is positive. This corresponds to the Second quadrant.', 'NCERT Class 9 Math, Ch. 3', 'easy'),
  ('55555555-5555-5555-5555-555555559701', 'In triangle ABC, if AB = AC and ∠B = 50°, find ∠A.', 'numerical', NULL, '80°', 'In an isosceles triangle, angles opposite to equal sides are equal.', 'Since AB = AC, triangle ABC is isosceles. ∠B = ∠C = 50°. Sum of angles = 180°. So ∠A = 180° - 50° - 50° = 80°.', 'NCERT Class 9 Math, Ch. 7', 'medium')
ON CONFLICT DO NOTHING;

-- Class 9 Science Questions
INSERT INTO public.practice_questions (topic_id, question, question_type, options, correct_answer, hint, solution, ncert_ref, difficulty) VALUES 
  ('55555555-5555-5555-5555-555555592103', 'Which state of matter has definite shape and definite volume?', 'mcq', '["Solid", "Liquid", "Gas", "Plasma"]', 'Solid', 'Think about which state maintains its shape without a container.', 'Solids have definite shape and definite volume because their particles are closely packed and have strong intermolecular forces.', 'NCERT Class 9 Science, Ch. 1', 'easy'),
  ('55555555-5555-5555-5555-555555592302', 'What is the atomic mass of Carbon?', 'mcq', '["6 u", "12 u", "14 u", "16 u"]', '12 u', 'Carbon has 6 protons and 6 neutrons in its most common isotope.', 'The atomic mass of Carbon-12 is 12 u (6 protons + 6 neutrons).', 'NCERT Class 9 Science, Ch. 3', 'easy'),
  ('55555555-5555-5555-5555-555555592701', 'A car travels 100 km in 2 hours. What is its average speed?', 'numerical', NULL, '50 km/h', 'Average speed = Total distance / Total time', 'Average speed = 100 km / 2 h = 50 km/h', 'NCERT Class 9 Science, Ch. 7', 'easy'),
  ('55555555-5555-5555-5555-555555592804', 'State Newton''s Second Law of Motion.', 'short', NULL, 'F = ma', 'The law relates force, mass, and acceleration.', 'Newton''s Second Law: The rate of change of momentum of a body is directly proportional to the applied force and takes place in the direction of the force. Mathematically, F = ma, where F is force, m is mass, and a is acceleration.', 'NCERT Class 9 Science, Ch. 8', 'medium')
ON CONFLICT DO NOTHING;

-- Class 10 Math Questions (additional)
INSERT INTO public.practice_questions (topic_id, question, question_type, options, correct_answer, hint, solution, ncert_ref, difficulty) VALUES 
  ('55555555-5555-5555-5555-555555550402', 'Solve: x² - 5x + 6 = 0', 'numerical', NULL, 'x = 2, 3', 'Try to factorise the quadratic expression.', 'x² - 5x + 6 = 0\nx² - 2x - 3x + 6 = 0\nx(x-2) - 3(x-2) = 0\n(x-2)(x-3) = 0\nx = 2 or x = 3', 'NCERT Class 10 Math, Ch. 4', 'medium'),
  ('55555555-5555-5555-5555-555555550502', 'Find the 10th term of the AP: 2, 7, 12, 17, ...', 'numerical', NULL, '47', 'Use the formula: aₙ = a + (n-1)d', 'First term a = 2, Common difference d = 7 - 2 = 5\na₁₀ = a + (10-1)d = 2 + 9(5) = 2 + 45 = 47', 'NCERT Class 10 Math, Ch. 5', 'medium'),
  ('55555555-5555-5555-5555-555555550701', 'Find the distance between points A(3, 4) and B(6, 8).', 'numerical', NULL, '5', 'Use the distance formula: d = √[(x₂-x₁)² + (y₂-y₁)²]', 'd = √[(6-3)² + (8-4)²] = √[9 + 16] = √25 = 5', 'NCERT Class 10 Math, Ch. 7', 'easy'),
  ('55555555-5555-5555-5555-555555550801', 'In a right triangle, if one angle is 30°, find sin 30°.', 'mcq', '["1/2", "√3/2", "1/√2", "1"]', '1/2', 'Recall the standard trigonometric ratios.', 'sin 30° = 1/2. This is a standard value that should be memorized.', 'NCERT Class 10 Math, Ch. 8', 'easy'),
  ('55555555-5555-5555-5555-555555551201', 'Find the area of a circle with radius 7 cm. (Use π = 22/7)', 'numerical', NULL, '154 cm²', 'Area of circle = πr²', 'Area = πr² = (22/7) × 7² = (22/7) × 49 = 22 × 7 = 154 cm²', 'NCERT Class 10 Math, Ch. 12', 'easy')
ON CONFLICT DO NOTHING;

-- Class 10 Science Questions (additional)
INSERT INTO public.practice_questions (topic_id, question, question_type, options, correct_answer, hint, solution, ncert_ref, difficulty) VALUES 
  ('55555555-5555-5555-5555-555555550132', 'What happens when iron reacts with dilute hydrochloric acid?', 'mcq', '["No reaction", "Iron chloride and hydrogen gas", "Iron oxide and water", "Iron hydroxide"]', 'Iron chloride and hydrogen gas', 'Metals react with acids to produce salt and hydrogen gas.', 'Fe + 2HCl → FeCl₂ + H₂↑\nIron reacts with dilute HCl to form iron(II) chloride and hydrogen gas.', 'NCERT Class 10 Science, Ch. 3', 'medium'),
  ('55555555-5555-5555-5555-555555550141', 'What is the general formula of alkanes?', 'mcq', '["CₙH₂ₙ", "CₙH₂ₙ₊₂", "CₙH₂ₙ₋₂", "CₙHₙ"]', 'CₙH₂ₙ₊₂', 'Alkanes are saturated hydrocarbons with single bonds only.', 'Alkanes have the general formula CₙH₂ₙ₊₂. For example, methane (CH₄) where n=1: C₁H₂(1)+2 = CH₄', 'NCERT Class 10 Science, Ch. 4', 'easy'),
  ('55555555-5555-5555-5555-555555550173', 'State Ohm''s Law.', 'short', NULL, 'V = IR', 'The law relates voltage, current, and resistance.', 'Ohm''s Law: The current flowing through a conductor is directly proportional to the potential difference across its ends, provided the temperature remains constant. V = IR, where V is voltage, I is current, and R is resistance.', 'NCERT Class 10 Science, Ch. 12', 'easy'),
  ('55555555-5555-5555-5555-555555551012', 'A concave mirror has focal length 15 cm. What is its radius of curvature?', 'numerical', NULL, '30 cm', 'R = 2f for spherical mirrors.', 'Radius of curvature R = 2 × focal length = 2 × 15 = 30 cm', 'NCERT Class 10 Science, Ch. 10', 'easy'),
  ('55555555-5555-5555-5555-555555550192', 'What is the ratio of phenotypes in F2 generation of a monohybrid cross?', 'mcq', '["1:1", "1:2:1", "3:1", "9:3:3:1"]', '3:1', 'Think about Mendel''s experiments with pea plants.', 'In a monohybrid cross, the F2 generation shows a phenotypic ratio of 3:1 (3 dominant : 1 recessive).', 'NCERT Class 10 Science, Ch. 9', 'medium')
ON CONFLICT DO NOTHING;
