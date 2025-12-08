import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  CheckCircle2, XCircle, Lightbulb, BookOpen, ChevronRight, 
  ChevronLeft, Loader2, RotateCcw, ArrowLeft, Flame, Zap,
  Trophy, Star, Sparkles
} from 'lucide-react';
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

// Difficulty colors
const difficultyStyles = {
  easy: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Easy' },
  medium: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Medium' },
  hard: { bg: 'bg-red-100', text: 'text-red-700', label: 'Hard' },
};

// Numerical Answer Component
function NumericalAnswer({
  question,
  showSolution,
  onAnswer,
}: {
  question: Question;
  showSolution: boolean;
  onAnswer: (answer: string, isCorrect: boolean) => void;
}) {
  const [userAnswer, setUserAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = () => {
    if (!userAnswer.trim()) return;
    
    const normalizedUser = userAnswer.trim().toLowerCase().replace(/\s+/g, ' ');
    const normalizedCorrect = (question.correct_answer || '').trim().toLowerCase().replace(/\s+/g, ' ');
    
    const correct = normalizedUser === normalizedCorrect || 
      (parseFloat(normalizedUser) === parseFloat(normalizedCorrect));
    
    setIsCorrect(correct);
    setSubmitted(true);
    onAnswer(userAnswer, correct);
  };

  if (showSolution && !submitted) {
    return (
      <div className="rounded-xl border-2 border-dashed border-muted bg-muted/30 p-4 text-center">
        <p className="text-sm text-muted-foreground">Solution shown - no answer submitted</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className={cn(
        "rounded-xl border-2 p-4",
        isCorrect 
          ? "border-emerald-300 bg-emerald-50" 
          : "border-red-300 bg-red-50"
      )}>
        <div className="flex items-center gap-2">
          {isCorrect ? (
            <>
              <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-emerald-700">Correct! 🎉</span>
            </>
          ) : (
            <>
              <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-red-700">Not quite right</span>
            </>
          )}
        </div>
        <p className="mt-3 text-sm">
          Your answer: <span className="font-medium">{userAnswer}</span>
        </p>
        {!isCorrect && question.correct_answer && (
          <p className="mt-1 text-sm">
            Correct answer: <span className="font-semibold text-emerald-600">{question.correct_answer}</span>
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
          className="flex-1 rounded-xl border-2 border-border bg-background px-4 py-3 text-base focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <Button 
          onClick={handleSubmit} 
          disabled={!userAnswer.trim()}
          className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 hover:from-indigo-700 hover:to-purple-700"
        >
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
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  const [attemptCounts, setAttemptCounts] = useState<Record<string, number>>({});

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
      if (!navigator.onLine && chapterId) {
        const downloaded = await isChapterDownloaded(chapterId);
        if (downloaded) {
          let offlineQuestions: Question[];
          if (topicId) {
            offlineQuestions = (await getOfflineQuestionsByTopic(chapterId, topicId)).map((q: PracticeQuestion) => convertQuestion(q));
          } else {
            offlineQuestions = (await getOfflineQuestions(chapterId)).map((q: PracticeQuestion) => convertQuestion(q));
          }
          setQuestions(offlineQuestions);
          setLoading(false);
          return;
        }
      }

      if (topicId && profile) {
        try {
          const prioritizedQuestions = await getQuestionsForTopic(topicId, profile.id);
          const converted = prioritizedQuestions.map(convertQuestion);
          setQuestions(converted);
          
          const topicStats = await getStats(topicId, profile.id);
          setStats(topicStats);
          
          if (topicStats.unattempted === 0 && topicStats.incorrect === 0) {
            setAllQuestionsExhausted(true);
          }
        } catch (error) {
          console.error('Failed to fetch questions:', error);
        }
        setLoading(false);
        return;
      }

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

  const handleAnswer = async (answer: string, isCorrect: boolean) => {
    setSelectedAnswer(answer);
    setAnswers(prev => ({ ...prev, [questions[currentIndex].id]: isCorrect }));
    
    const currentAttempts = attemptCounts[questions[currentIndex].id] || 0;
    setAttemptCounts(prev => ({ ...prev, [questions[currentIndex].id]: currentAttempts + 1 }));
    const isFirstTry = currentAttempts === 0;

    if (isCorrect) {
      setConsecutiveCorrect(prev => prev + 1);
      setConsecutiveWrong(0);
    } else {
      setConsecutiveWrong(prev => prev + 1);
      setConsecutiveCorrect(0);
    }

    if (profile) {
      try {
        await recordAttempt({
          studentId: profile.id,
          questionId: questions[currentIndex].id,
          selectedAnswer: answer,
          isCorrect,
        });

        if (isCorrect) {
          const xpAmount = isFirstTry ? 10 : 5;
          const xpResult = await awardQuestionXP(profile.id, isFirstTry);
          await updateStreak(profile.id);
          setSessionXP(prev => prev + xpAmount);
          showXP(xpAmount, isFirstTry ? 'First try!' : 'Correct!');
          
          if (xpResult.leveledUp) {
            setTimeout(() => showLevelUp(xpResult.newLevel), 500);
          }
          
          if (xpResult.newBadges && xpResult.newBadges.length > 0) {
            const badgeDelay = xpResult.leveledUp ? 1500 : 500;
            setTimeout(() => showBadges(xpResult.newBadges), badgeDelay);
          }

          if (topicId) {
            await updateMasteryFromPractice(profile.id, topicId, true);
          }
        } else {
          if (topicId) {
            await updateMasteryFromPractice(profile.id, topicId, false);
          }
        }
      } catch (error) {
        console.error('Failed to record attempt:', error);
      }
    }

    if (!navigator.onLine) {
      await queueResponse(questions[currentIndex].id, answer, isCorrect);
    }
  };

  const handleAnswerSelect = async (answer: string) => {
    if (selectedAnswer !== null || showSolution) return;
    const isCorrect = answer === questions[currentIndex].correct_answer;
    await handleAnswer(answer, isCorrect);
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
    setConsecutiveCorrect(0);
    setConsecutiveWrong(0);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 bg-background">
        <div className="bg-muted/50 p-6 rounded-3xl">
          <BookOpen className="h-16 w-16 text-muted-foreground" />
        </div>
        <h2 className="mt-6 text-xl font-bold text-foreground font-display">No Questions Yet</h2>
        <p className="mt-2 text-center text-muted-foreground">
          Practice questions for this topic will be added soon.
        </p>
        <Button onClick={() => navigate(-1)} className="mt-6">
          Go Back
        </Button>
      </main>
    );
  }

  const question = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isAnswered = selectedAnswer !== null || showSolution;
  const correctCount = Object.values(answers).filter(Boolean).length;
  const diffStyle = difficultyStyles[question.difficulty as keyof typeof difficultyStyles] || difficultyStyles.medium;

  return (
    <main className="min-h-screen bg-background pb-24">
      {/* Notifications */}
      {notification && <XPNotification amount={notification.amount} reason={notification.reason} onDismiss={hideXP} />}
      {levelUp && <LevelUpNotification newLevel={levelUp} onDismiss={hideLevelUp} />}
      {badge && <BadgeNotification badge={badge} onDismiss={hideBadge} />}

      {/* Review Suggestion */}
      {consecutiveWrong >= 3 && topicId && (
        <div className="fixed top-4 left-4 right-4 z-50 bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-lg animate-slide-up">
          <p className="text-sm text-amber-800 font-medium flex items-center gap-2">
            <Lightbulb className="h-4 w-4" /> Having trouble? Maybe review the concept first.
          </p>
          <Button size="sm" variant="outline" className="mt-2" onClick={() => navigate(`/topic/${topicId}`)}>
            <BookOpen className="h-4 w-4 mr-1" /> Review Concept
          </Button>
        </div>
      )}

      {/* Header */}
      <header className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-card border border-border hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-foreground font-display">Practice</h1>
              <span className="text-sm font-semibold text-indigo-600">
                {currentIndex + 1}/{questions.length}
              </span>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4 h-2.5 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* Stats Bar */}
      <div className="px-4 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span className="text-sm font-semibold text-emerald-700">{correctCount} correct</span>
        </div>
        
        {sessionXP > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5">
            <Star className="h-4 w-4 text-amber-600 fill-amber-600" />
            <span className="text-sm font-semibold text-amber-700">+{sessionXP} XP</span>
          </div>
        )}
        
        {consecutiveCorrect >= 3 && (
          <div className="flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1.5 animate-pulse">
            <Flame className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-semibold text-orange-700">{consecutiveCorrect} streak!</span>
          </div>
        )}
      </div>

      {/* Question Card */}
      <section className="px-4 mt-4">
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          {/* Question Header */}
          <div className="px-5 py-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", diffStyle.bg, diffStyle.text)}>
                {diffStyle.label}
              </span>
              <span className="text-xs text-muted-foreground">• {question.question_type.toUpperCase()}</span>
            </div>
          </div>
          
          {/* Question Content */}
          <div className="p-5">
            <p className="text-lg font-medium text-foreground leading-relaxed">
              {question.question}
            </p>
            
            {/* MCQ Options */}
            {question.question_type === 'mcq' && question.options && (
              <div className="mt-5 space-y-2.5">
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
                        "w-full rounded-xl border-2 p-4 text-left transition-all",
                        !isAnswered && "hover:border-indigo-300 hover:bg-indigo-50/50",
                        isSelected && !showResult && "border-indigo-500 bg-indigo-50",
                        showResult && isCorrect && "border-emerald-500 bg-emerald-50",
                        showResult && !isCorrect && "border-red-500 bg-red-50",
                        isAnswered && isCorrect && !isSelected && "border-emerald-300 bg-emerald-50/50",
                        !isSelected && !isAnswered && "border-border"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{option}</span>
                        {showResult && (
                          isCorrect 
                            ? <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                            : <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        {isAnswered && isCorrect && !isSelected && (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Numerical Answer */}
            {question.question_type !== 'mcq' && (
              <div className="mt-5">
                <NumericalAnswer
                  question={question}
                  showSolution={showSolution}
                  onAnswer={handleAnswer}
                />
              </div>
            )}

            {/* Hint */}
            {showHint && question.hint && (
              <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-4">
                <div className="flex items-center gap-2 text-amber-700">
                  <Lightbulb className="h-4 w-4" />
                  <span className="text-sm font-semibold">Hint</span>
                </div>
                <p className="mt-2 text-sm text-amber-800">{question.hint}</p>
              </div>
            )}

            {/* Solution */}
            {showSolution && question.solution && (
              <div className="mt-4 rounded-xl bg-indigo-50 border border-indigo-200 p-4">
                <div className="flex items-center gap-2 text-indigo-700">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-sm font-semibold">Solution</span>
                </div>
                <p className="mt-2 text-sm text-indigo-900 whitespace-pre-wrap">{question.solution}</p>
                {question.curriculum_ref && (
                  <p className="mt-3 text-xs text-indigo-600">📖 {question.curriculum_ref}</p>
                )}
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="px-5 pb-5 space-y-3">
            <div className="flex gap-2">
              {!showHint && !showSolution && question.hint && (
                <Button variant="outline" size="sm" onClick={() => setShowHint(true)} className="flex-1 rounded-xl">
                  <Lightbulb className="mr-2 h-4 w-4" /> Show Hint
                </Button>
              )}
              {!showSolution && question.solution && (
                <Button variant="outline" size="sm" onClick={() => setShowSolution(true)} className="flex-1 rounded-xl">
                  <BookOpen className="mr-2 h-4 w-4" /> Show Solution
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              {currentIndex > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentIndex(prev => prev - 1);
                    setSelectedAnswer(null);
                    setShowHint(false);
                    setShowSolution(false);
                  }}
                  className="flex-1 rounded-xl"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
              )}
              
              {currentIndex < questions.length - 1 && (
                <Button
                  onClick={handleNext}
                  className={cn(
                    "flex-1 rounded-xl",
                    isAnswered 
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700" 
                      : ""
                  )}
                  variant={isAnswered ? "default" : "outline"}
                >
                  Next Question <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Session Complete */}
      {currentIndex === questions.length - 1 && isAnswered && (
        <section className="px-4 mt-6 space-y-3">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white text-center">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center mx-auto">
              <Trophy className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-xl font-bold font-display">Practice Complete! 🎉</h3>
            <p className="mt-2 text-white/80">
              You got {correctCount} out of {questions.length} correct
              {sessionXP > 0 && ` and earned ${sessionXP} XP`}
            </p>
          </div>
          
          <Button onClick={handleRestart} variant="outline" className="w-full rounded-xl">
            <RotateCcw className="mr-2 h-4 w-4" /> Practice Again
          </Button>
          
          <Button onClick={() => navigate(-1)} className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600">
            Done
          </Button>
        </section>
      )}
    </main>
  );
}
