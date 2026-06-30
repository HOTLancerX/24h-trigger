import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Setting from "@/models/settings";
import { getCollection } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

function getClientIp(req: NextRequest): string {
    const forwarded = req.headers.get("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0].trim();
    return req.headers.get("x-real-ip") || "127.0.0.1";
}

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

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        // Get campaign config from global settings
        const doc = await Setting.findOne({ title: "24h_trigger_config" }).lean();
        const config = doc?.content ? { ...DEFAULTS, ...(typeof doc.content === "string" ? JSON.parse(doc.content) : doc.content) } : DEFAULTS;

        if (!config.isActive) {
            return NextResponse.json({ active: false });
        }

        // Resolve identifier
        const identifier = req.nextUrl.searchParams.get("identifier");
        const identifierType = req.nextUrl.searchParams.get("type") || "guest";

        let resolvedId = identifier;
        if (!resolvedId || identifierType === "guest") {
            resolvedId = getClientIp(req);
        }

        if (!resolvedId) {
            return NextResponse.json({ active: false });
        }

        // Query Order collection directly
        const orders = await getCollection("orders");

        // Find the most recent order for this user
        const matchFilter: any = identifierType === "user"
            ? { userId: resolvedId }
            : { "metadata.ipAddress": resolvedId };

        const recentOrder = await orders
            .findOne(matchFilter, { sort: { createdAt: -1 } });

        if (!recentOrder) {
            return NextResponse.json({ active: false });
        }

        // Check if within the trigger window
        const orderTime = new Date(recentOrder.createdAt).getTime();
        const durationMs = config.durationHours * 60 * 60 * 1000;
        const expiresAt = orderTime + durationMs;
        const now = Date.now();

        if (now > expiresAt) {
            return NextResponse.json({ active: false });
        }

        // Count total orders within the window for bonus calculation
        const windowStart = new Date(orderTime);
        const totalOrders = await orders.countDocuments({
            ...matchFilter,
            createdAt: { $gte: windowStart },
        });

        // Calculate effective discount with bonus
        let effectiveType = config.triggerType;
        let effectiveValue = config.triggerValue;

        if (config.bonusOnReorder && totalOrders > 1) {
            const bonusTimes = Math.min(totalOrders - 1, config.maxReorders);
            effectiveValue = config.triggerValue + (config.bonusValue * bonusTimes);
        }

        const remainingMs = expiresAt - now;

        return NextResponse.json({
            active: true,
            triggerType: effectiveType,
            triggerValue: effectiveValue,
            expiresAt: new Date(expiresAt).toISOString(),
            remainingMs,
            reorderCount: totalOrders,
            title: config.title,
            offerMessage: config.offerMessage,
            bannerImage: config.bannerImage,
            bgColor: config.bgColor,
            textColor: config.textColor,
            countdownColor: config.countdownColor,
            bannerStyle: config.bannerStyle,
            bottomOffset: config.bottomOffset,
            sideOffset: config.sideOffset,
            bannerPosition: config.bannerPosition,
        });
    } catch (err) {
        console.error("24h-trigger check error:", err);
        return NextResponse.json({ active: false }, { status: 500 });
    }
}
