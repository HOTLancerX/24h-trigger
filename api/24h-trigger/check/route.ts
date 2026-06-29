import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import TriggerCampaign from "@/plugin/24h-trigger/models/trigger-campaign";
import TriggerRecord from "@/plugin/24h-trigger/models/trigger-record";

export const dynamic = "force-dynamic";

function getClientIp(req: NextRequest): string {
    const forwarded = req.headers.get("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0].trim();
    return req.headers.get("x-real-ip") || "127.0.0.1";
}

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const identifier = req.nextUrl.searchParams.get("identifier");
        const identifierType = req.nextUrl.searchParams.get("type") || "guest";

        let resolvedId = identifier;
        if (!resolvedId || identifierType === "guest") {
            resolvedId = getClientIp(req);
        }

        if (!resolvedId) {
            return NextResponse.json({ active: false });
        }

        const campaign = await TriggerCampaign.findOne({ isActive: true }).lean();
        if (!campaign) {
            return NextResponse.json({ active: false });
        }

        const now = new Date();
        const record = await TriggerRecord.findOne({
            identifier: resolvedId,
            expiresAt: { $gt: now },
        }).sort({ createdAt: -1 }).lean();

        if (!record) {
            return NextResponse.json({ active: false });
        }

        const totalReorders = await TriggerRecord.countDocuments({
            identifier: resolvedId,
            expiresAt: { $gt: new Date(record.createdAt.getTime() - campaign.durationHours * 60 * 60 * 1000) },
        });

        const remainingMs = new Date(record.expiresAt).getTime() - now.getTime();

        let effectiveType = campaign.triggerType;
        let effectiveValue = campaign.triggerValue;

        if (campaign.bonusOnReorder && totalReorders > 1) {
            const bonusTimes = Math.min(totalReorders - 1, campaign.maxReorders);
            effectiveValue = campaign.triggerValue + (campaign.bonusValue * bonusTimes);
        }

        return NextResponse.json({
            active: true,
            triggerType: effectiveType,
            triggerValue: effectiveValue,
            expiresAt: record.expiresAt,
            remainingMs,
            reorderCount: totalReorders,
            title: campaign.title,
            offerMessage: campaign.offerMessage,
            bannerImage: campaign.bannerImage,
            bgColor: campaign.bgColor,
            textColor: campaign.textColor,
            countdownColor: campaign.countdownColor,
            bannerStyle: campaign.bannerStyle,
            bottomOffset: campaign.bottomOffset,
            sideOffset: campaign.sideOffset,
            bannerPosition: campaign.bannerPosition,
        });
    } catch (err) {
        console.error("24h-trigger check error:", err);
        return NextResponse.json({ active: false }, { status: 500 });
    }
}
