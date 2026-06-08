import type { Snippet, Component } from "svelte";

export const isComponent = (contents: Snippet | Component | undefined): contents is Component => {
    return (contents !== undefined) && ('element' in contents);
}

export const calcDateAfterMs = (ms: number) => {
    const now = Date.now();

    console.log(new Date())

    return new Date(now + ms);
}
