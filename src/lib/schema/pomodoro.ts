import { z } from "zod";

import { PomodoroType } from "$lib/types";

export const schema = z.object({
    // session: z.enum(PomodoroType.SessionList),
    elapsedSec: z.number(),
    stateTransCount: z.number().min(1),
    longBreakInterval: z.number().min(1).max(99),
    volume: z.number().min(0).max(1),
    sendNotification: z.boolean(),

    sessionSec: z.object<Record<PomodoroType.Session, z.ZodNumber>>({
        "working": z.number().min(1 * 60).max(99 * 60),
        "short-breaking": z.number().min(1 * 60).max(99 * 60),
        "long-breaking": z.number().min(1 * 60).max(99 * 60)
    })
});

export const DefaultValues: z.infer<typeof schema> = {
    // session: "working",
    elapsedSec: 0,
    stateTransCount: 1,
    longBreakInterval: 4,
    volume: 0.5,
    sendNotification: false,

    sessionSec: {
        "working": 25 * 60,
        "short-breaking": 5 * 60,
        "long-breaking": 15 * 60
    }
}
