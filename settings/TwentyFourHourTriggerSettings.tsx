'use client';

import { useState, useEffect, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { useToast } from '@/components/ui/Toast';
import Gallery from '@/components/Gallery';

interface TriggerCampaign {
    _id?: string;
    title: string;
    triggerType: 'free_delivery' | 'fixed_discount' | 'percentage_discount';
    triggerValue: number;
    durationHours: number;
    bonusOnReorder: boolean;
    bonusType: 'increase_percentage' | 'increase_fixed';
    bonusValue: number;
    maxReorders: number;
    isActive: boolean;
    offerMessage: string;
    bannerImage: string;
    bgColor: string;
    textColor: string;
    countdownColor: string;
    bannerStyle: 'style-1' | 'style-2' | 'style-3';
    bottomOffset: number;
    sideOffset: number;
    bannerPosition: 'left' | 'center' | 'right';
}

const DEFAULTS: TriggerCampaign = {
    title: 'Post-Order 24h Offer',
    triggerType: 'free_delivery',
    triggerValue: 0,
    durationHours: 24,
    bonusOnReorder: false,
    bonusType: 'increase_percentage',
    bonusValue: 0,
    maxReorders: 3,
    isActive: true,
    offerMessage: '',
    bannerImage: '',
    bgColor: '#fef3c7',
    textColor: '#92400e',
    countdownColor: '#f59e0b',
    bannerStyle: 'style-1',
    bottomOffset: 16,
    sideOffset: 16,
    bannerPosition: 'center',
};

export default function TwentyFourHourTriggerSettings() {
    const { success, error: toastError } = useToast();
    const [campaign, setCampaign] = useState<TriggerCampaign>(DEFAULTS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchCampaign = useCallback(async () => {
        try {
            const res = await fetch('/api/24h-trigger/settings');
            const data = await res.json();
            if (data.campaign) setCampaign({ ...DEFAULTS, ...data.campaign });
        } catch { /* silent */ } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchCampaign(); }, [fetchCampaign]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/24h-trigger/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(campaign),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed');
            setCampaign({ ...DEFAULTS, ...data.campaign });
            success('Settings saved.');
        } catch (e: any) {
            toastError(e.message || 'Failed to save.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 text-gray-400">
                <Icon icon="svg-spinners:ring-resize" width={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-bold text-gray-900">24h Trigger Settings</h1>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Campaign Title</label>
                        <input type="text" value={campaign.title}
                            onChange={(e) => setCampaign({ ...campaign, title: e.target.value })}
                            placeholder="e.g. Order Again — 24h Exclusive Offer"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Trigger Type</label>
                            <select value={campaign.triggerType}
                                onChange={(e) => setCampaign({ ...campaign, triggerType: e.target.value as any })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                                <option value="free_delivery">Free Delivery</option>
                                <option value="fixed_discount">Fixed Discount</option>
                                <option value="percentage_discount">Percentage Discount</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                {campaign.triggerType === 'percentage_discount' ? 'Percentage (%)' : 'Amount'}
                            </label>
                            <input type="number" value={campaign.triggerValue}
                                onChange={(e) => setCampaign({ ...campaign, triggerValue: parseFloat(e.target.value) || 0 })}
                                min={0} disabled={campaign.triggerType === 'free_delivery'}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-40" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Duration (hours)</label>
                        <input type="number" value={campaign.durationHours}
                            onChange={(e) => setCampaign({ ...campaign, durationHours: parseInt(e.target.value) || 24 })}
                            min={1} max={720}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                        <p className="text-[11px] text-gray-400 mt-1">How long the offer lasts after an order (1–720 hours)</p>
                    </div>

                    <div className="border-t pt-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-gray-700">Bonus on Reorder</p>
                                <p className="text-[11px] text-gray-400">Increase discount when the user orders again within the window</p>
                            </div>
                            <button type="button"
                                onClick={() => setCampaign({ ...campaign, bonusOnReorder: !campaign.bonusOnReorder })}
                                className={`relative w-11 h-6 rounded-full transition ${campaign.bonusOnReorder ? 'bg-amber-500' : 'bg-gray-300'}`}>
                                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition ${campaign.bonusOnReorder ? 'translate-x-5' : ''}`} />
                            </button>
                        </div>

                        {campaign.bonusOnReorder && (
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Bonus Type</label>
                                    <select value={campaign.bonusType}
                                        onChange={(e) => setCampaign({ ...campaign, bonusType: e.target.value as any })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                                        <option value="increase_percentage">Increase %</option>
                                        <option value="increase_fixed">Increase Amount</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Bonus Per Reorder</label>
                                    <input type="number" value={campaign.bonusValue}
                                        onChange={(e) => setCampaign({ ...campaign, bonusValue: parseFloat(e.target.value) || 0 })}
                                        min={0}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Max Reorders</label>
                                    <input type="number" value={campaign.maxReorders}
                                        onChange={(e) => setCampaign({ ...campaign, maxReorders: parseInt(e.target.value) || 1 })}
                                        min={1} max={20}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <button type="button"
                            onClick={() => setCampaign({ ...campaign, isActive: !campaign.isActive })}
                            className={`relative w-11 h-6 rounded-full transition ${campaign.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition ${campaign.isActive ? 'translate-x-5' : ''}`} />
                        </button>
                        <span className="text-sm font-medium text-gray-700">
                            {campaign.isActive ? 'Active' : 'Disabled'}
                        </span>
                    </div>
                </div>

                {/* Banner Display Settings */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
                    <h2 className="text-lg font-bold text-gray-900">Banner Display</h2>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Offer Message</label>
                        <input type="text" value={campaign.offerMessage}
                            onChange={(e) => setCampaign({ ...campaign, offerMessage: e.target.value })}
                            placeholder="e.g. Order within 24h for free delivery!"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Banner Image</label>
                        <Gallery
                            value={campaign.bannerImage}
                            onChange={(value) => setCampaign({ ...campaign, bannerImage: typeof value === 'string' ? value : '' })}
                            multiple={false}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Background Color</label>
                            <div className="flex items-center gap-2">
                                <input type="color" value={campaign.bgColor}
                                    onChange={(e) => setCampaign({ ...campaign, bgColor: e.target.value })}
                                    className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                                <input type="text" value={campaign.bgColor}
                                    onChange={(e) => setCampaign({ ...campaign, bgColor: e.target.value })}
                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Text Color</label>
                            <div className="flex items-center gap-2">
                                <input type="color" value={campaign.textColor}
                                    onChange={(e) => setCampaign({ ...campaign, textColor: e.target.value })}
                                    className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                                <input type="text" value={campaign.textColor}
                                    onChange={(e) => setCampaign({ ...campaign, textColor: e.target.value })}
                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Countdown Color</label>
                            <div className="flex items-center gap-2">
                                <input type="color" value={campaign.countdownColor}
                                    onChange={(e) => setCampaign({ ...campaign, countdownColor: e.target.value })}
                                    className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                                <input type="text" value={campaign.countdownColor}
                                    onChange={(e) => setCampaign({ ...campaign, countdownColor: e.target.value })}
                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Banner Style</label>
                            <select value={campaign.bannerStyle}
                                onChange={(e) => setCampaign({ ...campaign, bannerStyle: e.target.value as any })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                                <option value="style-1">Style 1</option>
                                <option value="style-2">Style 2</option>
                                <option value="style-3">Style 3 (with progress)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Position</label>
                            <select value={campaign.bannerPosition}
                                onChange={(e) => setCampaign({ ...campaign, bannerPosition: e.target.value as any })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                            </select>
                        </div>
                        <div></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Bottom Offset (px)</label>
                            <input type="number" value={campaign.bottomOffset}
                                onChange={(e) => setCampaign({ ...campaign, bottomOffset: parseInt(e.target.value) || 16 })}
                                min={0} max={200}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Side Offset (px)</label>
                            <input type="number" value={campaign.sideOffset}
                                onChange={(e) => setCampaign({ ...campaign, sideOffset: parseInt(e.target.value) || 16 })}
                                min={0} max={200}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                        </div>
                    </div>
                </div>
            </div>
            <button onClick={handleSave} disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition disabled:opacity-50">
                {saving ? 'Saving…' : 'Save Settings'}
            </button>
        </div>
    );
}
