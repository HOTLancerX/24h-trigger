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

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const { orderNumber, identifierType } = body;

        if (!orderNumber) {
            return NextResponse.json({ error: "orderNumber is required" }, { status: 400 });
        }

        const campaign = await TriggerCampaign.findOne({ isActive: true }).lean();
        if (!campaign) {
            return NextResponse.json({ triggered: false });
        }

        let identifier = body.identifier;
        if (!identifier || identifierType === "guest") {
            identifier = getClientIp(req);
        }

        const now = new Date();
        const expiresAt = new Date(now.getTime() + campaign.durationHours * 60 * 60 * 1000);

        const existing = await TriggerRecord.findOne({
            identifier,
            expiresAt: { $gt: now },
        }).lean();

        if (existing) {
            return NextResponse.json({ triggered: true, expiresAt: existing.expiresAt });
        }

        await TriggerRecord.create({
            identifier,
            identifierType: identifierType || "guest",
            orderNumber,
            expiresAt,
            reorderCount: 0,
        });

        return NextResponse.json({ triggered: true, expiresAt });
    } catch (err) {
        console.error("24h-trigger activate error:", err);
        return NextResponse.json({ error: "Failed to activate trigger" }, { status: 500 });
    }
}
