import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Grade {
  id: string;
  name: string;
  number: number;
}

interface Subject {
  id: string;
  grade_id: string;
  name: string;
  code: string;
  icon: string | null;
  display_order: number;
}

interface Chapter {
  id: string;
  subject_id: string;
  name: string;
  chapter_number: number;
  curriculum_ref: string | null;
  display_order: number;
  topics?: Topic[];
}

interface Topic {
  id: string;
  chapter_id: string;
  name: string;
  concept_count: number;
  textbook_page_ref: string | null;
  display_order: number;
}

interface Question {
  id: string;
  topic_id: string;
  question: string;
  question_type: string;
  options: string[] | null;
  correct_answer: string | null;
  hint: string | null;
  solution: string | null;
  curriculum_ref: string | null;
  difficulty: string;
}

export function useCurriculum() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGrades() {
      try {
        console.log("[useCurriculum] Fetching grades...");
        const { data, error } = await supabase
          .from('grades')
          .select('*')
          .order('number');

        if (error) {
          console.error("[useCurriculum] Error fetching grades:", error);
          setError(error.message);
        } else if (data) {
          console.log("[useCurriculum] Grades fetched:", data);
          setGrades(data);
        }
      } catch (err) {
        console.error("[useCurriculum] Exception:", err);
        setError(String(err));
      } finally {
        setLoading(false);
      }
    }

    fetchGrades();
  }, []);

  return { grades, loading, error };
}

export function useSubjects(gradeId: string | null) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubjects() {
      if (!gradeId) {
        setSubjects([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('grade_id', gradeId)
        .order('display_order');

      if (!error && data) {
        setSubjects(data);
      }
      setLoading(false);
    }

    fetchSubjects();
  }, [gradeId]);

  return { subjects, loading };
}

export function useChapters(subjectId: string | null) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChapters() {
      if (!subjectId) {
        setChapters([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('chapters')
        .select(`
          *,
          topics (*)
        `)
        .eq('subject_id', subjectId)
        .order('display_order');

      if (!error && data) {
        setChapters(data);
      }
      setLoading(false);
    }

    fetchChapters();
  }, [subjectId]);

  return { chapters, loading };
}

export function useTopics(chapterId: string | null) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopics() {
      if (!chapterId) {
        setTopics([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('chapter_id', chapterId)
        .order('display_order');

      if (!error && data) {
        setTopics(data);
      }
      setLoading(false);
    }

    fetchTopics();
  }, [chapterId]);

  return { topics, loading };
}

export function useQuestions(topicIds: string[]) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuestions() {
      if (topicIds.length === 0) {
        setQuestions([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('practice_questions')
        .select('*')
        .in('topic_id', topicIds);

      if (!error && data) {
        // Parse options from JSON
        const parsed = data.map(q => ({
          ...q,
          options: q.options as string[] | null,
        }));
        setQuestions(parsed);
      }
      setLoading(false);
    }

    fetchQuestions();
  }, [topicIds.join(',')]);

  return { questions, loading };
}
