import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useStudentContext } from '@/contexts/StudentContext';
import { ChapterCard } from '@/components/learn/ChapterCard';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import {
  getTopicStatusData,
  getEffectiveMinQuestions,
  calculateTopicStatus,
  calculateChapterProgress,
} from '@/services/topicStatusService';

interface Subject {
  id: string;
  name: string;
  code: string;
  icon: string | null;
}

interface Chapter {
  id: string;
  name: string;
  chapter_number: number;
  curriculum_ref: string | null;
  topics: { id: string }[];
  progress?: number;
  completedTopics?: number;
  totalTopics?: number;
  displayText?: string;
}

export default function Learn() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { profile, subjects: studentSubjects, loading: profileLoading } = useStudentContext();
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [gradeName, setGradeName] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch subjects
  useEffect(() => {
    async function fetchSubjects() {
      if (!profile?.grade_id || studentSubjects.length === 0) {
        setLoading(false);
        return;
      }

      const subjectIds = studentSubjects.map(s => s.subject_id);
      
      const { data } = await supabase
        .from('subjects')
        .select('id, name, code, icon')
        .in('id', subjectIds)
        .order('display_order');

      if (data) {
        setSubjects(data);
        
        // Set initial active subject from URL or first subject
        const urlSubject = searchParams.get('subject');
        if (urlSubject && data.find(s => s.id === urlSubject)) {
          setActiveSubjectId(urlSubject);
        } else if (data.length > 0) {
          setActiveSubjectId(data[0].id);
        }
      }

      // Get grade name
      const { data: gradeData } = await supabase
        .from('grades')
        .select('name')
        .eq('id', profile.grade_id)
        .single();
      
      if (gradeData) {
        setGradeName(gradeData.name);
      }

      setLoading(false);
    }

    if (!profileLoading) {
      fetchSubjects();
    }
  }, [profile, studentSubjects, profileLoading, searchParams]);

  // Fetch chapters when active subject changes
  useEffect(() => {
    async function fetchChapters() {
      if (!activeSubjectId || !profile) return;

      const { data } = await supabase
        .from('chapters')
        .select(`
          id,
          name,
          chapter_number,
          curriculum_ref,
          topics (id)
        `)
        .eq('subject_id', activeSubjectId)
        .order('display_order');

      if (data) {
        // Calculate progress for each chapter using new status system
        const chaptersWithProgress = await Promise.all(
          data.map(async (chapter) => {
            const topicIds = chapter.topics?.map((t) => t.id) ?? [];
            if (topicIds.length === 0) {
              return {
                ...chapter,
                progress: 0,
                completedTopics: 0,
                totalTopics: 0,
                displayText: '0 of 0 topics completed',
              };
            }

            // Get status for each topic using new status system
            const topicStatuses = await Promise.all(
              topicIds.map(async (topicId) => {
                const statusData = await getTopicStatusData(profile.id, topicId);
                const minQuestionsRequired = getEffectiveMinQuestions(statusData.totalQuestionsAvailable);
                return calculateTopicStatus({
                  sectionsCompleted: statusData.sectionsCompleted,
                  totalSections: statusData.totalSections,
                  questionsAttempted: statusData.questionsAttempted,
                  minQuestionsRequired,
                });
              })
            );

            // Calculate chapter progress
            const chapterProgress = calculateChapterProgress(topicStatuses);

            return {
              ...chapter,
              progress: chapterProgress.progress,
              completedTopics: chapterProgress.completedTopics,
              totalTopics: chapterProgress.totalTopics,
              displayText: chapterProgress.displayText,
            };
          })
        );
        setChapters(chaptersWithProgress);
      }
    }

    fetchChapters();
  }, [activeSubjectId, profile, refreshKey]);

  // Refetch data when navigating back to this page
  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [location.key]);

  if (profileLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeSubject = subjects.find(s => s.id === activeSubjectId);

  return (
    <main className="px-4 pt-6">
      <header>
        <h1 className="text-xl font-bold text-foreground">Learn</h1>
        <p className="text-sm text-muted-foreground">CBSE {gradeName} Curriculum</p>
      </header>

      {/* Subject Tabs */}
      <div className="mt-4 flex gap-2">
        {subjects.map((subject) => (
          <button
            key={subject.id}
            onClick={() => setActiveSubjectId(subject.id)}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              activeSubjectId === subject.id
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-card-foreground hover:bg-accent"
            )}
          >
            <span>{subject.icon || '📚'}</span>
            <span>{subject.name}</span>
          </button>
        ))}
      </div>

      {/* Chapter List */}
      <section className="mt-6 pb-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Chapters</h2>
          <span className="text-sm text-muted-foreground">
            {chapters.length} chapters
          </span>
        </div>
        
        <div className="mt-4 space-y-3">
          {chapters.map((chapter, index) => (
            <ChapterCard
              key={chapter.id}
              chapter={{
                id: chapter.id,
                name: chapter.name,
                topicsCount: chapter.topics?.length || 0,
                progress: chapter.progress ?? 0,
                isLocked: false,
                completedTopics: chapter.completedTopics ?? 0,
                totalTopics: chapter.totalTopics ?? chapter.topics?.length ?? 0,
                displayText: chapter.displayText,
              }}
              index={index}
              onClick={() => navigate(`/learn/${activeSubjectId}/${chapter.id}`)}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
