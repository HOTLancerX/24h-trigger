import { addHook, type PluginMeta } from "@/hook";
import TwentyFourHourTrigger from "./TwentyFourHourTrigger";
import TriggerBanner from "./TriggerBanner";
import TwentyFourHourTriggerSettings from "./settings/TwentyFourHourTriggerSettings";

export const PLUGINS: PluginMeta = {
    nx: "com.system.24h-trigger",
    name: "24h-trigger",
    version: "1.0.0",
    description: "Post-order 24-hour discount trigger — rewards returning customers with time-limited offers.",
    author: "System",
    path: "https://github.com/HOTLancerX/24h-trigger.git",
    icon: "bxs:offer",
    color: "from-amber-500 to-orange-600",
};

export function register() {
    addHook("admin.nav", [
        {
            key: "24h-trigger",
            label: "24h Trigger",
            icon: "arcticons:lien-viet-24h",
            slug: "24h-trigger",
            parent: "",
            position: 22,
        },
    ], PLUGINS.nx);

    addHook("admin.pages", [
        {
            key: "24h-trigger",
            label: "24h Trigger Settings",
            type: "24h-trigger-settings",
            style: "left",
            position: 37,
            path: TwentyFourHourTriggerSettings,
        },
    ], PLUGINS.nx);

    addHook("checkout.top", [
        {
            key: "24h-trigger",
            label: "24h Trigger",
            type: "",
            style: "left",
            position: 3,
            component: TwentyFourHourTrigger,
        },
    ], PLUGINS.nx);

    // ─── Root floating banner ────────────────────────────────────────────
    addHook("root.pages", [
        {
            key: "trigger-banner",
            label: "Trigger Banner",
            slug: "root",
            type: "",
            style: "left",
            position: 20,
            component: TriggerBanner,
        },
    ], PLUGINS.nx);
}
