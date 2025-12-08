import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, Lightbulb, BookOpen, ChevronRight, ChevronLeft, Loader2, RotateCcw, ArrowLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useStudentContext } from '@/contexts/StudentContext';
import { getOfflineQuestions, getOfflineQuestionsByTopic, isChapterDownloaded } from '@/services/offlineService';
import { queueResponse } from '@/services/syncService';
import { 
  getQuestionsForTopic, 
  recordAttempt, 
  getStats,
  Question as PracticeQuestion,
  PracticeStats 
} from '@/services/practiceService';
import { awardQuestionXP, updateStreak } from '@/services/gamificationService';
import { updateMasteryFromPractice } from '@/services/masteryService';
import { XPNotification, useXPNotification, LevelUpNotification, useLevelUpNotification, BadgeNotification, useBadgeNotification } from '@/components/gamification';

interface Question {
  id: string;
  question: string;
  question_type: string;
  options: string[] | null;
  correct_answer: string | null;
  hint: string | null;
  solution: string | null;
  curriculum_ref: string | null;
  difficulty: string;
}

// Component for numerical/short answer questions
function NumericalAnswer({
  question,
  isAnswered,
  showSolution,
  onAnswer,
  onShowSolution,
}: {
  question: Question;
  isAnswered: boolean;
  showSolution: boolean;
  onAnswer: (answer: string, isCorrect: boolean) => void;
  onShowSolution: () => void;
}) {
  const [userAnswer, setUserAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = () => {
    if (!userAnswer.trim()) return;
    
    // Normalize answers for comparison (trim, lowercase, remove extra spaces)
    const normalizedUser = userAnswer.trim().toLowerCase().replace(/\s+/g, ' ');
    const normalizedCorrect = (question.correct_answer || '').trim().toLowerCase().replace(/\s+/g, ' ');
    
    // Check if correct (exact match or numeric equivalence)
    const correct = normalizedUser === normalizedCorrect || 
      (parseFloat(normalizedUser) === parseFloat(normalizedCorrect));
    
    setIsCorrect(correct);
    setSubmitted(true);
    onAnswer(userAnswer, correct);
  };

  if (showSolution && !submitted) {
    // User skipped to solution without answering
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Solution shown - no answer submitted
        </p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className={cn(
        "rounded-lg border p-4",
        isCorrect ? "border-primary bg-primary/10" : "border-destructive bg-destructive/10"
      )}>
        <div className="flex items-center gap-2">
          {isCorrect ? (
            <CheckCircle2 className="h-5 w-5 text-primary" />
          ) : (
            <XCircle className="h-5 w-5 text-destructive" />
          )}
          <span className={cn("font-medium", isCorrect ? "text-primary" : "text-destructive")}>
            {isCorrect ? "Correct!" : "Incorrect"}
          </span>
        </div>
        <p className="mt-2 text-sm">
          Your answer: <span className="font-medium">{userAnswer}</span>
        </p>
        {!isCorrect && question.correct_answer && (
          <p className="mt-1 text-sm">
            Correct answer: <span className="font-medium text-primary">{question.correct_answer}</span>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Enter your answer..."
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <Button onClick={handleSubmit} disabled={!userAnswer.trim()}>
          Submit
        </Button>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Or try solving on paper first, then check the solution
      </p>
    </div>
  );
}

export default function Practice() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const topicId = searchParams.get('topic');
  const chapterId = searchParams.get('chapter');
  const { isOnline } = useNetworkStatus();
  const { profile } = useStudentContext();
  const { notification, showXP, hideXP } = useXPNotification();
  const { levelUp, showLevelUp, hideLevelUp } = useLevelUpNotification();
  const { badge, showBadges, hideBadge } = useBadgeNotification();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [stats, setStats] = useState<PracticeStats | null>(null);
  const [allQuestionsExhausted, setAllQuestionsExhausted] = useState(false);
  const [sessionXP, setSessionXP] = useState(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  const [attemptCounts, setAttemptCounts] = useState<Record<string, number>>({});

  // Convert PracticeQuestion to local Question format
  const convertQuestion = (q: PracticeQuestion): Question => ({
    id: q.id,
    question: q.question,
    question_type: q.questionType,
    options: q.options,
    correct_answer: q.correctAnswer,
    hint: q.hint,
    solution: q.solution,
    curriculum_ref: q.curriculumRef,
    difficulty: q.difficulty,
  });

  useEffect(() => {
    async function fetchQuestions() {
      // If offline, try to load from IndexedDB
      if (!navigator.onLine && chapterId) {
        const downloaded = await isChapterDownloaded(chapterId);
        if (downloaded) {
          let offlineQuestions;
          if (topicId) {
            offlineQuestions = await getOfflineQuestionsByTopic(chapterId, topicId);
          } else {
            offlineQuestions = await getOfflineQuestions(chapterId);
          }
          
          const parsed = offlineQuestions.map(q => ({
            id: q.id,
            question: q.question,
            question_type: q.questionType,
            options: q.options,
            correct_answer: q.correctAnswer,
            hint: q.hint,
            solution: q.solution,
            curriculum_ref: q.curriculumRef,
            difficulty: q.difficulty,
          }));
          setQuestions(parsed);
          setLoading(false);
          return;
        }
      }

      // Online: Use practiceService for smart question ordering
      if (topicId && profile) {
        try {
          const prioritizedQuestions = await getQuestionsForTopic(topicId, profile.id);
          const converted = prioritizedQuestions.map(convertQuestion);
          setQuestions(converted);
          
          // Get stats
          const topicStats = await getStats(topicId, profile.id);
          setStats(topicStats);
          
          // Check if all questions have been correctly answered
          if (topicStats.unattempted === 0 && topicStats.incorrect === 0) {
            setAllQuestionsExhausted(true);
          }
        } catch (error) {
          console.error('Failed to fetch questions:', error);
        }
        setLoading(false);
        return;
      }

      // Fallback: fetch from Supabase directly
      let query = supabase.from('practice_questions').select('*');
      
      if (topicId) {
        query = query.eq('topic_id', topicId);
      } else if (chapterId) {
        const { data: topics } = await supabase
          .from('topics')
          .select('id')
          .eq('chapter_id', chapterId);
        
        if (topics && topics.length > 0) {
          const topicIds = topics.map(t => t.id);
          query = query.in('topic_id', topicIds);
        }
      }
      
      const { data } = await query;
      
      if (data) {
        const parsed = data.map(q => ({
          ...q,
          options: q.options as string[] | null,
        }));
        setQuestions(parsed);
      }
      
      setLoading(false);
    }

    fetchQuestions();
  }, [topicId, chapterId, isOnline, profile]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4">
        <BookOpen className="h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold text-foreground">No Questions Yet</h2>
        <p className="mt-2 text-center text-muted-foreground">
          Practice questions for this topic will be added soon.
        </p>
      </main>
    );
  }

  const question = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isAnswered = selectedAnswer !== null || showSolution;
  const correctCount = Object.values(answers).filter(Boolean).length;

  // Handler for numerical/short answer questions
  const handleNumericalAnswer = async (answer: string, isCorrect: boolean) => {
    setSelectedAnswer(answer);
    setAnswers(prev => ({ ...prev, [question.id]: isCorrect }));
    
    // Track attempts for first-try bonus
    const currentAttempts = attemptCounts[question.id] || 0;
    setAttemptCounts(prev => ({ ...prev, [question.id]: currentAttempts + 1 }));
    const isFirstTry = currentAttempts === 0;

    // Track consecutive wrong answers
    if (isCorrect) {
      setConsecutiveWrong(0);
    } else {
      setConsecutiveWrong(prev => prev + 1);
    }

    // Record attempt using practiceService
    if (profile) {
      try {
        await recordAttempt({
          studentId: profile.id,
          questionId: question.id,
          selectedAnswer: answer,
          isCorrect,
        });

        // Award XP for correct answers
        if (isCorrect) {
          const xpAmount = isFirstTry ? 10 : 5;
          const xpResult = await awardQuestionXP(profile.id, isFirstTry);
          await updateStreak(profile.id);
          setSessionXP(prev => prev + xpAmount);
          showXP(xpAmount, isFirstTry ? 'First try!' : 'Correct!');
          
          // Show level-up celebration if leveled up
          if (xpResult.leveledUp) {
            setTimeout(() => showLevelUp(xpResult.newLevel), 500);
          }
          
          // Show badge notifications if any new badges earned
          if (xpResult.newBadges && xpResult.newBadges.length > 0) {
            const badgeDelay = xpResult.leveledUp ? 1500 : 500;
            setTimeout(() => showBadges(xpResult.newBadges), badgeDelay);
          }

          // Update mastery
          if (topicId) {
            await updateMasteryFromPractice(profile.id, topicId, true);
          }
        } else {
          // Update mastery for wrong answer
          if (topicId) {
            await updateMasteryFromPractice(profile.id, topicId, false);
          }
        }
      } catch (error) {
        console.error('Failed to record attempt:', error);
      }
    }

    // Queue response for sync if offline
    if (!navigator.onLine) {
      await queueResponse(question.id, answer, isCorrect);
    }
  };

  const handleAnswerSelect = async (answer: string) => {
    if (isAnswered) return;
    setSelectedAnswer(answer);
    
    const isCorrect = answer === question.correct_answer;
    setAnswers(prev => ({ ...prev, [question.id]: isCorrect }));

    // Track attempts for first-try bonus
    const currentAttempts = attemptCounts[question.id] || 0;
    setAttemptCounts(prev => ({ ...prev, [question.id]: currentAttempts + 1 }));
    const isFirstTry = currentAttempts === 0;

    // Track consecutive wrong answers
    if (isCorrect) {
      setConsecutiveWrong(0);
    } else {
      setConsecutiveWrong(prev => prev + 1);
    }

    // Record attempt using practiceService
    if (profile) {
      try {
        await recordAttempt({
          studentId: profile.id,
          questionId: question.id,
          selectedAnswer: answer,
          isCorrect,
        });

        // Award XP for correct answers (Requirement 3.2, 3.3)
        if (isCorrect) {
          const xpAmount = isFirstTry ? 10 : 5;
          const xpResult = await awardQuestionXP(profile.id, isFirstTry);
          await updateStreak(profile.id);
          setSessionXP(prev => prev + xpAmount);
          showXP(xpAmount, isFirstTry ? 'First try!' : 'Correct!');
          
          // Show level-up celebration if leveled up
          if (xpResult.leveledUp) {
            setTimeout(() => showLevelUp(xpResult.newLevel), 500);
          }
          
          // Show badge notifications if any new badges earned
          if (xpResult.newBadges && xpResult.newBadges.length > 0) {
            const badgeDelay = xpResult.leveledUp ? 1500 : 500;
            setTimeout(() => showBadges(xpResult.newBadges), badgeDelay);
          }

          // Update mastery (Requirement 6.2)
          if (topicId) {
            await updateMasteryFromPractice(profile.id, topicId, true);
          }
        } else {
          // Update mastery for wrong answer
          if (topicId) {
            await updateMasteryFromPractice(profile.id, topicId, false);
          }
        }
      } catch (error) {
        console.error('Failed to record attempt:', error);
      }
    }

    // Queue response for sync if offline
    if (!navigator.onLine) {
      await queueResponse(question.id, answer, isCorrect);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowHint(false);
      setShowSolution(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowHint(false);
    setShowSolution(false);
    setAnswers({});
    setAllQuestionsExhausted(false);
  };

  return (
    <main className="px-4 pt-6 pb-4">
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

      {/* Review Concept Suggestion (Requirement 7.4) */}
      {consecutiveWrong >= 3 && topicId && (
        <div className="fixed top-4 left-4 right-4 z-50 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg">
          <p className="text-sm text-yellow-800 font-medium">
            💡 Having trouble? Maybe review the concept first.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-2"
            onClick={() => navigate(`/topic/${topicId}`)}
          >
            <BookOpen className="h-4 w-4 mr-1" />
            Review Concept
          </Button>
        </div>
      )}

      {/* Header */}
      <header>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border"
          >
            <ArrowLeft className="h-5 w-5 text-card-foreground" />
          </button>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-foreground">Practice</h1>
              <span className="text-sm font-medium text-primary">
                {currentIndex + 1}/{questions.length}
              </span>
            </div>
            <Progress value={progress} className="mt-2 h-2" />
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="mt-4 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">{correctCount} correct</span>
        </div>
        {sessionXP > 0 && (
          <div className="flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1">
            <span className="text-sm font-medium text-yellow-700">+{sessionXP} XP</span>
          </div>
        )}
        {stats && (
          <div className="text-xs text-muted-foreground">
            {stats.attempted}/{stats.totalQuestions} attempted
          </div>
        )}
      </div>

      {/* All Questions Exhausted Notice */}
      {allQuestionsExhausted && currentIndex === 0 && (
        <Card className="mt-4 border-primary/30 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium text-foreground">Great job!</p>
                <p className="text-sm text-muted-foreground">
                  You've completed all questions. Practice again to reinforce your learning.
                </p>
              </div>
            </div>
            <Button onClick={handleRestart} variant="outline" className="mt-3 w-full">
              <RotateCcw className="mr-2 h-4 w-4" />
              Practice Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Question Card */}
      {(!allQuestionsExhausted || currentIndex > 0 || Object.keys(answers).length > 0) && (
        <Card className="mt-4">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className={cn(
                "rounded-full px-2 py-0.5",
                question.difficulty === 'easy' ? 'bg-chart-2/20 text-chart-2' :
                question.difficulty === 'medium' ? 'bg-chart-4/20 text-chart-4' :
                'bg-destructive/20 text-destructive'
              )}>
                {question.difficulty}
              </span>
              <span>• {question.question_type.toUpperCase()}</span>
            </div>
            <CardTitle className="text-base font-medium leading-relaxed">
              {question.question}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* MCQ Options */}
            {question.question_type === 'mcq' && question.options && (
              <div className="space-y-2">
                {question.options.map((option, index) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrect = option === question.correct_answer;
                  const showResult = isAnswered && isSelected;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={isAnswered}
                      className={cn(
                        "w-full rounded-lg border p-3 text-left transition-all",
                        isSelected && !showResult && "border-primary bg-primary/5",
                        showResult && isCorrect && "border-primary bg-primary/10",
                        showResult && !isCorrect && "border-destructive bg-destructive/10",
                        isAnswered && isCorrect && !isSelected && "border-primary/50 bg-primary/5",
                        !isSelected && !isAnswered && "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{option}</span>
                        {showResult && (
                          isCorrect 
                            ? <CheckCircle2 className="h-5 w-5 text-primary" />
                            : <XCircle className="h-5 w-5 text-destructive" />
                        )}
                        {isAnswered && isCorrect && !isSelected && (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Numerical/Short Answer - with input field */}
            {question.question_type !== 'mcq' && (
              <NumericalAnswer
                question={question}
                isAnswered={isAnswered}
                showSolution={showSolution}
                onAnswer={handleNumericalAnswer}
                onShowSolution={() => setShowSolution(true)}
              />
            )}

            {/* Hint */}
            {showHint && question.hint && (
              <div className="rounded-lg bg-accent p-3">
                <div className="flex items-center gap-2 text-accent-foreground">
                  <Lightbulb className="h-4 w-4" />
                  <span className="text-sm font-medium">Hint</span>
                </div>
                <p className="mt-2 text-sm text-accent-foreground/80">
                  {question.hint}
                </p>
              </div>
            )}

            {/* Solution */}
            {showSolution && question.solution && (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                <div className="flex items-center gap-2 text-primary">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-sm font-medium">Solution</span>
                </div>
                <p className="mt-2 text-sm whitespace-pre-wrap">{question.solution}</p>
                {question.curriculum_ref && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    📖 {question.curriculum_ref}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-2">
              {/* Hint and Solution buttons */}
              <div className="flex gap-2">
                {!showHint && !showSolution && question.hint && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHint(true)}
                    className="flex-1"
                  >
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Show Hint
                  </Button>
                )}
                
                {!showSolution && question.solution && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSolution(true)}
                    className="flex-1"
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Show Solution
                  </Button>
                )}
              </div>
              
              {/* Navigation buttons - always visible */}
              <div className="flex gap-2 mt-2">
                {currentIndex > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentIndex(prev => prev - 1);
                      setSelectedAnswer(null);
                      setShowHint(false);
                      setShowSolution(false);
                    }}
                    className="flex-1"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                )}
                
                {currentIndex < questions.length - 1 && (
                  <Button
                    onClick={handleNext}
                    className="flex-1"
                    variant={isAnswered || showSolution ? "default" : "outline"}
                  >
                    Next Question
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session Complete / Back to Learning */}
      {currentIndex === questions.length - 1 && (isAnswered || showSolution) && (
        <div className="mt-6 space-y-3">
          <div className="rounded-lg bg-primary/10 p-4 text-center">
            <CheckCircle2 className="h-8 w-8 text-primary mx-auto" />
            <h3 className="mt-2 font-semibold text-foreground">Practice Complete! 🎉</h3>
            <p className="text-sm text-muted-foreground">
              You got {correctCount} out of {questions.length} correct
              {sessionXP > 0 && ` and earned ${sessionXP} XP`}
            </p>
          </div>
          
          <Button 
            onClick={handleRestart}
            variant="outline"
            className="w-full"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Practice Again
          </Button>
          
          {topicId && (
            <Button 
              onClick={() => navigate(`/learn/topic/${topicId}`)}
              variant="outline"
              className="w-full"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Back to Learning
            </Button>
          )}
          
          <Button 
            onClick={() => navigate(-1)}
            className="w-full"
          >
            Done
          </Button>
        </div>
      )}
    </main>
  );
}
