import { useState, useRef, useCallback, useEffect } from 'react';
import { Session } from '../types/pomodoro';

export const usePomodoro = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [totalWorkTimeCompleted, setTotalWorkTimeCompleted] = useState(0);
    const [message, setMessage] = useState("");
    const [pomodoroType, setPomodoroType] = useState<string | null>(null);
    const [totalTime, setTotalTime] = useState<number | null>(null);
    const [hasStarted, setHasStarted] = useState(false);
    
    const timerRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const sessionStartTimeRef = useRef<number | null>(null);
    const pausedTimeRef = useRef<number | null>(null);

    const resetTimer = useCallback(() => {
        setIsRunning(false);
        setSessions([]);
        setTimeLeft(25 * 60);
        setPomodoroType(null);
        setTotalTime(null);
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

    const updateSessionStartTimes = useCallback(() => {
        setSessions(prevSessions => {
            if (prevSessions.length === 0) return prevSessions;
            
            let currentTime = new Date();
            currentTime.setSeconds(0, 0);
            
            return prevSessions.map((session) => {
                const newStartTime = new Date(currentTime);
                currentTime = new Date(currentTime.getTime() + session.duration * 60000);
                return { ...session, startTime: newStartTime };
            });
        });
    }, []);

    const handleSessionComplete = useCallback((isEarlyConclusion = false) => {
        if (sessions.length > 0) {
            const completedSession = sessions[0];
            if (!completedSession.isBreak) {
                let elapsedTime;
                if (isEarlyConclusion && sessionStartTimeRef.current) {
                    const now = Date.now();
                    elapsedTime = Math.floor((now - sessionStartTimeRef.current) / 60000);
                } else {
                    elapsedTime = completedSession.duration;
                }
                setTotalWorkTimeCompleted(prev => prev + elapsedTime);
            }
            setSessions(prevSessions => {
                const remainingSessions = prevSessions.slice(1);
                if (remainingSessions.length > 0) {
                    let currentTime = new Date();
                    currentTime.setSeconds(0, 0);
                    return remainingSessions.map((session) => {
                        const newStartTime = new Date(currentTime);
                        currentTime = new Date(currentTime.getTime() + session.duration * 60000);
                        return { ...session, startTime: newStartTime };
                    });
                }
                return remainingSessions;
            });

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
        startTime.setSeconds(0, 0);
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

    // Add useEffect to generate sessions when totalTime changes
    useEffect(() => {
        if (totalTime !== null && pomodoroType !== null) {
            generateSessions();
        }
    }, [totalTime, pomodoroType, generateSessions]);

    const toggleTimer = () => {
        if (sessions.length === 0) {
            setMessage('Please set up sessions first');
            return;
        }
        
        if (!isRunning) {
            if (!hasStarted) {
                setHasStarted(true);
                setMessage('Session Started. Good Luck!');
                updateSessionStartTimes();
            }
            sessionStartTimeRef.current = Date.now();
        } else {
            setMessage('Session Paused');
        }
        
        setIsRunning(!isRunning);
    };

    const concludeEarly = () => {
        setMessage('Session Skipped');
        handleSessionComplete(true);
    };

    return {
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
        setTotalTime,
        generateSessions
    };
};
