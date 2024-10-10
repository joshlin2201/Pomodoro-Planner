"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, X, Check, FastForward } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const lastTickRef = useRef(Date.now());
    const sessionStartTimeRef = useRef<number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

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
    }, [pomodoroType, totalTime]);

    useEffect(() => {
        if (isRunning) {
            timerRef.current = setInterval(() => {
                const now = Date.now();
                const delta = Math.floor((now - lastTickRef.current) / 1000);
                lastTickRef.current = now;

                setTimeLeft(prevTime => {
                    const newTime = Math.max(0, prevTime - delta);
                    if (newTime === 0) {
                        handleSessionComplete();
                    }
                    return newTime;
                });
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRunning, handleSessionComplete]);

    useEffect(() => {
        if (pomodoroType && totalTime) {
            generateSessions();
        }
    }, [pomodoroType, totalTime, generateSessions]);

    const toggleTimer = () => {
        if (sessions.length === 0) {
            setMessage('Please set up sessions first');
            return;
        }
        if (!isRunning) {
            lastTickRef.current = Date.now();
            if (!hasStarted) {
                setHasStarted(true);
                setMessage('Session Started. Good Luck!');
            }
            sessionStartTimeRef.current = Date.now();
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
        setMessage('Session concluded early');
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
        <div className="flex flex-col md:flex-row justify-center space-x-4">
            <audio ref={audioRef} src="/bell-happy.mp3"/>
            <Card className="w-96">
                <CardHeader>
                    <CardTitle>Pomodoro Timer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col items-center">
                        <div className="text-6xl font-bold mb-2">{formatTime(timeLeft)}</div>
                        <div className="text-sm mb-2">{sessions[0]?.name || "Ready to start"}</div>
                        <div className="h-6 text-green-500 font-bold mb-2">{message}</div>
                        <div className="flex space-x-2 mb-4">
                            <Button onClick={toggleTimer} variant="outline" disabled={sessions.length === 0}>
                                {isRunning ? <Pause className="h-4 w-4 mr-2"/> : <Play className="h-4 w-4 mr-2"/>}
                                {isRunning ? "Pause" : "Start"}
                            </Button>
                            <Button onClick={resetTimer} variant="outline">
                                <RotateCcw className="h-4 w-4 mr-2"/>Reset
                            </Button>
                            {isRunning && (
                                <Button onClick={concludeEarly} variant="outline">
                                    <FastForward className="h-4 w-4 mr-2"/>
                                    Conclude Early
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Select onValueChange={(value: string) => {
                            setPomodoroType(value);
                            setTotalTime(null);
                        }}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose Your Pomodoro Format"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="short">Short Pomodoro (25min Sessions)</SelectItem>
                                <SelectItem value="long">Long Pomodoro (50min Sessions)</SelectItem>
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
                                <SelectTrigger>
                                    <SelectValue placeholder="Total Work Time"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {getTotalTimeOptions().map((time) => (
                                        <SelectItem key={time}
                                                    value={time.toString()}>{formatTotalTime(time)}</SelectItem>
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

            <div className="space-y-4">
                <Card className="w-64">
                    <CardHeader>
                        <CardTitle>To-Do List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex space-x-2 mb-4">
                            <Input
                                value={newTodoItem}
                                onChange={(e) => setNewTodoItem(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addTodoItem()}
                                placeholder="Add a task"
                            />
                            <Button onClick={addTodoItem} variant="outline" size="sm"><Check
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
            </div>
        </div>
    );
}