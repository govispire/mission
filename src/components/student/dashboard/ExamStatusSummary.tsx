import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSelfCareExams, ExamApplication } from '@/hooks/useSelfCareExams';
import { Link, useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Plus, Trophy, ChevronRight, Info } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export const ExamStatusSummary = () => {
    const { exams } = useSelfCareExams();
    const navigate = useNavigate();

    // Get active exams (already filtered by hook, but ensure we take top 3)
    const activeExams = exams.slice(0, 3);

    const getStageIndex = (exam: ExamApplication) => {
        const idx = exam.stages.findIndex(s => s.status === 'pending' || s.status === 'not-cleared' || s.status === 'n/a');
        return idx === -1 ? exam.stages.length : idx; // If all cleared, return length (all done)
    };

    if (activeExams.length === 0) {
        return (
            <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-dashed border-2 border-indigo-200">
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                        <Plus className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg text-primary mb-1">Track Your Exam Goals</h3>
                    <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                        Add exams to tracking to see your application status, dates, and progress here.
                    </p>
                    <Button onClick={() => navigate('/student/self-care')} className="bg-primary hover:bg-primary/90">
                        Start Tracking
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-5 bg-card border shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 text-primary rounded-xl shadow-sm">
                        <Trophy className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg tracking-tight">Your Current Exams Status</h3>
                        <p className="text-xs text-muted-foreground font-medium">Tracking {activeExams.length} active applications</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" className="text-xs space-x-1 h-8 shadow-sm" asChild>
                    <Link to="/student/self-care">
                        <span>View All</span> <ArrowRight className="h-3 w-3" />
                    </Link>
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {activeExams.map((exam) => {
                    const currentIndex = getStageIndex(exam);
                    const isSelected = exam.finalStatus === 'selected';
                    const isNotSelected = exam.finalStatus === 'not-selected';

                    return (
                        <div
                            key={exam.id}
                            onClick={() => navigate('/student/self-care')}
                            className="bg-card hover:bg-muted/30 border rounded-xl p-6 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md group relative"
                        >
                            {/* Exam Header */}
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h4 className="font-bold text-base text-foreground group-hover:text-primary transition-colors mb-1">{exam.name}</h4>
                                    <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">{exam.category}</p>
                                </div>
                                <span className={`text-[10px] px-3 py-1 rounded-full font-bold border ${isSelected ? 'bg-green-100 text-green-700 border-green-200' :
                                    isNotSelected ? 'bg-red-100 text-red-700 border-red-200' :
                                        'bg-primary/10 text-primary border-primary/20'
                                    }`}>
                                    {exam.finalStatus === 'pending' ? 'Active' : exam.finalStatus}
                                </span>
                            </div>

                            {/* Stepper Visualization */}
                            <div className="relative px-2">
                                <div className="flex items-start justify-between relative z-10 w-full">
                                    {exam.stages.map((stage, idx) => {
                                        const isCompleted = idx < currentIndex;
                                        const isCurrent = idx === currentIndex;
                                        const isLast = idx === exam.stages.length - 1;
                                        const isFailed = isNotSelected && isCurrent;

                                        return (
                                            <div key={idx} className="flex flex-col items-center flex-1 relative min-w-0 z-10">
                                                {/* Connecting Line */}
                                                {!isLast && (
                                                    <div className="absolute top-3 left-[50%] w-full h-[2px] -z-10 bg-muted overflow-hidden rounded-full">
                                                        <div
                                                            className={`h-full w-full transition-all duration-500 ease-out origin-left ${isCompleted ? 'bg-green-500 scale-x-100' : 'scale-x-0'
                                                                }`}
                                                        />
                                                    </div>
                                                )}

                                                <TooltipProvider delayDuration={0}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            {/* Node Circle Wrapper */}
                                                            <div className="relative flex-shrink-0 cursor-help group/node">
                                                                {/* Active Blink Animation */}
                                                                {isCurrent && !isFailed && !isSelected && (
                                                                    <>
                                                                        <div className="absolute -inset-1.5 border-2 border-dashed border-primary/40 rounded-full animate-spin-slow"></div>
                                                                        <div className="absolute -inset-1.5 border-2 border-primary/20 rounded-full animate-pulse"></div>
                                                                    </>
                                                                )}

                                                                <div
                                                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all duration-300 shadow-sm relative z-20
                                                                        ${isCompleted ? 'bg-green-500 border-green-500 text-white' :
                                                                            isFailed ? 'bg-red-500 border-red-500 text-white' :
                                                                                isCurrent ? 'bg-white border-primary text-primary scale-110' :
                                                                                    'bg-muted/50 border-muted-foreground/20 text-muted-foreground group-hover/node:border-primary/50 group-hover/node:text-primary/70'
                                                                        }`}
                                                                >
                                                                    {isCompleted ? (
                                                                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                                                                    ) : isFailed ? (
                                                                        <span className="text-white">✕</span>
                                                                    ) : (
                                                                        <span>{idx + 1}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent
                                                            side="bottom"
                                                            align="center"
                                                            sideOffset={10}
                                                            collisionPadding={20}
                                                            className="p-0 border-0 bg-transparent shadow-none"
                                                        >
                                                            <div className={`w-64 bg-white rounded-xl border-2 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 mt-2 z-50 ${stage.status === 'cleared' ? 'border-green-500/50 ring-4 ring-green-500/10' :
                                                                    stage.status === 'not-cleared' ? 'border-red-500/50 ring-4 ring-red-500/10' :
                                                                        isCurrent ? 'border-indigo-600/50 ring-4 ring-indigo-600/10' :
                                                                            'border-slate-200'
                                                                }`}>
                                                                {/* Card Header */}
                                                                <div className={`px-4 py-3 border-b flex justify-between items-center ${isCompleted ? 'bg-green-50/50' :
                                                                        isCurrent ? 'bg-indigo-50/50' : 'bg-slate-50/50'
                                                                    }`}>
                                                                    <span className="font-bold text-sm text-slate-800">{stage.name}</span>
                                                                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border uppercase tracking-wide ${stage.status === 'cleared' ? 'bg-white text-green-700 border-green-200 shadow-sm' :
                                                                            stage.status === 'not-cleared' ? 'bg-white text-red-700 border-red-200 shadow-sm' :
                                                                                isCurrent ? 'bg-white text-indigo-600 border-indigo-200 shadow-sm' :
                                                                                    'bg-slate-100 text-slate-500 border-slate-200'
                                                                        }`}>
                                                                        {stage.status === 'pending' && isCurrent ? 'Active' : stage.status === 'pending' ? 'Upcoming' : stage.status}
                                                                    </span>
                                                                </div>

                                                                {/* Card Body */}
                                                                <div className="p-4 space-y-4">
                                                                    {/* Date Section */}
                                                                    <div className="flex items-start gap-3">
                                                                        <div className="p-2 bg-slate-100/80 rounded-lg text-slate-500">
                                                                            <Info className="h-4 w-4" />
                                                                        </div>
                                                                        <div className="space-y-0.5">
                                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</p>
                                                                            <p className="text-sm font-semibold text-slate-700">
                                                                                {stage.date ? new Date(stage.date).toLocaleDateString('en-GB', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'Date not set'}
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    {/* Performance Section */}
                                                                    {(stage.score || stage.notes) && (
                                                                        <div className="pt-3 border-t border-slate-50 space-y-3">
                                                                            {stage.score && (
                                                                                <div className="flex justify-between items-center">
                                                                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Score</span>
                                                                                    <span className="text-sm font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-md">{stage.score}</span>
                                                                                </div>
                                                                            )}
                                                                            {stage.notes && (
                                                                                <div>
                                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Notes</p>
                                                                                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                                                                        <p className="text-xs text-slate-600 italic leading-relaxed">"{stage.notes}"</p>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}

                                                                    {/* Empty State */}
                                                                    {!stage.score && !stage.notes && !stage.date && (
                                                                        <div className="text-center py-2">
                                                                            <p className="text-xs text-slate-400 italic">No details available yet</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>

                                                {/* Label */}
                                                <div className="text-center w-full px-1 mt-3">
                                                    <p className={`text-[10px] font-bold uppercase tracking-tight leading-tight transition-colors duration-300 break-words ${isCurrent ? 'text-primary' : 'text-muted-foreground'
                                                        }`}>
                                                        {stage.name}
                                                    </p>
                                                    {isCurrent && stage.date && (
                                                        <div className="bg-primary/5 px-2 py-0.5 rounded-full mt-1.5 inline-block border border-primary/10">
                                                            <span className="text-[9px] text-primary font-semibold block whitespace-nowrap">
                                                                {new Date(stage.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Hover CTA */}
                            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-1 group-hover:translate-y-0">
                                <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};
