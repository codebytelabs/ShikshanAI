import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Loader2, WifiOff, Circle, CircleDot, CheckCircle2, ArrowRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { DownloadButton } from '@/components/pwa/DownloadButton';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { getLessonPack, isChapterDownloaded } from '@/services/offlineService';
import { useStudentContext } from '@/contexts/StudentContext';
import { 
  getTopicStatusData, 
  getTopicProgressInfo,
  getEffectiveMinQuestions,
  calculateChapterProgress,
  calculateTopicStatus,
  type TopicProgressInfo,
  type TopicStatus 
} from '@/services/topicStatusService';
import { cn } from '@/lib/utils';

interface Topic {
  id: string;
  name: string;
  concept_count: number;
  textbook_page_ref: string | null;
}

interface TopicWithStatus extends Topic {
  progressInfo: TopicProgressInfo;
}

interface Chapter {
  id: string;
  name: string;
  curriculum_ref: string | null;
  subjects: {
    name: string;
  };
}

/**
 * Get the appropriate icon for the status
 */
function StatusIcon({ status }: { status: TopicStatus }) {
  const iconClasses = cn(
    'h-5 w-5 flex-shrink-0',
    {
      'text-muted-foreground': status === 'not_started',
      'text-blue-500': status === 'learning',
      'text-orange-500': status === 'practice',
      'text-green-500': status === 'completed',
    }
  );

  switch (status) {
    case 'not_started':
      return <Circle className={iconClasses} />;
    case 'learning':
    case 'practice':
      return <CircleDot className={iconClasses} />;
    case 'completed':
      return <CheckCircle2 className={iconClasses} />;
    default:
      return <Circle className={iconClasses} />;
  }
}

/**
 * Topic card with status-based display
 * Requirements: 1.1, 3.1, 3.2, 3.3
 */
function TopicStatusCard({ 
  topic, 
  onLearnClick, 
  onPracticeClick 
}: { 
  topic: TopicWithStatus; 
  onLearnClick: () => void;
  onPracticeClick: () => void;
}) {
  const { progressInfo } = topic;
  const { status, displayText, actionText } = progressInfo;

  const getStatusTextColor = (status: TopicStatus): string => {
    switch (status) {
      case 'not_started': return 'text-muted-foreground';
      case 'learning': return 'text-blue-600';
      case 'practice': return 'text-orange-600';
      case 'completed': return 'text-green-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <button
      onClick={onLearnClick}
      className="w-full rounded-lg border border-border bg-card p-4 text-left shadow-sm transition-all hover:shadow-md active:scale-[0.99]"
    >
      <div className="flex items-start gap-3">
        <StatusIcon status={status} />
        
        <div className="flex-1">
          <h3 className="font-medium text-card-foreground">{topic.name}</h3>
          <div className="mt-1 flex items-center gap-2">
            <span className={cn("text-sm font-medium", getStatusTextColor(status))}>
              {displayText}
            </span>
            <span className="text-xs text-muted-foreground">
              • {topic.concept_count} concepts
            </span>
          </div>
        </div>
        
        {/* Show action button for practice status */}
        {status === 'practice' && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onPracticeClick();
            }}
            className="text-orange-600 border-orange-200 hover:bg-orange-50"
          >
            {actionText}
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        )}
        
        {/* Show checkmark for completed */}
        {status === 'completed' && (
          <CheckCircle2 className="h-6 w-6 text-green-500" />
        )}
      </div>
    </button>
  );
}

export default function ChapterDetail() {
  const { subjectId, chapterId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isOnline } = useNetworkStatus();
  const { profile } = useStudentContext();
  
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [topics, setTopics] = useState<TopicWithStatus[]>([]);
  const [chapterProgressInfo, setChapterProgressInfo] = useState({ progress: 0, displayText: '0 of 0 topics completed' });
  const [loading, setLoading] = useState(true);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [showDownloadPrompt, setShowDownloadPrompt] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function fetchData() {
      if (!chapterId) return;

      // Check if chapter is downloaded
      const downloaded = await isChapterDownloaded(chapterId);
      setIsDownloaded(downloaded);

      // If offline and not downloaded, show download prompt (Req 4.3)
      if (!navigator.onLine && !downloaded) {
        setShowDownloadPrompt(true);
        setLoading(false);
        return;
      }

      // If offline but downloaded, load from IndexedDB (Req 4.1)
      if (!navigator.onLine && downloaded) {
        const pack = await getLessonPack(chapterId);
        if (pack) {
          setChapter({
            id: pack.chapterId,
            name: pack.chapterName,
            curriculum_ref: null,
            subjects: { name: pack.subjectName },
          });
          // For offline, show default status (not_started)
          const defaultProgressInfo = getTopicProgressInfo({
            sectionsCompleted: 0,
            totalSections: 4,
            questionsAttempted: 0,
          });
          setTopics(pack.topics.map(t => ({
            id: t.id,
            name: t.name,
            concept_count: t.conceptCount,
            textbook_page_ref: t.textbookPageRef,
            progressInfo: defaultProgressInfo,
          })));
        }
        setLoading(false);
        return;
      }

      // Online: Fetch from Supabase
      const { data: chapterData } = await supabase
        .from('chapters')
        .select(`
          id,
          name,
          curriculum_ref,
          subjects (name)
        `)
        .eq('id', chapterId)
        .single();

      if (chapterData) {
        setChapter(chapterData as Chapter);
      }

      const { data: topicsData } = await supabase
        .from('topics')
        .select('*')
        .eq('chapter_id', chapterId)
        .order('display_order');

      if (topicsData) {
        // Fetch status data for all topics using new status system
        if (profile?.id && topicsData.length > 0) {
          const topicsWithStatus = await Promise.all(
            topicsData.map(async (topic) => {
              const statusData = await getTopicStatusData(profile.id, topic.id);
              const minQuestionsRequired = getEffectiveMinQuestions(statusData.totalQuestionsAvailable);
              const progressInfo = getTopicProgressInfo({
                sectionsCompleted: statusData.sectionsCompleted,
                totalSections: statusData.totalSections,
                questionsAttempted: statusData.questionsAttempted,
                minQuestionsRequired,
              });
              return {
                ...topic,
                progressInfo,
              };
            })
          );
          
          setTopics(topicsWithStatus);
          
          // Calculate chapter progress using new system
          const topicStatuses = topicsWithStatus.map(t => t.progressInfo.status);
          const chapterProgress = calculateChapterProgress(topicStatuses);
          setChapterProgressInfo({
            progress: chapterProgress.progress,
            displayText: chapterProgress.displayText,
          });
        } else {
          // No profile, show default status
          const defaultProgressInfo = getTopicProgressInfo({
            sectionsCompleted: 0,
            totalSections: 4,
            questionsAttempted: 0,
          });
          setTopics(topicsData.map(t => ({
            ...t,
            progressInfo: defaultProgressInfo,
          })));
        }
      }

      setLoading(false);
    }

    fetchData();
  }, [chapterId, isOnline, profile?.id, refreshKey]);

  // Refetch data when navigating back to this page
  useEffect(() => {
    // This effect runs when location.key changes (navigation)
    // Trigger a refresh to get updated progress data
    setRefreshKey(prev => prev + 1);
  }, [location.key]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show download prompt when offline and chapter not downloaded (Req 4.3)
  if (showDownloadPrompt) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4">
        <WifiOff className="h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold">Content Not Available Offline</h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          This chapter hasn't been downloaded for offline use.
          Connect to the internet to view or download it.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </main>
    );
  }

  if (!chapter) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Chapter not found</p>
      </div>
    );
  }

  return (
    <main className="px-4 pt-6 pb-4">
      {/* Header */}
      <header className="flex items-center gap-3">
        <button 
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border"
        >
          <ArrowLeft className="h-5 w-5 text-card-foreground" />
        </button>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{chapter.subjects?.name}</p>
          <h1 className="text-lg font-bold text-foreground line-clamp-1">{chapter.name}</h1>
        </div>
        {/* Download button for offline access - Req 3.1, 3.4 */}
        <DownloadButton chapterId={chapterId!} showDelete />
      </header>

      {/* Progress Overview - Updated to use new status system */}
      <section className="mt-6 rounded-xl bg-card border border-border p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Chapter Progress</p>
            <p className="text-lg font-semibold text-foreground">{chapterProgressInfo.displayText}</p>
          </div>
          <Button onClick={() => navigate(`/practice?chapter=${chapterId}`)}>
            <Play className="mr-2 h-4 w-4" />
            Practice
          </Button>
        </div>
        <Progress value={chapterProgressInfo.progress} className="mt-3 h-2" />
        {chapter.curriculum_ref && (
          <p className="mt-2 text-xs text-muted-foreground">📖 {chapter.curriculum_ref}</p>
        )}
      </section>

      {/* Topics - Updated to use new status system */}
      <section className="mt-6">
        <h2 className="font-semibold text-foreground">Topics ({topics.length})</h2>
        <div className="mt-3 space-y-3">
          {topics.map((topic) => (
            <TopicStatusCard
              key={topic.id}
              topic={topic}
              onLearnClick={() => navigate(`/learn/topic/${topic.id}`)}
              onPracticeClick={() => navigate(`/practice?topic=${topic.id}`)}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
