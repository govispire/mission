import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Zap, Flame, CheckCircle, Calendar, Sparkles, Target, ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import QuizAttempt, { QuizResult } from '@/components/student/quiz/QuizAttempt';
import StreakRewards from '@/components/student/quiz/StreakRewards';
import SmartRecommendations from '@/components/student/quiz/SmartRecommendations';
import Leaderboard from '@/components/student/quiz/Leaderboard';
import QuizCard from '@/components/student/quiz/QuizCard';
import { getQuestionsForQuiz } from '@/data/quizQuestionsData';
import { dailyQuizzes, DailyQuiz } from '@/data/dailyQuizzesData';
import {
  getQuizCompletions,
  saveQuizCompletion,
  calculateStreakData,
  identifyWeakAreas,
  getOverallStatistics,
  QuizCompletion
} from '@/utils/quizAnalytics';
import {
  getLeaderboardData,
  calculateUserScore,
  LeaderboardPeriod
} from '@/services/leaderboardService';

interface Quiz extends DailyQuiz {
  completed: boolean;
  score?: number;
}

const DailyQuizzes = () => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<LeaderboardPeriod>('daily');

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Get unique dates from quizzes for date selector (last 30 days + today + next 7 days)
  const availableDates = Array.from(new Set(dailyQuizzes.map(q => q.scheduledDate)))
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 38);

  // Load quiz completions and calculate analytics
  const [quizzes, setQuizzes] = useState<Quiz[]>(() => {
    const completions = getQuizCompletions();
    return dailyQuizzes.map(q => ({
      ...q,
      completed: !!completions[q.id],
      score: completions[q.id]?.score
    }));
  });

  const [streakData, setStreakData] = useState(() => calculateStreakData());
  const [weakAreas, setWeakAreas] = useState(() => {
    const completions = getQuizCompletions();
    return identifyWeakAreas(completions);
  });

  const stats = getOverallStatistics();

  // Calculate leaderboard
  const completions = getQuizCompletions();
  const userScore = calculateUserScore(Object.values(completions));
  const leaderboard = getLeaderboardData(
    leaderboardPeriod,
    userScore,
    streakData.currentStreak,
    streakData.totalQuizzesCompleted
  );

  const subjects = ['all', 'Quantitative Aptitude', 'Reasoning', 'English', 'General Awareness', 'Current Affairs'];

  const filteredQuizzes = quizzes.filter(q =>
    q.scheduledDate === selectedDate &&
    (selectedSubject === 'all' || q.subject === selectedSubject)
  );

  const completedSelected = quizzes.filter(q => q.scheduledDate === selectedDate && q.completed).length;
  const totalSelected = quizzes.filter(q => q.scheduledDate === selectedDate && !q.isLocked).length;

  const handleStartQuiz = (quiz: Quiz) => {
    if (quiz.isLocked) {
      toast.error('This quiz is locked!', {
        description: 'Complete more quizzes to unlock this one.'
      });
      return;
    }

    if (quiz.scheduledDate > todayStr) {
      toast.error('This quiz is scheduled for the future!', {
        description: `This quiz will be available on ${new Date(quiz.scheduledDate).toLocaleDateString()}.`
      });
      return;
    }

    setActiveQuiz(quiz);
  };

  const handleQuizComplete = (result: QuizResult) => {
    // Create quiz completion record
    const completion: QuizCompletion = {
      quizId: result.quizId,
      completed: true,
      score: result.score,
      accuracy: (result.correctAnswers / result.totalQuestions) * 100,
      timeSpent: result.timeSpent,
      correctAnswers: result.correctAnswers,
      totalQuestions: result.totalQuestions,
      date: new Date().toISOString(),
      subject: activeQuiz?.subject || '',
      topic: activeQuiz?.title || '',
      answers: [] // In a real app, this would contain detailed answer data
    };

    saveQuizCompletion(completion);

    // Update presence
    const today = new Date().toISOString().split('T')[0];
    const presenceData = JSON.parse(localStorage.getItem('studentPresence') || '{}');
    presenceData[today] = true;
    localStorage.setItem('studentPresence', JSON.stringify(presenceData));

    // Update quiz completion status
    setQuizzes(prev => prev.map(q =>
      q.id === result.quizId
        ? { ...q, completed: true, score: result.score }
        : q
    ));

    // Recalculate analytics
    const newStreakData = calculateStreakData();
    setStreakData(newStreakData);

    const allCompletions = getQuizCompletions();
    setWeakAreas(identifyWeakAreas(allCompletions));

    // Show completion toast
    toast.success(`🎉 Quiz completed! Score: ${result.score}%`, {
      description: `${result.correctAnswers}/${result.totalQuestions} correct answers`
    });

    // Check for streak milestone
    if (newStreakData.currentStreak > streakData.currentStreak) {
      const milestones = [3, 7, 14, 30, 60];
      if (milestones.includes(newStreakData.currentStreak)) {
        toast.success(`🔥 ${newStreakData.currentStreak} Day Streak Achieved!`, {
          description: 'Keep up the great work!'
        });
      }
    }
  };

  const handleClaimReward = (rewardId: string) => {
    console.log('Claiming reward:', rewardId);
  };

  // Show quiz attempt interface if a quiz is active
  if (activeQuiz) {
    const questions = getQuestionsForQuiz(activeQuiz.subject, activeQuiz.questions);

    return (
      <div>
        <Button
          variant="ghost"
          className="m-4"
          onClick={() => setActiveQuiz(null)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Quizzes
        </Button>
        <QuizAttempt
          quizId={activeQuiz.id}
          quizTitle={activeQuiz.title}
          subject={activeQuiz.subject}
          duration={activeQuiz.duration}
          questions={questions}
          onComplete={handleQuizComplete}
          onExit={() => setActiveQuiz(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            <Zap className="h-7 w-7 text-primary" />
            Daily Free Quizzes
          </h1>
          <p className="text-muted-foreground mt-2">
            Practice daily to boost your exam preparation
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Card className="px-5 py-3 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/20 border-orange-200/50 dark:border-orange-800/30 shadow-sm">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-black text-orange-600 dark:text-orange-400">
                  {streakData.currentStreak}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide">
                  Day Streak
                </p>
              </div>
            </div>
          </Card>
          <Card className="px-5 py-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20 border-green-200/50 dark:border-green-800/30 shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-black text-green-600 dark:text-green-400">
                  {completedSelected}/{totalSelected}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide">
                  {selectedDate === todayStr ? 'Today' : 'Completed'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <h3 className="font-bold mb-3 text-lg">
                {selectedDate === todayStr ? "Today's" : "Daily"} Progress
              </h3>
              <Progress
                value={totalSelected > 0 ? (completedSelected / totalSelected) * 100 : 0}
                className="h-4 mb-3"
              />
              <p className="text-sm text-muted-foreground">
                {totalSelected - completedSelected > 0
                  ? `Complete ${totalSelected - completedSelected} more ${totalSelected - completedSelected === 1 ? 'quiz' : 'quizzes'} to unlock bonus rewards!`
                  : "All quizzes completed for this date! Great job!"}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-3xl font-black text-primary">{completedSelected}</p>
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide">Completed</p>
              </div>
              <div>
                <p className="text-3xl font-black text-amber-500">{stats.averageScore || 0}</p>
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide">Avg Score</p>
              </div>
              <div>
                <p className="text-3xl font-black text-green-500">{stats.averageAccuracy || 0}%</p>
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide">Accuracy</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Quiz Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Date and Subject Selection */}
          <div className="space-y-4">
            {/* Date Navigation */}
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <ScrollArea className="w-full">
                <div className="flex gap-2 pb-2">
                  {availableDates.map(date => (
                    <Button
                      key={date}
                      variant={selectedDate === date ? "default" : "outline"}
                      size="sm"
                      className={`whitespace-nowrap rounded-xl text-xs font-semibold transition-all ${selectedDate === date ? 'shadow-md' : ''}`}
                      onClick={() => setSelectedDate(date)}
                    >
                      {date === todayStr ? (
                        <>
                          <Sparkles className="h-3 w-3 mr-1.5" />
                          Today
                        </>
                      ) : (
                        new Date(date).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: date.split('-')[0] !== todayStr.split('-')[0] ? '2-digit' : undefined
                        })
                      )}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Subject Filter */}
            <div className="flex flex-wrap gap-2">
              {subjects.map((subject) => (
                <Button
                  key={subject}
                  variant={selectedSubject === subject ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setSelectedSubject(subject)}
                  className={`capitalize rounded-xl px-5 h-10 font-semibold transition-all ${selectedSubject === subject ? 'shadow-md' : ''}`}
                >
                  {subject === 'all' ? 'All Subjects' : subject}
                </Button>
              ))}
            </div>
          </div>

          {/* Quiz Cards */}
          <div className="space-y-4">
            {filteredQuizzes.length > 0 ? (
              filteredQuizzes.map((quiz) => (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  onStart={handleStartQuiz}
                  todayStr={todayStr}
                />
              ))
            ) : (
              <div className="h-80 flex flex-col items-center justify-center text-center p-8 bg-muted/20 border-2 border-dashed border-muted rounded-3xl">
                <Target className="h-16 w-16 text-muted-foreground/20 mb-4" />
                <h3 className="font-bold text-lg mb-2">No Quizzes Available</h3>
                <p className="text-muted-foreground text-sm max-w-xs">
                  There are no quizzes found for this date or subject combination.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Streak Rewards Card */}
          <StreakRewards
            streakData={streakData}
            onClaimReward={handleClaimReward}
          />

          {/* Smart Recommendations */}
          <SmartRecommendations
            weakAreas={weakAreas}
            onViewFullAnalysis={() => console.log('View full analysis')}
          />

          {/* Leaderboard */}
          <Leaderboard
            leaderboardData={leaderboard}
            period={leaderboardPeriod}
            onPeriodChange={setLeaderboardPeriod}
          />
        </div>
      </div>
    </div>
  );
};

export default DailyQuizzes;
