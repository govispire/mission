import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Clock, Play, CheckCircle, Lock, Calendar,
    Trophy, Zap, Users
} from 'lucide-react';
import { DailyQuiz } from '@/utils/quizGenerator';

interface QuizCardProps {
    quiz: DailyQuiz & { completed?: boolean; score?: number };
    onStart: (quiz: DailyQuiz) => void;
    todayStr: string;
}

const subjectColors: Record<string, string> = {
    'Quantitative Aptitude': 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    'Reasoning': 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    'English': 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
    'General Awareness': 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    'Current Affairs': 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
};

const subjectGradients: Record<string, string> = {
    'Quantitative Aptitude': 'from-blue-500/10 to-blue-600/10',
    'Reasoning': 'from-purple-500/10 to-purple-600/10',
    'English': 'from-green-500/10 to-green-600/10',
    'General Awareness': 'from-orange-500/10 to-orange-600/10',
    'Current Affairs': 'from-red-500/10 to-red-600/10',
};

const QuizCard: React.FC<QuizCardProps> = ({ quiz, onStart, todayStr }) => {
    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
            case 'Medium': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
            case 'Hard': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
            default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
        }
    };

    const isLocked = quiz.isLocked;
    const isFuture = quiz.scheduledDate > todayStr;
    const isCompleted = quiz.completed;
    const isDisabled = isLocked || isFuture;

    return (
        <Card
            className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${isCompleted ? 'bg-gradient-to-br from-green-50/50 to-emerald-50/30 dark:from-green-950/20 dark:to-emerald-950/10 border-green-200/50 dark:border-green-800/50' : ''} ${isDisabled ? 'opacity-60' : ''}`}
        >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${subjectGradients[quiz.subject] || 'from-gray-500/5 to-gray-600/5'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

            <CardContent className="relative p-5">
                <div className="flex items-start justify-between gap-4">
                    {/* Left Section */}
                    <div className="flex-1 min-w-0">
                        {/* Title and Status */}
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-base truncate">{quiz.title}</h3>
                            {quiz.isNew && quiz.scheduledDate === todayStr && (
                                <Badge className="bg-gradient-to-r from-primary to-primary/80 text-white text-[10px] px-2 py-0.5 font-bold animate-pulse">
                                    NEW
                                </Badge>
                            )}
                            {isCompleted && (
                                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            )}
                        </div>

                        {/* Subject Badge */}
                        <div className="mb-3">
                            <Badge
                                variant="outline"
                                className={`text-xs font-medium ${subjectColors[quiz.subject] || 'bg-gray-50'}`}
                            >
                                {quiz.subject}
                            </Badge>
                        </div>

                        {/* Meta Information */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1.5">
                                <Trophy className="h-3.5 w-3.5" />
                                {quiz.questions} Questions
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                {quiz.duration} mins
                            </span>
                            {quiz.totalUsers && (
                                <span className="flex items-center gap-1.5">
                                    <Users className="h-3.5 w-3.5" />
                                    {quiz.totalUsers.toLocaleString()} attempted
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Right Section - Difficulty and Action */}
                    <div className="flex flex-col items-end gap-3">
                        <Badge
                            variant="outline"
                            className={`text-[10px] font-bold px-2.5 py-1 ${getDifficultyColor(quiz.difficulty)}`}
                        >
                            {quiz.difficulty}
                        </Badge>

                        {isCompleted ? (
                            <div className="text-right">
                                <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                    {quiz.score}%
                                </p>
                                <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide">
                                    Scored
                                </p>
                            </div>
                        ) : isLocked ? (
                            <Button
                                size="sm"
                                variant="outline"
                                disabled
                                className="h-9 px-4 rounded-xl"
                            >
                                <Lock className="h-3.5 w-3.5 mr-1.5" />
                                Locked
                            </Button>
                        ) : isFuture ? (
                            <Button
                                size="sm"
                                variant="outline"
                                disabled
                                className="h-9 px-4 rounded-xl"
                            >
                                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                                Coming Soon
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                onClick={() => onStart(quiz)}
                                className="h-9 px-6 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                            >
                                <Play className="h-3.5 w-3.5 mr-1.5 fill-current" />
                                Start Quiz
                            </Button>
                        )}
                    </div>
                </div>

                {/* Completion Indicator */}
                {isCompleted && (
                    <div className="mt-3 pt-3 border-t border-green-200/50 dark:border-green-800/50">
                        <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                            <Zap className="h-3.5 w-3.5" />
                            <span className="font-medium">Completed • Great Job!</span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default QuizCard;
