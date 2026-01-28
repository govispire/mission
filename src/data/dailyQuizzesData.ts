import { generateAllQuizTypes, ExtendedQuiz } from '@/utils/quizGenerator';

// Export the ExtendedQuiz type as DailyQuiz for backwards compatibility
export type DailyQuiz = ExtendedQuiz;
export type { ExtendedQuiz };

// Generate all quiz types automatically
export const dailyQuizzes: ExtendedQuiz[] = generateAllQuizTypes();

export const getQuizzesForDate = (date: string) => {
    return dailyQuizzes.filter(q => q.scheduledDate === date);
};

export const getQuizzesByType = (type: string) => {
    return dailyQuizzes.filter(q => q.type === type);
};

export const getQuizzesByDateAndType = (date: string, type?: string) => {
    return dailyQuizzes.filter(q =>
        q.scheduledDate === date && (!type || type === 'all' || q.type === type)
    );
};
