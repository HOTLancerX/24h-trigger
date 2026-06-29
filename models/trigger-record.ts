import mongoose, { Schema, type Document } from "mongoose";

export interface ITriggerRecord extends Document {
    identifier: string;
    identifierType: "user" | "guest";
    orderNumber: string;
    expiresAt: Date;
    reorderCount: number;
    createdAt: Date;
}

const TriggerRecordSchema = new Schema<ITriggerRecord>(
    {
        identifier: { type: String, required: true },
        identifierType: { type: String, enum: ["user", "guest"], required: true },
        orderNumber: { type: String, required: true },
        expiresAt: { type: Date, required: true },
        reorderCount: { type: Number, default: 0, min: 0 },
    },
    { timestamps: true }
);

TriggerRecordSchema.index({ identifier: 1, expiresAt: -1 });

export default (mongoose.models.TriggerRecord as mongoose.Model<ITriggerRecord>) ||
    mongoose.model<ITriggerRecord>("TriggerRecord", TriggerRecordSchema);
