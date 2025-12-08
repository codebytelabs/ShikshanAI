import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, BookOpen, Play, CheckCircle2, Loader2, ChevronRight, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudentContext } from '@/contexts/StudentContext';
import { XPNotification, useXPNotification, LevelUpNotification, useLevelUpNotification, BadgeNotification, useBadgeNotification } from '@/components/gamification';
import { awardSectionXP, updateStreak, checkBadges } from '@/services/gamificationService';
import { completeSection as completeLessonSection, getLesson } from '@/services/lessonService';
import { completeConceptLearning } from '@/services/masteryService';
import { getLessonSections, type LessonSectionData, type SectionType } from '@/services/lessonSectionService';
import { getTopicStatusData, getTopicProgressInfo, getEffectiveMinQuestions } from '@/services/topicStatusService';
import { LessonSection, SectionTabs } from '@/components/learn/LessonSection';

interface LessonSectionLocal {
  id: string;
  title: string;
  content: string;
  sectionType?: SectionType;
  example?: string;
  keyPoints?: string[];
  visualDescription?: string;
  ncertRef?: string;
}

interface TopicData {
  id: string;
  name: string;
  chapter: {
    id: string;
    name: string;
    subjects: { name: string };
  };
}

export default function TopicLearn() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { profile } = useStudentContext();
  const { notification, showXP, hideXP } = useXPNotification();
  const { levelUp, showLevelUp, hideLevelUp } = useLevelUpNotification();
  const { badge, showBadges, hideBadge } = useBadgeNotification();
  
  const [topic, setTopic] = useState<TopicData | null>(null);
  const [sections, setSections] = useState<LessonSectionLocal[]>([]);
  const [currentSection, setCurrentSection] = useState(0);
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [isTopicCompleted, setIsTopicCompleted] = useState(false);
  const [topicStatus, setTopicStatus] = useState<'not_started' | 'learning' | 'practice' | 'completed'>('not_started');
  const [questionsAttempted, setQuestionsAttempted] = useState(0);
  const [minQuestionsRequired, setMinQuestionsRequired] = useState(3);
  const [hasNoPracticeQuestions, setHasNoPracticeQuestions] = useState(false);

  useEffect(() => {
    async function fetchTopic() {
      if (!topicId) return;

      const { data } = await supabase
        .from('topics')
        .select(`
          id,
          name,
          chapter:chapters (
            id,
            name,
            subjects (name)
          )
        `)
        .eq('id', topicId)
        .single();

      if (data) {
        setTopic(data as unknown as TopicData);
        // Generate lesson content using AI service
        await generateLessonContent(
          topicId,
          data.name, 
          data.chapter?.name || '',
          data.chapter?.subjects?.name || ''
        );
        
        // Load existing progress from database
        if (profile?.id) {
          await loadExistingProgress(topicId);
        }
      }
      setLoading(false);
    }

    fetchTopic();
  }, [topicId, profile?.id]);

  // Load existing progress from database using new status system
  async function loadExistingProgress(topicId: string) {
    if (!profile?.id) return;
    
    try {
      // Use new status system to get topic progress
      const statusData = await getTopicStatusData(profile.id, topicId);
      const effectiveMinQuestions = getEffectiveMinQuestions(statusData.totalQuestionsAvailable);
      const progressInfo = getTopicProgressInfo({
        sectionsCompleted: statusData.sectionsCompleted,
        totalSections: statusData.totalSections,
        questionsAttempted: statusData.questionsAttempted,
        minQuestionsRequired: effectiveMinQuestions,
      });
      
      setTopicStatus(progressInfo.status);
      setQuestionsAttempted(statusData.questionsAttempted);
      setMinQuestionsRequired(effectiveMinQuestions);
      setHasNoPracticeQuestions(statusData.totalQuestionsAvailable === 0);
      
      // Mark completed sections
      if (statusData.sectionsCompleted > 0) {
        const completed = new Set<number>();
        for (let i = 0; i < statusData.sectionsCompleted; i++) {
          completed.add(i);
        }
        setCompletedSections(completed);
        
        // Set current section to the next uncompleted one
        if (statusData.sectionsCompleted < statusData.totalSections) {
          setCurrentSection(statusData.sectionsCompleted);
        }
      }
      
      // Check if topic is fully completed (lesson + practice)
      if (progressInfo.status === 'completed') {
        setIsTopicCompleted(true);
      }
    } catch (error) {
      console.error('Failed to load existing progress:', error);
    }
  }

  async function generateLessonContent(
    topicId: string,
    topicName: string, 
    chapterName: string,
    subjectName: string
  ) {
    setGenerating(true);
    
    try {
      // First, try to fetch pre-seeded lesson sections from database
      const dbSections = await getLessonSections(topicId);
      
      if (dbSections.length > 0) {
        // Use database content if available
        const convertedSections: LessonSectionLocal[] = dbSections.map((section: LessonSectionData) => ({
          id: section.id,
          title: section.title,
          content: section.content,
          sectionType: section.sectionType,
          ncertRef: section.ncertRef,
          // Don't duplicate content as example - let the component handle section types
          keyPoints: section.sectionType === 'remember' ? extractKeyPoints(section.content) : undefined,
        }));
        setSections(convertedSections);
        setGenerating(false);
        return;
      }
      
      // Fallback: Use the lesson service to generate AI-powered content
      const lesson = await getLesson(topicId, {
        gradeName: profile?.grade_id ? 'Class 10' : 'Student',
        subjectName: subjectName || 'Subject',
        chapterName: chapterName,
        topicName: topicName,
      });
      
      // Convert service sections to component sections
      const generatedSections: LessonSectionLocal[] = lesson.sections.map((section) => ({
        id: section.id,
        title: section.title,
        content: section.content,
        sectionType: 'concept' as SectionType,
        example: section.example,
        visualDescription: section.visualDescription,
        keyPoints: extractKeyPoints(section.content),
      }));
      
      setSections(generatedSections);
    } catch (error) {
      console.error('Failed to generate lesson:', error);
      // Fallback to basic content if AI fails
      const fallbackSections: LessonSectionLocal[] = [
        {
          id: '1',
          title: `Introduction to ${topicName}`,
          sectionType: 'introduction' as SectionType,
          content: `Welcome to the lesson on ${topicName}. This is an important concept in ${chapterName} that you'll use throughout your studies. Let's explore the key ideas together.`,
          example: `Think of ${topicName} as a building block for more advanced concepts.`,
          keyPoints: [
            `${topicName} is a fundamental concept in ${subjectName}`,
            'Understanding this will help you solve many problems',
            'Take your time to understand each part'
          ]
        },
        {
          id: '2', 
          title: 'Key Concepts',
          sectionType: 'concept' as SectionType,
          content: `Now let's dive deeper into the main ideas behind ${topicName}. Pay attention to how each concept connects to what you already know from previous chapters.`,
          example: 'Real-world applications help us understand abstract concepts better.',
          keyPoints: [
            'Break complex problems into smaller parts',
            'Practice with simple examples first',
            'Connect new ideas to what you already know'
          ]
        },
        {
          id: '3',
          title: 'How to Apply It',
          sectionType: 'example' as SectionType,
          content: `Great job learning the basics! Now let's see how to use ${topicName} to solve problems. Remember, practice makes perfect!`,
          example: 'Try solving problems step by step, writing down each step clearly.',
          keyPoints: [
            'Read the problem carefully',
            'Identify what you need to find',
            'Apply the concepts you learned',
            'Check your answer'
          ]
        },
        {
          id: '4',
          title: 'Summary & Next Steps',
          sectionType: 'summary' as SectionType,
          content: `Excellent! You've learned the basics of ${topicName}. Now you're ready to practice what you've learned. Remember, making mistakes is part of learning!`,
          keyPoints: [
            `You now understand ${topicName}`,
            'Practice will help you master it',
            'Don\'t be afraid to ask for help'
          ]
        }
      ];
      setSections(fallbackSections);
    }
    
    setGenerating(false);
  }
  
  // Helper to extract key points from content
  function extractKeyPoints(content: string): string[] {
    // Try to extract bullet points or numbered items
    const lines = content.split('\n').filter(line => line.trim());
    const bulletPoints = lines.filter(line => 
      line.trim().startsWith('-') || 
      line.trim().startsWith('•') ||
      /^\d+\./.test(line.trim())
    );
    
    if (bulletPoints.length >= 2) {
      return bulletPoints.slice(0, 4).map(p => p.replace(/^[-•\d.]+\s*/, '').trim());
    }
    
    // If no bullet points, return generic key points
    return [
      'Pay attention to the main concepts',
      'Practice with examples',
      'Review if needed'
    ];
  }

  const handleSectionComplete = async () => {
    // Don't award XP if topic is already completed (reviewing)
    const isReviewing = isTopicCompleted;
    
    setCompletedSections(prev => new Set([...prev, currentSection]));
    
    // Award XP for section completion only if not reviewing
    if (profile?.id && topicId && !isReviewing) {
      try {
        const xpResult = await awardSectionXP(profile.id);
        await completeLessonSection(profile.id, topicId, sections.length);
        await updateStreak(profile.id);
        showXP(10, 'Section complete!');
        
        // Show level-up celebration if leveled up
        if (xpResult.leveledUp) {
          // Small delay so XP notification shows first
          setTimeout(() => showLevelUp(xpResult.newLevel), 500);
        }
        
        // Show badge notifications if any new badges earned
        if (xpResult.newBadges && xpResult.newBadges.length > 0) {
          // Delay badges to show after level-up if applicable
          const badgeDelay = xpResult.leveledUp ? 1500 : 500;
          setTimeout(() => showBadges(xpResult.newBadges), badgeDelay);
        }
        
        // If all sections completed, also complete concept learning and refresh status
        if (currentSection === sections.length - 1) {
          await completeConceptLearning(profile.id, topicId);
          
          // Small delay to ensure database is updated
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Refresh topic status to get updated completion state
          const statusData = await getTopicStatusData(profile.id, topicId);
          const effectiveMinQuestions = getEffectiveMinQuestions(statusData.totalQuestionsAvailable);
          const progressInfo = getTopicProgressInfo({
            sectionsCompleted: statusData.sectionsCompleted,
            totalSections: statusData.totalSections,
            questionsAttempted: statusData.questionsAttempted,
            minQuestionsRequired: effectiveMinQuestions,
          });
          
          setTopicStatus(progressInfo.status);
          setHasNoPracticeQuestions(statusData.totalQuestionsAvailable === 0);
          setMinQuestionsRequired(effectiveMinQuestions);
          
          // Mark as completed if status is completed (e.g., no practice questions needed)
          if (progressInfo.status === 'completed') {
            setIsTopicCompleted(true);
            
            // Check for topic completion badges (first_topic, completion milestones)
            try {
              // Count completed topics for this student (use any cast for untyped table)
              const { data: completedTopics } = await (supabase as any)
                .from('student_topic_learning')
                .select('id')
                .eq('student_id', profile.id)
                .eq('concept_completed', true);
              
              const topicsCompleted = completedTopics?.length || 1;
              const topicBadges = await checkBadges(profile.id, { topicsCompleted });
              
              if (topicBadges.length > 0) {
                setTimeout(() => showBadges(topicBadges), 1000);
              }
            } catch (badgeError) {
              console.error('Failed to check topic badges:', badgeError);
            }
          }
        }
      } catch (error) {
        console.error('Failed to award XP:', error);
      }
    } else if (isReviewing) {
      // Just update streak for reviewing
      if (profile?.id) {
        await updateStreak(profile.id);
      }
    }
    
    if (currentSection < sections.length - 1) {
      setCurrentSection(prev => prev + 1);
    }
  };

  const allSectionsCompleted = completedSections.size === sections.length;
  const progress = sections.length > 0 ? (completedSections.size / sections.length) * 100 : 0;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <BookOpen className="h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold">Topic not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  const currentSectionData = sections[currentSection];

  return (
    <main className="px-4 pt-6 pb-24">
      {/* XP Notification */}
      {notification && (
        <XPNotification
          amount={notification.amount}
          reason={notification.reason}
          onDismiss={hideXP}
        />
      )}
      
      {/* Level Up Celebration */}
      {levelUp && (
        <LevelUpNotification
          newLevel={levelUp}
          onDismiss={hideLevelUp}
        />
      )}
      
      {/* Badge Earned Celebration */}
      {badge && (
        <BadgeNotification
          badge={badge}
          onDismiss={hideBadge}
        />
      )}
      
      {/* Header */}
      <header className="flex items-center gap-3">
        <button 
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border"
        >
          <ArrowLeft className="h-5 w-5 text-card-foreground" />
        </button>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{topic.chapter?.subjects?.name}</p>
          <h1 className="text-lg font-bold text-foreground line-clamp-1">{topic.name}</h1>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Learning Progress</span>
          <span className="font-medium text-primary">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Learning Path Indicator */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <div className={cn(
          "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium",
          "bg-primary text-primary-foreground"
        )}>
          <BookOpen className="h-3 w-3" />
          Learn
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <div className={cn(
          "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium",
          allSectionsCompleted ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
        )}>
          <Play className="h-3 w-3" />
          Practice
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <div className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
          <GraduationCap className="h-3 w-3" />
          Test
        </div>
      </div>

      {/* Section Navigation */}
      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        {sections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => setCurrentSection(index)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors",
              currentSection === index
                ? "bg-primary text-primary-foreground"
                : completedSections.has(index)
                ? "bg-primary/20 text-primary"
                : "bg-card border border-border text-card-foreground"
            )}
          >
            {completedSections.has(index) && <CheckCircle2 className="h-4 w-4" />}
            <span>{index + 1}. {section.title}</span>
          </button>
        ))}
      </div>

      {/* Current Section Content */}
      {generating ? (
        <Card className="mt-6">
          <CardContent className="py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">Preparing your lesson...</p>
          </CardContent>
        </Card>
      ) : currentSectionData ? (
        <div className="mt-6">
          <LessonSection
            title={currentSectionData.title}
            content={currentSectionData.content}
            sectionType={currentSectionData.sectionType}
            example={currentSectionData.example}
            keyPoints={currentSectionData.keyPoints}
            ncertRef={currentSectionData.ncertRef}
            isCompleted={completedSections.has(currentSection)}
            isLast={currentSection === sections.length - 1}
            onComplete={handleSectionComplete}
            onNext={() => setCurrentSection(prev => prev + 1)}
            xpReward={isTopicCompleted ? 0 : 10}
          />
        </div>
      ) : null}

      {/* Action Buttons - Updated with new status messages */}
      {allSectionsCompleted && (
        <div className="mt-6 space-y-3">
          {/* Show different messages based on topic status */}
          {topicStatus === 'completed' ? (
            // Topic fully completed (lesson + 3+ practice questions)
            <div className="rounded-lg bg-green-100 p-4 text-center">
              <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto" />
              <h3 className="mt-2 font-semibold text-green-800">Topic Completed! 🎉</h3>
              <p className="text-sm text-green-700">You've mastered the basics of this topic.</p>
            </div>
          ) : topicStatus === 'practice' && !hasNoPracticeQuestions ? (
            // Lesson done, needs practice (only show if there are practice questions)
            <div className="rounded-lg bg-orange-100 p-4 text-center">
              <Play className="h-8 w-8 text-orange-600 mx-auto" />
              <h3 className="mt-2 font-semibold text-orange-800">Now practice to complete this topic!</h3>
              <p className="text-sm text-orange-700">
                {(() => {
                  const remaining = Math.max(0, minQuestionsRequired - questionsAttempted);
                  return remaining > 0 
                    ? `Answer ${remaining} more question${remaining !== 1 ? 's' : ''} to complete this topic.`
                    : 'Complete the practice to finish this topic.';
                })()}
              </p>
            </div>
          ) : hasNoPracticeQuestions ? (
            // No practice questions available - lesson completion is enough
            <div className="rounded-lg bg-green-100 p-4 text-center">
              <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto" />
              <h3 className="mt-2 font-semibold text-green-800">Topic Completed! 🎉</h3>
              <p className="text-sm text-green-700">You've completed all the learning content for this topic.</p>
            </div>
          ) : (
            // Default: lesson just completed, practice available
            <div className="rounded-lg bg-primary/10 p-4 text-center">
              <CheckCircle2 className="h-8 w-8 text-primary mx-auto" />
              <h3 className="mt-2 font-semibold text-foreground">Great job! 🎉</h3>
              <p className="text-sm text-muted-foreground">You've completed the lesson. Practice to complete this topic!</p>
            </div>
          )}
          
          {topicStatus !== 'completed' && !hasNoPracticeQuestions && (
            <Button 
              onClick={() => navigate(`/practice?topic=${topicId}`)}
              className="w-full"
              size="lg"
            >
              <Play className="mr-2 h-5 w-5" />
              {topicStatus === 'practice' ? 'Continue Practice' : 'Start Practice'}
            </Button>
          )}
          
          <Button 
            variant="outline"
            onClick={() => navigate(-1)}
            className="w-full"
          >
            Back to Chapter
          </Button>
        </div>
      )}

      {/* Locked Practice Notice */}
      {!allSectionsCompleted && (
        <div className="mt-6 rounded-lg border border-dashed border-border p-4 text-center">
          <p className="text-sm text-muted-foreground">
            🔒 Complete all sections to unlock Practice mode
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {completedSections.size}/{sections.length} sections completed
          </p>
        </div>
      )}
    </main>
  );
}
