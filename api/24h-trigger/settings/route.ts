import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Setting from "@/models/settings";

export const dynamic = "force-dynamic";

const SETTINGS_KEY = "24h_trigger_config";

const DEFAULTS = {
    title: "Post-Order 24h Offer",
    triggerType: "free_delivery",
    triggerValue: 0,
    durationHours: 24,
    bonusOnReorder: false,
    bonusType: "increase_percentage",
    bonusValue: 0,
    maxReorders: 3,
    isActive: true,
    offerMessage: "",
    bannerImage: "",
    bgColor: "#fef3c7",
    textColor: "#92400e",
    countdownColor: "#f59e0b",
    bannerStyle: "style-1",
    bottomOffset: 16,
    sideOffset: 16,
    bannerPosition: "center",
};

export async function GET() {
    try {
        await connectDB();
        const doc = await Setting.findOne({ title: SETTINGS_KEY }).lean();
        const config = doc?.content ? { ...DEFAULTS, ...(typeof doc.content === "string" ? JSON.parse(doc.content) : doc.content) } : DEFAULTS;
        return NextResponse.json({ campaign: config });
    } catch (err) {
        console.error("24h-trigger settings GET error:", err);
        return NextResponse.json({ campaign: DEFAULTS }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const config = { ...DEFAULTS, ...body };

        await Setting.findOneAndUpdate(
            { title: SETTINGS_KEY },
            { $set: { content: JSON.stringify(config) } },
            { upsert: true }
        );

        return NextResponse.json({ campaign: config });
    } catch (err) {
        console.error("24h-trigger settings POST error:", err);
        return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }
}
