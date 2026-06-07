import type { ClassValue } from "svelte/elements";
import type { Component } from "svelte";

export interface SvgComponentProps {
    width: number;
    height: number;
    class: ClassValue;
}

export type SvgComponent = Component<SvgComponentProps>;

export type AppName = "counter" | "pomodoro";
