import type { Snippet, Component } from "svelte";

export const isComponent = (contents: Snippet | Component | undefined): contents is Component => {
    return (contents !== undefined) && ('element' in contents);
}
