<script lang="ts">
    import type { SvgComponentProps } from "$lib/types";
    const { width, height,  class: className }: SvgComponentProps = $props();
</script>

<svg xmlns="http://www.w3.org/2000/svg" {width} {height} viewBox="0 -960 960 960" class={className}>
    <path d="m 75.5,-315.5 400,-400 400,400 -71,71 -329,-329 -329,329 z" />
</svg>
