import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import TriggerCampaign from "@/plugin/24h-trigger/models/trigger-campaign";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        await connectDB();
        let campaign = await TriggerCampaign.findOne().sort({ createdAt: -1 }).lean();

        if (campaign) {
            const defaults = {
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
            let patched = false;
            for (const [key, val] of Object.entries(defaults)) {
                if ((campaign as any)[key] === undefined) {
                    (campaign as any)[key] = val;
                    patched = true;
                }
            }
            if (patched) {
                await TriggerCampaign.findByIdAndUpdate(campaign._id, { $set: defaults }, { new: false });
            }
        }

        return NextResponse.json({ campaign: campaign || null });
    } catch (err) {
        console.error("TriggerCampaign GET error:", err);
        return NextResponse.json({ campaign: null }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const existing = await TriggerCampaign.findOne().lean();

        if (existing) {
            const campaign = await TriggerCampaign.findByIdAndUpdate(
                existing._id,
                {
                    $set: {
                        title: body.title,
                        triggerType: body.triggerType,
                        triggerValue: body.triggerValue,
                        durationHours: body.durationHours,
                        bonusOnReorder: body.bonusOnReorder,
                        bonusType: body.bonusType,
                        bonusValue: body.bonusValue,
                        maxReorders: body.maxReorders,
                        isActive: body.isActive,
                        offerMessage: body.offerMessage ?? "",
                        bannerImage: body.bannerImage ?? "",
                        bgColor: body.bgColor ?? "#fef3c7",
                        textColor: body.textColor ?? "#92400e",
                        countdownColor: body.countdownColor ?? "#f59e0b",
                        bannerStyle: body.bannerStyle ?? "style-1",
                        bottomOffset: body.bottomOffset ?? 16,
                        sideOffset: body.sideOffset ?? 16,
                        bannerPosition: body.bannerPosition ?? "center",
                    },
                },
                { new: true }
            ).lean();
            return NextResponse.json({ campaign });
        }

        const campaign = await TriggerCampaign.create({
            title: body.title || "Post-Order 24h Offer",
            triggerType: body.triggerType || "free_delivery",
            triggerValue: body.triggerValue ?? 0,
            durationHours: body.durationHours ?? 24,
            bonusOnReorder: body.bonusOnReorder ?? false,
            bonusType: body.bonusType || "increase_percentage",
            bonusValue: body.bonusValue ?? 0,
            maxReorders: body.maxReorders ?? 3,
            isActive: body.isActive !== false,
            offerMessage: body.offerMessage || "",
            bannerImage: body.bannerImage || "",
            bgColor: body.bgColor || "#fef3c7",
            textColor: body.textColor || "#92400e",
            countdownColor: body.countdownColor || "#f59e0b",
            bannerStyle: body.bannerStyle || "style-1",
            bottomOffset: body.bottomOffset ?? 16,
            sideOffset: body.sideOffset ?? 16,
            bannerPosition: body.bannerPosition || "center",
        });

        return NextResponse.json({ campaign }, { status: 201 });
    } catch (err) {
        console.error("TriggerCampaign POST error:", err);
        return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }
}
