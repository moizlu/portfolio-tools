import { m } from "$lib/paraglide/messages";

export type Session = "working" | "short-breaking" | "long-breaking";

export const SessionList: Session[] = [
    "working",
    "short-breaking",
    "long-breaking"
] as const;

export const SessionNames: Record<Session, string> = {
    "working": m.session_focus(),
    "short-breaking": m.session_short_break(),
    "long-breaking": m.session_long_break()
}
