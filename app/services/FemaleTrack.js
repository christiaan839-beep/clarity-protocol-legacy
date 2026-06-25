/**
 * ═══════════════════════════════════════════════════════════════
 * FEMALE TRACK: PHASIC FLOW (28D LOGIC)
 * ═══════════════════════════════════════════════════════════════
 */

import { SovereignData } from './SovereignData.js';

let FEMALE_ENGINE = { seasons: {} };

try {
    const response = await fetch('data/female_phasic.json');
    if (response.ok) {
        FEMALE_ENGINE = await response.json();
    } else {
        console.error(`Failed to load female_phasic.json: ${response.status}`);
    }
} catch (e) {
    console.error("Failed to load female_phasic.json", e);
}

export const FemaleTrack = {
    getCycleDay() {
        const startStr = SovereignData.get('cycle_start_date');
        if (!startStr) return 1; // Default to Day 1
        const start = new Date(startStr);
        const now = new Date();
        const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
        if (diff < 0) return 1;
        return (diff % 28) + 1;
    },

    getCurrentPhase() {
        const day = this.getCycleDay();
        if (FEMALE_ENGINE && FEMALE_ENGINE.seasons) {
            for (const [key, season] of Object.entries(FEMALE_ENGINE.seasons)) {
                if (day >= season.days[0] && day <= season.days[1]) {
                    season.key = key;
                    return season;
                }
            }
        }
        // Fallback
        return FEMALE_ENGINE?.seasons?.autumn || {
            phase: "Unknown",
            key: "unknown",
            bio_state: "Unknown",
            protocols: { allowed: [], forbidden: [], nutrition_focus: "" }
        };
    },

    getBioState() {
        const phase = this.getCurrentPhase();
        const seasonName = phase.key ? phase.key.toUpperCase() : "UNKNOWN";
        const phaseName = phase.phase || "";
        return `${seasonName} (${phaseName}) (Day ${this.getCycleDay()})`;
    },

    getDailyProtocol() {
        const phase = this.getCurrentPhase();
        const day = this.getCycleDay();
        const protocols = phase.protocols || {};

        const allowed = Array.isArray(protocols.allowed) ? protocols.allowed.join(", ") : protocols.allowed;
        const forbidden = Array.isArray(protocols.forbidden) ? protocols.forbidden.join(", ") : protocols.forbidden;

        let moveItem = {
            id: "f_2",
            type: "move",
            text: `Movement: ${allowed} (Focus: ${phase.training_logic || 'Standard'})`,
            completed: false
        };

        let foodItem = {
            id: "f_3",
            type: "digest",
            text: `Nutrition: ${phase.nutrition_logic || 'Standard'} (Focus: ${protocols.nutrition_focus || 'Balanced'})`,
            completed: false
        };

        if (forbidden && forbidden.length > 0) {
            moveItem.text += ` (NO ${forbidden})`;
        }

        return [
            {
                phase: "MORNING",
                items: [
                    { id: "f_1", type: "bio", text: `Sync: Date ${day}/28 (${phase.bio_state})`, completed: false },
                    moveItem,
                    foodItem
                ]
            },
            {
                phase: "EVENING",
                items: [
                    { id: "f_4", type: "recovery", text: "Hormone Support: Magnesium", completed: false }
                ]
            }
        ];
    },

    setCycleStart(date) {
        SovereignData.set('cycle_start_date', date);
        // Trigger generic update if needed
    },

    getTruthArtifact() {
        return {
            title: "The Infradian Truth",
            text: "You are not a small man. HIIT in Luteal phase steals from Progesterone, causing burnout. Match intensity to biology."
        };
    }
};
