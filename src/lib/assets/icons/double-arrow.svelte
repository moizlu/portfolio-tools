<script lang="ts">
    import type { SvgComponentProps } from "$lib/types";
    const { width, height,  class: className }: SvgComponentProps = $props();
</script>

<svg xmlns="http://www.w3.org/2000/svg" {width} {height} viewBox="0 -960 960 960" class={className}>
  <path d="M 790,-212 510,-412 230,-212 v -98 l 280,-200 280,200 z m 0,-238 -280,-200 -280,200 v -98 l 280,-200 280,200 z" />
</svg>
