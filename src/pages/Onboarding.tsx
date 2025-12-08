import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCurriculum, useSubjects } from '@/hooks/useCurriculum';
import { useStudentContext } from '@/contexts/StudentContext';
import { cn } from '@/lib/utils';
import { BookOpen, ChevronRight, GraduationCap, Loader2, Target, Clock } from 'lucide-react';
import { setDailyGoal } from '@/services/gamificationService';

export default function Onboarding() {
  const navigate = useNavigate();
  const { createProfile } = useStudentContext();
  const { grades, loading: gradesLoading, error: gradesError } = useCurriculum();
  
  const [step, setStep] = useState<'grade' | 'subjects' | 'goal'>('grade');
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<15 | 30 | 60>(30);
  const [submitting, setSubmitting] = useState(false);

  const { subjects, loading: subjectsLoading } = useSubjects(selectedGrade);

  const handleGradeSelect = (gradeId: string) => {
    setSelectedGrade(gradeId);
    setSelectedSubjects([]);
    setStep('subjects');
  };

  const handleSubjectToggle = (subjectId: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleSubjectsComplete = () => {
    if (selectedSubjects.length === 0) return;
    setStep('goal');
  };

  const handleComplete = async () => {
    if (!selectedGrade || selectedSubjects.length === 0) return;
    
    setSubmitting(true);
    const result = await createProfile(selectedGrade, selectedSubjects);
    
    if (result.success) {
      // Daily goal will be set when gamification data is first accessed
      // The default is 30 minutes which matches our selectedGoal default
      navigate('/', { replace: true });
    }
    setSubmitting(false);
  };

  const selectedGradeData = grades.find(g => g.id === selectedGrade);

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
          <GraduationCap className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-foreground">Welcome to Vidya AI</h1>
        <p className="mt-2 text-muted-foreground">
          Your CBSE tutor for Class 9-10
        </p>
      </div>

      {/* Step Indicator */}
      <div className="mx-auto mt-8 flex max-w-xs items-center justify-center gap-2">
        <div className={cn(
          "h-2 flex-1 rounded-full transition-colors",
          step === 'grade' ? "bg-primary" : "bg-primary"
        )} />
        <div className={cn(
          "h-2 flex-1 rounded-full transition-colors",
          step === 'subjects' ? "bg-primary" : "bg-muted"
        )} />
      </div>

      {/* Content */}
      <div className="mx-auto mt-8 max-w-md">
        {step === 'grade' && (
          <div className="space-y-4">
            <h2 className="text-center text-lg font-semibold text-foreground">
              Which class are you in?
            </h2>
            
            {gradesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : gradesError ? (
              <div className="rounded-lg bg-destructive/10 p-4 text-center">
                <p className="text-sm text-destructive">Failed to load grades</p>
                <p className="mt-1 text-xs text-muted-foreground">{gradesError}</p>
              </div>
            ) : grades.length === 0 ? (
              <div className="rounded-lg bg-amber-500/10 p-4 text-center">
                <p className="text-sm text-amber-600">No grades found</p>
                <p className="mt-1 text-xs text-muted-foreground">Please run the database migration to seed data</p>
              </div>
            ) : (
              <div className="space-y-3">
                {grades.map((grade) => (
                  <Card
                    key={grade.id}
                    onClick={() => handleGradeSelect(grade.id)}
                    className="flex cursor-pointer items-center justify-between p-4 transition-all hover:border-primary hover:shadow-md active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl font-bold text-primary">
                        {grade.number}
                      </div>
                      <div>
                        <p className="font-semibold text-card-foreground">{grade.name}</p>
                        <p className="text-sm text-muted-foreground">CBSE Board</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 'subjects' && (
          <div className="space-y-4">
            <div className="text-center">
              <button 
                onClick={() => setStep('grade')}
                className="text-sm text-primary"
              >
                ← Change class
              </button>
              <h2 className="mt-2 text-lg font-semibold text-foreground">
                {selectedGradeData?.name} - Select your subjects
              </h2>
              <p className="text-sm text-muted-foreground">
                Choose one or both
              </p>
            </div>
            
            {subjectsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-3">
                {subjects.map((subject) => {
                  const isSelected = selectedSubjects.includes(subject.id);
                  return (
                    <Card
                      key={subject.id}
                      onClick={() => handleSubjectToggle(subject.id)}
                      className={cn(
                        "flex cursor-pointer items-center gap-4 p-4 transition-all active:scale-[0.98]",
                        isSelected 
                          ? "border-primary bg-primary/5 shadow-md" 
                          : "hover:border-primary/50"
                      )}
                    >
                      <div className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl text-2xl",
                        isSelected ? "bg-primary/20" : "bg-muted"
                      )}>
                        {subject.icon || '📚'}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-card-foreground">{subject.name}</p>
                        <p className="text-sm text-muted-foreground">CBSE Curriculum</p>
                      </div>
                      <div className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors",
                        isSelected 
                          ? "border-primary bg-primary" 
                          : "border-muted-foreground"
                      )}>
                        {isSelected && (
                          <svg className="h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            <Button
              onClick={handleSubjectsComplete}
              disabled={selectedSubjects.length === 0}
              className="mt-6 w-full"
              size="lg"
            >
              <ChevronRight className="mr-2 h-4 w-4" />
              Continue
            </Button>
          </div>
        )}

        {step === 'goal' && (
          <div className="space-y-4">
            <div className="text-center">
              <button 
                onClick={() => setStep('subjects')}
                className="text-sm text-primary"
              >
                ← Change subjects
              </button>
              <h2 className="mt-2 text-lg font-semibold text-foreground">
                Set your daily goal
              </h2>
              <p className="text-sm text-muted-foreground">
                How much time can you dedicate to learning each day?
              </p>
            </div>
            
            <div className="space-y-3">
              {([15, 30, 60] as const).map((minutes) => {
                const isSelected = selectedGoal === minutes;
                const labels = {
                  15: { title: 'Light', desc: 'Perfect for busy days' },
                  30: { title: 'Regular', desc: 'Recommended for steady progress' },
                  60: { title: 'Intensive', desc: 'For serious learners' },
                };
                return (
                  <Card
                    key={minutes}
                    onClick={() => setSelectedGoal(minutes)}
                    className={cn(
                      "flex cursor-pointer items-center gap-4 p-4 transition-all active:scale-[0.98]",
                      isSelected 
                        ? "border-primary bg-primary/5 shadow-md" 
                        : "hover:border-primary/50"
                    )}
                  >
                    <div className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl",
                      isSelected ? "bg-primary/20" : "bg-muted"
                    )}>
                      <Clock className={cn("h-6 w-6", isSelected ? "text-primary" : "text-muted-foreground")} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-card-foreground">{minutes} minutes</p>
                      <p className="text-sm text-muted-foreground">{labels[minutes].title} - {labels[minutes].desc}</p>
                    </div>
                    <div className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors",
                      isSelected 
                        ? "border-primary bg-primary" 
                        : "border-muted-foreground"
                    )}>
                      {isSelected && (
                        <svg className="h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>

            <Button
              onClick={handleComplete}
              disabled={submitting}
              className="mt-6 w-full"
              size="lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  <Target className="mr-2 h-4 w-4" />
                  Start Learning
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
