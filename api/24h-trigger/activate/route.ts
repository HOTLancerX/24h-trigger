import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    // Activation is no longer needed — orders are checked directly from the Order collection.
    // This endpoint exists for backward compatibility with existing checkout code.
    return NextResponse.json({ triggered: true });
}
