import mongoose, { Schema, type Document } from "mongoose";

export interface ITriggerCampaign extends Document {
    title: string;
    triggerType: "free_delivery" | "fixed_discount" | "percentage_discount";
    triggerValue: number;
    durationHours: number;
    bonusOnReorder: boolean;
    bonusType: "increase_percentage" | "increase_fixed";
    bonusValue: number;
    maxReorders: number;
    isActive: boolean;
    offerMessage: string;
    bannerImage: string;
    bgColor: string;
    textColor: string;
    countdownColor: string;
    bannerStyle: "style-1" | "style-2" | "style-3";
    bottomOffset: number;
    sideOffset: number;
    bannerPosition: "left" | "center" | "right";
    createdAt: Date;
    updatedAt: Date;
}

const TriggerCampaignSchema = new Schema<ITriggerCampaign>(
    {
        title: { type: String, required: true, default: "Post-Order 24h Offer" },
        triggerType: { type: String, enum: ["free_delivery", "fixed_discount", "percentage_discount"], default: "free_delivery" },
        triggerValue: { type: Number, default: 0, min: 0 },
        durationHours: { type: Number, default: 24, min: 1 },
        bonusOnReorder: { type: Boolean, default: false },
        bonusType: { type: String, enum: ["increase_percentage", "increase_fixed"], default: "increase_percentage" },
        bonusValue: { type: Number, default: 0, min: 0 },
        maxReorders: { type: Number, default: 3, min: 1 },
        isActive: { type: Boolean, default: true },
        offerMessage: { type: String, default: "" },
        bannerImage: { type: String, default: "" },
        bgColor: { type: String, default: "#fef3c7" },
        textColor: { type: String, default: "#92400e" },
        countdownColor: { type: String, default: "#f59e0b" },
        bannerStyle: { type: String, enum: ["style-1", "style-2", "style-3"], default: "style-1" },
        bottomOffset: { type: Number, default: 16 },
        sideOffset: { type: Number, default: 16 },
        bannerPosition: { type: String, enum: ["left", "center", "right"], default: "center" },
    },
    { timestamps: true }
);

export default (mongoose.models.TriggerCampaign as mongoose.Model<ITriggerCampaign>) ||
    mongoose.model<ITriggerCampaign>("TriggerCampaign", TriggerCampaignSchema);
