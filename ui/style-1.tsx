'use client';

import { Icon } from '@iconify/react';

interface StyleProps {
    title: string;
    offerLabel: string;
    offerMessage: string;
    bannerImage: string;
    bgColor: string;
    textColor: string;
    countdownColor: string;
    timeLeft: string;
    onDismiss: () => void;
}

export default function Style1({ title, offerLabel, offerMessage, bannerImage, bgColor, textColor, countdownColor, timeLeft, onDismiss }: StyleProps) {
    return (
        <div className="rounded-2xl shadow-2xl overflow-hidden" style={{ backgroundColor: bgColor, color: textColor }}>
            {bannerImage && (
                <img src={bannerImage} alt={title} className="w-full h-32 object-cover" />
            )}
            <div className="px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-black leading-tight">{offerLabel}</p>
                        {offerMessage && (
                            <p className="text-xs opacity-80 mt-0.5 truncate">{offerMessage}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-bold whitespace-nowrap px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: countdownColor, color: '#000' }}>
                            <Icon icon="solar:clock-circle-bold" width={12} className="inline mr-0.5" />
                            {timeLeft}
                        </span>
                        <button onClick={onDismiss} className="opacity-60 hover:opacity-100 transition" aria-label="Dismiss">
                            <Icon icon="solar:close-circle-bold" width={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
