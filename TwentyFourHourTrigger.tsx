'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

interface TriggerCheck {
    active: boolean;
    triggerType?: string;
    triggerValue?: number;
    expiresAt?: string;
    remainingMs?: number;
    reorderCount?: number;
    title?: string;
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

export default function TwentyFourHourTrigger() {
    const [trigger, setTrigger] = useState<TriggerCheck | null>(null);
    const [loading, setLoading] = useState(true);
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const checkTrigger = async () => {
            try {
                const params = new URLSearchParams();
                try {
                    const sessionRes = await fetch('/api/auth/session');
                    if (sessionRes.ok) {
                        const sessionData = await sessionRes.json();
                        if (sessionData?.user?.id) {
                            params.set('identifier', sessionData.user.id);
                            params.set('type', 'user');
                        }
                    }
                } catch { /* ignore */ }

                const qs = params.toString();
                const r = await fetch(`/api/24h-trigger/check${qs ? `?${qs}` : ''}`);
                const data = r.ok ? await r.json() : { active: false };
                setTrigger(data);
            } catch {
                setTrigger({ active: false });
            } finally {
                setLoading(false);
            }
        };
        checkTrigger();
    }, []);

    useEffect(() => {
        if (!trigger?.active || !trigger.expiresAt) return;
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, [trigger?.active, trigger?.expiresAt]);

    useEffect(() => {
        if (!trigger?.active) {
            window.dispatchEvent(new CustomEvent('triggerDiscount', {
                detail: { triggerType: null, triggerValue: 0 },
            }));
            return;
        }
        window.dispatchEvent(new CustomEvent('triggerDiscount', {
            detail: {
                triggerType: trigger.triggerType || null,
                triggerValue: trigger.triggerValue || 0,
            },
        }));
    }, [trigger, now]);

    if (loading || !trigger?.active) return null;

    const endMs = new Date(trigger.expiresAt!).getTime();
    const timeLeft = endMs - now;
    if (timeLeft <= 0) return null;

    const label = trigger.triggerType === 'free_delivery'
        ? 'Free Delivery'
        : trigger.triggerType === 'fixed_discount'
        ? `${trigger.triggerValue} Off`
        : `${trigger.triggerValue}% Off`;

    return (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
            <div className="p-1.5 rounded-lg bg-amber-100 shrink-0 mt-0.5">
                <Icon icon="solar:clock-circle-bold" width={16} className="text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-amber-800">
                    {trigger.title || 'Exclusive Offer'}
                </p>
                <p className="text-xs text-amber-600 mt-0.5">
                    {label} is active on your order!
                    {(trigger.reorderCount || 0) > 1 && (
                        <span className="ml-1 font-semibold">
                            (Reorder #{trigger.reorderCount} — bonus applied)
                        </span>
                    )}
                </p>
            </div>
            <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-semibold shrink-0 whitespace-nowrap">
                <Icon icon="solar:clock-circle-bold" width={12} className="inline mr-1" />
                {formatTimeLeft(timeLeft)}
            </span>
        </div>
    );
}
