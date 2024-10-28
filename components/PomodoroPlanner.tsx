"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, X, Check, FastForward } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button' ;
import { Input } from '@/components/ui/input' ;
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function PomodoroPlanner() {
    const [sessions, setSessions] = useState<Array<{ id: number, name: string, duration: number, isBreak: boolean, startTime: Date }>>([]);
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [todoList, setTodoList] = useState<Array<{ id: number, text: string, completed: boolean }>>([]);
    const [totalWorkTimeCompleted, setTotalWorkTimeCompleted] = useState(0);
    const [newTodoItem, setNewTodoItem] = useState("");
    const [message, setMessage] = useState("");
    const [pomodoroType, setPomodoroType] = useState<string | null>(null);
    const [totalTime, setTotalTime] = useState<number | null>(null);
    const [hasStarted, setHasStarted] = useState(false);
    const timerRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const sessionStartTimeRef = useRef<number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const pausedTimeRef = useRef<number | null>(null);

    const resetTimer = useCallback(() => {
        setIsRunning(false);
        setSessions([]);
        setTimeLeft(25 * 60);
        setPomodoroType(null);
        setTotalTime(null);
        setTodoList([]);
        setTotalWorkTimeCompleted(0);
        setMessage("");
        setHasStarted(false);
        sessionStartTimeRef.current = null;
        startTimeRef.current = null;
        pausedTimeRef.current = null;
        if (timerRef.current) {
            cancelAnimationFrame(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const handleSessionComplete = useCallback((isEarlyConclusion = false) => {
        if (sessions.length > 0) {
            const completedSession = sessions[0];
            if (!completedSession.isBreak) {
                let elapsedTime;
                if (isEarlyConclusion && sessionStartTimeRef.current) {
                    const now = Date.now();
                    elapsedTime = Math.floor((now - sessionStartTimeRef.current) / 60000); // Convert to minutes
                } else {
                    elapsedTime = completedSession.duration;
                }
                setTotalWorkTimeCompleted(prev => prev + elapsedTime);
            }
            setSessions(prevSessions => prevSessions.slice(1));

            if (sessions.length > 1) {
                setTimeLeft(sessions[1].duration * 60);
                sessionStartTimeRef.current = Date.now();
                startTimeRef.current = performance.now();
            } else {
                setIsRunning(false);
                resetTimer();
            }
        }
        setMessage('Session complete!');
        if (audioRef.current) {
            audioRef.current.play();
        }
    }, [sessions, resetTimer]);

    const updateTimer = useCallback(() => {
        if (!isRunning || !startTimeRef.current) return;

        const now = performance.now();
        const elapsed = Math.floor((now - startTimeRef.current) / 1000);
        const targetTime = pausedTimeRef.current ?? timeLeft;
        const newTime = Math.max(0, targetTime - elapsed);

        if (newTime === 0) {
            handleSessionComplete();
        } else {
            setTimeLeft(newTime);
            timerRef.current = requestAnimationFrame(updateTimer);
        }
    }, [isRunning, timeLeft, handleSessionComplete]);

    useEffect(() => {
        if (isRunning) {
            startTimeRef.current = performance.now() - ((pausedTimeRef.current ?? timeLeft) - timeLeft) * 1000;
            pausedTimeRef.current = null;
            timerRef.current = requestAnimationFrame(updateTimer);
        } else {
            if (timerRef.current) {
                cancelAnimationFrame(timerRef.current);
                timerRef.current = null;
            }
            pausedTimeRef.current = timeLeft;
        }

        return () => {
            if (timerRef.current) {
                cancelAnimationFrame(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [isRunning, timeLeft, updateTimer]);

    const generateSessions = useCallback(() => {
        if (!pomodoroType || !totalTime) return;

        const sessionDuration = pomodoroType === 'short' ? 25 : 50;
        const breakDuration = pomodoroType === 'short' ? 5 : 15;
        let remainingTime = totalTime;
        let startTime = new Date();
        startTime.setSeconds(0, 0); // Round to the nearest minute
        const newSessions = [];

        while (remainingTime > 0) {
            if (remainingTime >= sessionDuration) {
                newSessions.push({
                    id: Date.now() + newSessions.length,
                    name: `${sessionDuration} Minute Session`,
                    duration: sessionDuration,
                    isBreak: false,
                    startTime: new Date(startTime)
                });
                startTime = new Date(startTime.getTime() + sessionDuration * 60000);
                remainingTime -= sessionDuration;

                if (remainingTime >= breakDuration) {
                    newSessions.push({
                        id: Date.now() + newSessions.length + 0.5,
                        name: `${breakDuration} Minute Break`,
                        duration: breakDuration,
                        isBreak: true,
                        startTime: new Date(startTime)
                    });
                    startTime = new Date(startTime.getTime() + breakDuration * 60000);
                    remainingTime -= breakDuration;
                }
            } else {
                newSessions.push({
                    id: Date.now() + newSessions.length,
                    name: `${remainingTime} Minute Session`,
                    duration: remainingTime,
                    isBreak: false,
                    startTime: new Date(startTime)
                });
                remainingTime = 0;
            }
        }

        setSessions(newSessions);
        setTimeLeft(newSessions[0].duration * 60);
        setIsRunning(false);
        setHasStarted(false);
        startTimeRef.current = null;
        pausedTimeRef.current = null;
    }, [pomodoroType, totalTime]);

    useEffect(() => {
        if (pomodoroType && totalTime) {
            generateSessions();
        }
    }, [pomodoroType, totalTime, generateSessions]);

    useEffect(() => {
        if (window) {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
    }, []);

    const toggleTimer = () => {
        if (sessions.length === 0) {
            setMessage('Please set up sessions first');
            return;
        }
        
        if (!isRunning) {
            if (!hasStarted) {
                setHasStarted(true);
                setMessage('Session Started. Good Luck!');
            }
            sessionStartTimeRef.current = Date.now();
        } else {
            setMessage('Session Paused');
        }
        
        setIsRunning(!isRunning);
    };

    const addTodoItem = () => {
        if (newTodoItem.trim()) {
            setTodoList(t => [...t, {id: Date.now(), text: newTodoItem, completed: false}]);
            setNewTodoItem("");
        }
    };

    const toggleTodoItem = (id: number) => {
        setTodoList(t => t.map(item =>
            item.id === id ? {...item, completed: !item.completed} : item
        ));
    };

    const removeTodoItem = (id: number) => setTodoList(t => t.filter(item => item.id !== id));

    const concludeEarly = () => {
        setMessage('Session Skipped');
        handleSessionComplete(true);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatClock = (date: Date) => {
        return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    };

    const formatTotalTime = (minutes: number) => {
        if (minutes === 0) return "0 minutes";
        if (minutes === 1) return "1 minute";
        if (minutes < 60) return `${minutes} minutes`;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        if (remainingMinutes === 0) return `${hours}h`;
        if (remainingMinutes === 1) return `${hours}h 1 minute`;
        return `${hours}h ${remainingMinutes} minutes`;
    };

    const getTotalTimeOptions = () => {
        if (!pomodoroType) return [];
        const sessionDuration = pomodoroType === 'short' ? 25 : 50;
        const breakDuration = pomodoroType === 'short' ? 5 : 15;
        return Array.from({length: 10}, (_, i) => (i + 1) * (sessionDuration + breakDuration) - breakDuration);
    };

    return (
        <div className="flex flex-col md:flex-row justify-center space-x-7">
            <audio ref={audioRef} src="/bell-happy.mp3"/>
            <Card className="w-96 border-timer flex-shrink-0 h-566">
                <CardHeader>
                    <CardTitle>Pomodoro Planner</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 p-4 ">
                    <div className="flex flex-col items-center">
                        <div className="text-6xl font-bold mb-2">{formatTime(timeLeft)}</div>
                        <div className="text-sm mb-2">{sessions[0]?.name || "Set Up Timer Below"}</div>
                        <div className="h-6 text-green-500 font-bold mb-1">{message}</div>
                        <div className="flex space-x-2 mb-4">
                            <Button onClick={toggleTimer} className="button" variant="default" disabled={sessions.length === 0}>
                                {isRunning ? <Pause className="h-4 w-4 mr-2"/> : <Play className="h-4 w-4 mr-2"/>}
                                {isRunning ? "Pause" : hasStarted ? "Resume" : "Start"}
                                </Button>
                            <Button onClick={resetTimer} className="button" variant="outline">
                                <RotateCcw className="h-4 w-4 mr-2" />Reset
                            </Button>
                            {isRunning && (
                                <Button onClick={concludeEarly} variant="secondary" className="button">
                                    <FastForward className="h-4 w-4 mr-2" />
                                    Skip
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Select onValueChange={(value: string) => {
                            setPomodoroType(value);
                            setTotalTime(null);
                        }}>
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
                                onValueChange={(value) => {
                                    const newTotalTime = Number(value);
                                    setTotalTime(newTotalTime);
                                    generateSessions();
                                }}
                            >
                                <SelectTrigger className="dropdown">
                                    <SelectValue placeholder="Total Work Time"/>
                                </SelectTrigger>
                                <SelectContent className="dropdown">
                                    {getTotalTimeOptions().map((time) => (
                                        <SelectItem key={time}
                                                    value={time.toString()} className="dropdown-item">{formatTotalTime(time)}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {sessions.map((session, index) => (
                            <div
                                key={session.id}
                                className={`flex items-center justify-between ${session.isBreak ? 'bg-gray-100' : 'bg-blue-50'} p-2 rounded
                  ${index === 0 ? 'border-2 border-blue-500' : ''}`}
                            >
                                <div className="flex items-center">
                                    <span className="w-16 text-xs text-gray-500">{formatClock(session.startTime)}</span>
                                    <span>{session.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4 flex-grow">
                <Card className="w-64 border-todo">
                    <CardHeader>
                        <CardTitle>To-Do </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex space-x-2 mb-4">
                            <Input
                                value={newTodoItem}
                                onChange={(e) => setNewTodoItem(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addTodoItem()}
                                placeholder="Add a task"
                            />
                            <Button onClick={addTodoItem} className="button" variant="default" size="sm"><Check
                                className="h-4 w-4"/></Button>
                        </div>
                        <ul className="space-y-2">
                            {todoList.map((item) => (
                                <li key={item.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`todo-${item.id}`}
                                        checked={item.completed}
                                        onCheckedChange={() => toggleTodoItem(item.id)}
                                    />
                                    <label
                                        htmlFor={`todo-${item.id}`}
                                        className={`flex-1 ${item.completed ? 'line-through text-gray-500' : ''} break-words whitespace-normal`}
                                        style={{wordBreak: 'break-word', overflowWrap: 'break-word'}}
                                    >
                                        {item.text}
                                    </label>
                                    <Button onClick={() => removeTodoItem(item.id)} variant="ghost" size="sm">
                                        <X className="h-4 w-4"/>
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

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
                <div className="my-4">
                    <div className="text-center text-gray-500">Ad Placeholder (300x250)</div>
                    <ins className="adsbygoogle"
                         style={{display: 'block', width: '300px', height: '250px'}}
                         data-ad-client="ca-pub-XXXXXX" // Replace with your AdSense client ID
                         data-ad-slot="XXXXXX" // Replace with your AdSense slot ID
                         data-ad-format="auto"></ins>
                </div>
            </div>
        </div>
    );
}
