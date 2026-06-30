'use client';

import { useState, useEffect, useCallback } from 'react';
import Style1 from './ui/style-1';
import Style2 from './ui/style-2';
import Style3 from './ui/style-3';

interface TriggerCheck {
    active: boolean;
    triggerType?: string;
    triggerValue?: number;
    expiresAt?: string;
    remainingMs?: number;
    reorderCount?: number;
    title?: string;
    offerMessage?: string;
    bannerImage?: string;
    bgColor?: string;
    textColor?: string;
    countdownColor?: string;
    bannerStyle?: 'style-1' | 'style-2' | 'style-3';
    bottomOffset?: number;
    sideOffset?: number;
    bannerPosition?: 'left' | 'center' | 'right';
}

function formatTimeLeft(ms: number): string {
    if (ms <= 0) return 'Expired';
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);
    return parts.join(' ');
}

function getPositionStyle(trigger: TriggerCheck): React.CSSProperties {
    const bottom = `${trigger.bottomOffset ?? 16}px`;
    if (trigger.bannerPosition === 'left') {
        return { bottom, left: `${trigger.sideOffset ?? 16}px` };
    }
    if (trigger.bannerPosition === 'right') {
        return { bottom, right: `${trigger.sideOffset ?? 16}px` };
    }
    return { bottom, left: '50%', transform: 'translateX(-50%)' };
}

function getProgress(trigger: TriggerCheck, now: number): number {
    if (!trigger.expiresAt) return 0;
    const endMs = new Date(trigger.expiresAt).getTime();
    const remaining = endMs - now;
    if (remaining <= 0) return 0;
    const totalMs = (trigger.remainingMs || 0) + remaining;
    if (totalMs <= 0) return 0;
    return Math.round((remaining / totalMs) * 100);
}

export default function TriggerBanner() {
    const [trigger, setTrigger] = useState<TriggerCheck | null>(null);
    const [loading, setLoading] = useState(true);
    const [now, setNow] = useState(Date.now());
    const [dismissed, setDismissed] = useState(false);

    const fetchTrigger = useCallback(async () => {
        try {
            let userId = '';
            try {
                const sessionRes = await fetch('/api/auth/session');
                if (sessionRes.ok) {
                    const sessionData = await sessionRes.json();
                    if (sessionData?.user?.id) {
                        userId = sessionData.user.id;
                    }
                }
            } catch { /* ignore */ }

            const params = new URLSearchParams();
            if (userId) {
                params.set('identifier', userId);
                params.set('type', 'user');
            }
            // For guests: no identifier sent — server extracts IP from headers

            const qs = params.toString();
            const res = await fetch(`/api/24h-trigger/check${qs ? `?${qs}` : ''}`);
            if (res.ok) {
                const data = await res.json();
                setTrigger(data);
            }
        } catch { /* ignore */ } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTrigger();
    }, [fetchTrigger]);

    useEffect(() => {
        if (!trigger?.active || !trigger.expiresAt) return;
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, [trigger?.active, trigger?.expiresAt]);

    if (loading || !trigger?.active || dismissed) return null;

    const endMs = new Date(trigger.expiresAt!).getTime();
    const timeLeft = endMs - now;
    if (timeLeft <= 0) return null;

    const offerLabel = trigger.triggerType === 'free_delivery'
        ? 'Free Delivery'
        : trigger.triggerType === 'fixed_discount'
        ? `${trigger.triggerValue} Off`
        : `${trigger.triggerValue}% Off`;

    const progress = getProgress(trigger, now);
    const posStyle = getPositionStyle(trigger);

    const sharedProps = {
        title: trigger.title || 'Exclusive Offer',
        offerLabel,
        offerMessage: trigger.offerMessage || '',
        bannerImage: trigger.bannerImage || '',
        bgColor: trigger.bgColor || '#fef3c7',
        textColor: trigger.textColor || '#92400e',
        countdownColor: trigger.countdownColor || '#f59e0b',
        timeLeft: formatTimeLeft(timeLeft),
        onDismiss: () => setDismissed(true),
    };

    const StyleComponent = trigger.bannerStyle === 'style-2'
        ? Style2
        : trigger.bannerStyle === 'style-3'
        ? Style3
        : Style1;

    return (
        <div className="fixed z-50 max-w-md w-[calc(100%-2rem)]" style={posStyle}>
            {trigger.bannerStyle === 'style-3' ? (
                <StyleComponent {...sharedProps} progress={progress} />
            ) : (
                <StyleComponent {...sharedProps} />
            )}
        </div>
    );
}
