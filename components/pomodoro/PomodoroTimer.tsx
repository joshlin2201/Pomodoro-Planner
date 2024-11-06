"use client";

import Image from 'next/image';
import { Play, Pause, RotateCcw, FastForward } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { SessionList } from './SessionList';
import { formatTime, formatTotalTime } from '../../utils/time';

interface PomodoroTimerProps {
    timeLeft: number;
    isRunning: boolean;
    hasStarted: boolean;
    message: string;
    sessions: any[];
    pomodoroType: string | null;
    totalTime: number | null;
    onToggleTimer: () => void;
    onResetTimer: () => void;
    onConcludeEarly: () => void;
    onPomodoroTypeChange: (value: string) => void;
    onTotalTimeChange: (value: string) => void;
}

export function PomodoroTimer({
    timeLeft,
    isRunning,
    hasStarted,
    message,
    sessions,
    pomodoroType,
    totalTime,
    onToggleTimer,
    onResetTimer,
    onConcludeEarly,
    onPomodoroTypeChange,
    onTotalTimeChange
}: PomodoroTimerProps) {
    const getTotalTimeOptions = () => {
        if (!pomodoroType) return [];
        const sessionDuration = pomodoroType === 'short' ? 25 : 50;
        const breakDuration = pomodoroType === 'short' ? 5 : 15;
        return Array.from({length: 10}, (_, i) => (i + 1) * (sessionDuration + breakDuration) - breakDuration);
    };

    return (
        <Card className="w-96">
            <CardHeader className="flex flex-row items-center justify-between py-6 px-6">
                <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12">
                        <Image 
                            src="/PomoLogo.png" 
                            alt="Pomo Logo" 
                            fill
                            style={{ objectFit: 'contain' }}
                            className="transition-transform hover:scale-105"
                        />
                    </div>
                    <CardTitle className="text-2xl font-bold">Pomodoro Planner</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
                <div className="flex flex-col items-center">
                    <div className={`text-7xl font-bold mb-3 transition-all
                        ${isRunning ? 'text-glow-running' : 'text-glow-paused'}
                        ${timeLeft <= 60 ? 'text-red-500' : ''}
                        tracking-wider font-mono
                    `}>
                        {formatTime(timeLeft)}
                    </div>
                    <div className="text-sm mb-2 font-medium">{sessions[0]?.name || "Set Up Timer Below"}</div>
                    <div className="h-6 text-green-500 font-bold mb-1">{message}</div>
                    <div className="flex space-x-2 mb-4">
                        <Button 
                            onClick={onToggleTimer} 
                            className={`button transition-transform hover:scale-105 ${isRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-600 hover:bg-green-700'}`}
                            disabled={sessions.length === 0}
                        >
                            {isRunning ? <Pause className="h-4 w-4 mr-2"/> : <Play className="h-4 w-4 mr-2"/>}
                            {isRunning ? "Pause" : hasStarted ? "Resume" : "Start"}
                        </Button>
                        <Button 
                            onClick={onResetTimer} 
                            className="button transition-transform hover:scale-105" 
                            variant="outline"
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />Reset
                        </Button>
                        {isRunning && (
                            <Button 
                                onClick={onConcludeEarly} 
                                variant="secondary" 
                                className="button transition-transform hover:scale-105"
                            >
                                <FastForward className="h-4 w-4 mr-2" />
                                Skip
                            </Button>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <Select onValueChange={onPomodoroTypeChange}>
                        <SelectTrigger className="dropdown">
                            <SelectValue placeholder="Choose Your Pomodoro Format"/>
                        </SelectTrigger>
                        <SelectContent className="dropdown">
                            <SelectItem value="short" className="dropdown-item">Short Pomodoro (25min Sessions)</SelectItem>
                            <SelectItem value="long" className="dropdown-item">Long Pomodoro (50min Sessions)</SelectItem>
                        </SelectContent>
                    </Select>

                    {pomodoroType && (
                        <Select
                            value={totalTime?.toString()}
                            onValueChange={onTotalTimeChange}
                        >
                            <SelectTrigger className="dropdown">
                                <SelectValue placeholder="Total Session Time"/>
                            </SelectTrigger>
                            <SelectContent className="dropdown">
                                {getTotalTimeOptions().map((time) => (
                                    <SelectItem 
                                        key={time}
                                        value={time.toString()} 
                                        className="dropdown-item"
                                    >
                                        {formatTotalTime(time)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>

                <SessionList sessions={sessions} />
            </CardContent>
        </Card>
    );
}
