<script lang="ts">
    import type { SvgComponentProps } from "$lib/types";
    const { width, height,  class: className }: SvgComponentProps = $props();
</script>

<svg xmlns="http://www.w3.org/2000/svg" {width} {height} viewBox="0 -960 960 960" class={className}>
    <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/>
</svg>
