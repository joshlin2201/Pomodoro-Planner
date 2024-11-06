"use client";

import { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { usePomodoro } from '../hooks/usePomodoro';
import { PomodoroTimer } from './pomodoro/PomodoroTimer';
import { TodoList } from './pomodoro/TodoList';
import { FAQ } from './pomodoro/FAQ';
import { formatTotalTime } from '../utils/time';

export default function PomodoroPlanner() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const {
        sessions,
        timeLeft,
        isRunning,
        totalWorkTimeCompleted,
        message,
        pomodoroType,
        totalTime,
        hasStarted,
        resetTimer,
        toggleTimer,
        concludeEarly,
        setPomodoroType,
        setTotalTime
    } = usePomodoro();

    return (
        <div className="flex flex-col md:flex-row justify-center space-x-7">
            <audio ref={audioRef} src="/bell-happy.mp3"/>
            
            <div className="flex-shrink-0">
                <PomodoroTimer
                    timeLeft={timeLeft}
                    isRunning={isRunning}
                    hasStarted={hasStarted}
                    message={message}
                    sessions={sessions}
                    pomodoroType={pomodoroType}
                    totalTime={totalTime}
                    onToggleTimer={toggleTimer}
                    onResetTimer={resetTimer}
                    onConcludeEarly={concludeEarly}
                    onPomodoroTypeChange={(value: string) => {
                        setPomodoroType(value);
                        setTotalTime(null);
                    }}
                    onTotalTimeChange={(value: string) => {
                        const newTotalTime = Number(value);
                        setTotalTime(newTotalTime);
                    }}
                />
            </div>

            <div className="space-y-2 flex-grow">
                <TodoList />

                {hasStarted && (
                    <Card className="w-64">
                        <CardHeader>
                            <CardTitle>Total Work Time Completed</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatTotalTime(totalWorkTimeCompleted)}</div>
                        </CardContent>
                    </Card>
                )}

                <div className="my-2 border-2 border-dashed border-gray-300 rounded-lg p-4 w-[300px] h-[250px] flex items-center justify-center">
                    <div className="text-center text-gray-500">Ad Placeholder (300×250)</div>
                    <ins className="adsbygoogle hidden"
                         style={{display: 'block', width: '300px', height: '250px'}}
                         data-ad-client="ca-pub-XXXXXX"
                         data-ad-slot="XXXXXX"
                         data-ad-format="auto"></ins>
                </div>

                <FAQ />
            </div>
        </div>
    );
}
