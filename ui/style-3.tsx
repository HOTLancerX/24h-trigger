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

export default function Style3({ title, offerLabel, offerMessage, bannerImage, bgColor, textColor, countdownColor, timeLeft, onDismiss, progress = 100 }: StyleProps) {
    return (
        <div className="rounded-full shadow-2xl overflow-hidden flex items-center gap-0 relative"
            style={{ backgroundColor: bgColor, color: textColor }}>
            {bannerImage && (
                <img src={bannerImage} alt={title} className="w-10 h-10 rounded-full object-cover shrink-0 ml-0.5" />
            )}
            <div className="flex-1 px-4 py-2 flex items-center gap-3 min-w-0">
                <div className="flex-1 min-w-0">
                    {offerMessage ? (
                        <p className="text-xs font-black leading-tight truncate">{offerMessage}</p>
                    ) : (
                        <p className="text-xs font-black leading-tight truncate">{offerLabel}</p>
                    )}
                </div>
                <span className="text-[10px] font-black whitespace-nowrap px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: countdownColor, color: '#000' }}>
                    <Icon icon="solar:clock-circle-bold" width={10} className="inline mr-0.5" />
                    {timeLeft}
                </span>
            </div>
            <button onClick={onDismiss} className="pr-3 opacity-60 hover:opacity-100 transition shrink-0" aria-label="Dismiss">
                <Icon icon="solar:close-circle-bold" width={16} />
            </button>
            <div className="h-1 w-full absolute bottom-0 left-0 right-0">
                <div className="h-full" style={{ backgroundColor: countdownColor, width: `${progress}%`, opacity: 0.5 }} />
            </div>
        </div>
    );
}
