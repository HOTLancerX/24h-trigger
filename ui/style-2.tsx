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
    progress?: number;
}

export default function Style2({ title, offerLabel, offerMessage, bannerImage, bgColor, textColor, countdownColor, timeLeft, onDismiss }: StyleProps) {
    return (
        <div className="rounded-2xl shadow-2xl overflow-hidden" style={{ backgroundColor: bgColor, color: textColor }}>
            <div className="flex items-stretch">
                {bannerImage && (
                    <img src={bannerImage} alt={title} className="w-24 h-24 object-cover shrink-0" />
                )}
                <div className="flex-1 px-4 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-black leading-tight">{offerLabel}</p>
                        {offerMessage && (
                            <p className="text-[11px] opacity-75 mt-0.5 truncate">{offerMessage}</p>
                        )}
                    </div>
                    <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className="px-3 py-1 rounded-lg text-center"
                            style={{ backgroundColor: countdownColor, color: '#000' }}>
                            <p className="text-sm font-black leading-none">{timeLeft}</p>
                            <p className="text-[8px] font-bold opacity-70 uppercase mt-0.5">left</p>
                        </div>
                        <button onClick={onDismiss} className="opacity-60 hover:opacity-100 transition" aria-label="Dismiss">
                            <Icon icon="solar:close-circle-bold" width={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
