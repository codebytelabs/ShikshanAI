import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useStudentContext } from '@/contexts/StudentContext';
import { cn } from '@/lib/utils';
import { 
  Loader2, ChevronRight, CheckCircle2, Lock, 
  BookOpen, Sparkles, Trophy
} from 'lucide-react';
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

// Subject styling
const subjectStyles: Record<string, { 
  pill: string; 
  pillActive: string; 
  accent: string;
  icon: string;
  gradient: string;
}> = {
  'Mathematics': { 
    pill: 'border-violet-200 text-violet-700 hover:bg-violet-50',
    pillActive: 'bg-gradient-to-r from-violet-500 to-purple-600 text-white border-transparent',
    accent: 'text-violet-600',
    icon: '📐',
    gradient: 'from-violet-500 to-purple-600'
  },
  'Science': { 
    pill: 'border-cyan-200 text-cyan-700 hover:bg-cyan-50',
    pillActive: 'bg-gradient-to-r from-cyan-500 to-teal-600 text-white border-transparent',
    accent: 'text-cyan-600',
    icon: '🔬',
    gradient: 'from-cyan-500 to-teal-600'
  },
  'English': { 
    pill: 'border-pink-200 text-pink-700 hover:bg-pink-50',
    pillActive: 'bg-gradient-to-r from-pink-500 to-rose-600 text-white border-transparent',
    accent: 'text-pink-600',
    icon: '📚',
    gradient: 'from-pink-500 to-rose-600'
  },
  'Social Science': { 
    pill: 'border-orange-200 text-orange-700 hover:bg-orange-50',
    pillActive: 'bg-gradient-to-r from-orange-500 to-amber-600 text-white border-transparent',
    accent: 'text-orange-600',
    icon: '🌍',
    gradient: 'from-orange-500 to-amber-600'
  },
};

const getSubjectStyle = (name: string) => {
  return subjectStyles[name] || {
    pill: 'border-indigo-200 text-indigo-700 hover:bg-indigo-50',
    pillActive: 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-transparent',
    accent: 'text-indigo-600',
    icon: '📖',
    gradient: 'from-indigo-500 to-purple-600'
  };
};

// Chapter illustrations (simple emoji-based for now)
const chapterIcons: Record<string, string> = {
  'Real Numbers': '🔢',
  'Polynomials': '📊',
  'Pair of Linear Equations': '📈',
  'Quadratic Equations': '✖️',
  'Arithmetic Progressions': '🔄',
  'Triangles': '📐',
  'Coordinate Geometry': '📍',
  'Trigonometry': '📏',
  'Circles': '⭕',
  'Constructions': '✏️',
  'Areas Related to Circles': '🎯',
  'Surface Areas and Volumes': '📦',
  'Statistics': '📉',
  'Probability': '🎲',
  // Science
  'Chemical Reactions': '⚗️',
  'Acids, Bases and Salts': '🧪',
  'Metals and Non-metals': '🔩',
  'Carbon and its Compounds': '💎',
  'Life Processes': '🌱',
  'Control and Coordination': '🧠',
  'Heredity and Evolution': '🧬',
  'Light': '💡',
  'Human Eye': '👁️',
  'Electricity': '⚡',
  'Magnetic Effects': '🧲',
  'Sources of Energy': '☀️',
  'Environment': '🌍',
};

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
        const urlSubject = searchParams.get('subject');
        if (urlSubject && data.find(s => s.id === urlSubject)) {
          setActiveSubjectId(urlSubject);
        } else if (data.length > 0) {
          setActiveSubjectId(data[0].id);
        }
      }

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

  useEffect(() => {
    async function fetchChapters() {
      if (!activeSubjectId || !profile) return;

      const { data } = await supabase
        .from('chapters')
        .select(`id, name, chapter_number, curriculum_ref, topics (id)`)
        .eq('subject_id', activeSubjectId)
        .order('display_order');

      if (data) {
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

  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [location.key]);

  if (profileLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading chapters...</p>
        </div>
      </div>
    );
  }

  const activeSubject = subjects.find(s => s.id === activeSubjectId);
  const activeStyle = activeSubject ? getSubjectStyle(activeSubject.name) : getSubjectStyle('');
  
  // Calculate overall progress
  const totalCompleted = chapters.reduce((acc, c) => acc + (c.completedTopics || 0), 0);
  const totalTopics = chapters.reduce((acc, c) => acc + (c.totalTopics || 0), 0);
  const overallProgress = totalTopics > 0 ? Math.round((totalCompleted / totalTopics) * 100) : 0;

  return (
    <main className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="px-4 pt-6 pb-2">
        <h1 className="text-2xl font-bold text-foreground font-display">Learn</h1>
        <p className="text-sm text-muted-foreground">CBSE {gradeName} Curriculum</p>
      </header>

      {/* Subject Pills */}
      <div className="px-4 mt-4">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
          {subjects.map((subject) => {
            const style = getSubjectStyle(subject.name);
            const isActive = activeSubjectId === subject.id;
            return (
              <button
                key={subject.id}
                onClick={() => setActiveSubjectId(subject.id)}
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap border",
                  isActive ? style.pillActive : style.pill,
                  isActive && "shadow-md"
                )}
              >
                <span>{style.icon}</span>
                <span>{subject.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress Overview */}
      {activeSubject && (
        <section className="px-4 mt-4">
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center text-xl",
                  "bg-gradient-to-br", activeStyle.gradient, "text-white"
                )}>
                  {activeStyle.icon}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{activeSubject.name}</p>
                  <p className="text-xs text-muted-foreground">{totalCompleted} of {totalTopics} topics completed</p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn("text-2xl font-bold", activeStyle.accent)}>{overallProgress}%</p>
              </div>
            </div>
            <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700", activeStyle.gradient)}
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </section>
      )}

      {/* Chapter List */}
      <section className="px-4 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground">Chapters</h2>
          <span className="text-sm text-muted-foreground">{chapters.length} chapters</span>
        </div>
        
        <div className="space-y-3">
          {chapters.map((chapter, index) => {
            const isCompleted = chapter.progress === 100;
            const isInProgress = (chapter.progress || 0) > 0 && !isCompleted;
            const chapterIcon = chapterIcons[chapter.name] || '📖';
            
            return (
              <div
                key={chapter.id}
                onClick={() => navigate(`/learn/${activeSubjectId}/${chapter.id}`)}
                className={cn(
                  "group relative rounded-xl border bg-card p-4 transition-all cursor-pointer",
                  isCompleted 
                    ? "border-emerald-200 bg-emerald-50/50" 
                    : isInProgress 
                      ? "border-indigo-200 hover:border-indigo-300 hover:shadow-md" 
                      : "border-border hover:border-indigo-200 hover:shadow-md"
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Chapter Number */}
                  <div className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
                    isCompleted 
                      ? "bg-emerald-500 text-white" 
                      : isInProgress
                        ? cn("bg-gradient-to-br text-white", activeStyle.gradient)
                        : "bg-muted text-muted-foreground"
                  )}>
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-card-foreground group-hover:text-indigo-700 transition-colors">
                          {chapter.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {chapter.topics?.length || 0} topics
                        </p>
                      </div>
                      <span className="text-2xl">{chapterIcon}</span>
                    </div>
                    
                    {/* Progress */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className={cn(
                          isCompleted ? "text-emerald-600 font-medium" : "text-muted-foreground"
                        )}>
                          {isCompleted ? (
                            <span className="flex items-center gap-1">
                              <Trophy className="h-3 w-3" /> All topics completed!
                            </span>
                          ) : (
                            chapter.displayText
                          )}
                        </span>
                        {!isCompleted && (
                          <span className={cn("font-medium", activeStyle.accent)}>
                            {chapter.progress || 0}%
                          </span>
                        )}
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            isCompleted 
                              ? "bg-emerald-500" 
                              : cn("bg-gradient-to-r", activeStyle.gradient)
                          )}
                          style={{ width: `${chapter.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Arrow */}
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0 mt-2" />
                </div>
                
                {/* Current indicator */}
                {isInProgress && (
                  <div className="absolute -left-px top-4 bottom-4 w-1 rounded-r-full bg-gradient-to-b from-indigo-500 to-purple-600" />
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
