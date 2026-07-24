<script lang="ts">
    import type { SvgComponentProps } from "$lib/types";
    const { width, height, class: className }: SvgComponentProps = $props();
</script>

<svg xmlns="http://www.w3.org/2000/svg" {width} {height} viewBox="0 -960 960 960" class={className}>
    <path d="M120-160q-33 0-56.5-23.5T40-240v-480q0-33 23.5-56.5T120-800h720q33 0 56.5 23.5T920-720v480q0 33-23.5 56.5T840-160H120Zm0-80h720v-480H120v480Zm280-80h280q17 0 28.5-11.5T720-360v-160q0-17-11.5-28.5T680-560H400q-17 0-28.5 11.5T360-520v160q0 17 11.5 28.5T400-320Z"/>
</svg>
