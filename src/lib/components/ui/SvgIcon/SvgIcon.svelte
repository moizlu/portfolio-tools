<script lang="ts">
    import type { ClassValue } from "svelte/elements";

    import type { SvgComponent } from "$lib/types";

    export interface Props {
        Svg: SvgComponent;
        size: number | { width: number, height: number };
        class?: ClassValue;
    }
    const { Svg, size, class: className }: Props = $props();
</script>

<Svg width={(typeof size === "number") ? size : size.width} height={typeof size === "number" ? size : size.height} class={[className, "fill-current"]} />
