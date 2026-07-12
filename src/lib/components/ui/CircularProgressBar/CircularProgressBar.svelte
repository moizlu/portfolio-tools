<script lang="ts">
    import type { Snippet } from "svelte";
    import type { ClassValue } from "svelte/elements";

    interface Props {
        progress: number;
        progressBarClass?: ClassValue;
        children?: Snippet;
    }
    const { progress, progressBarClass = "stroke-main", children }: Props = $props();

    let progressBarEl: SVGCircleElement | undefined = $state(undefined);

    $effect(() => {
        if (!progressBarEl) { return; }
        const dashoffset = 628 * progress;
        progressBarEl.style.strokeDashoffset = `${dashoffset}`;
    });
</script>

<div class="relative w-60 h-60">
    <svg class="w-full h-full -rotate-90">
        <circle class="progress-background" cx={(60 * 4) / 2} cy={(60 * 4) / 2} r={100}></circle>
        <circle bind:this={progressBarEl} class={["progress-bar", progressBarClass]} cx={(60 * 4) / 2} cy={(60 * 4) / 2} r={100}></circle>
    </svg>

    <div class="absolute top-0 left-0 w-full h-full">
        {@render children?.()}
    </div>
</div>

<style>
    @reference "src/routes/layout.css";

    .progress-background {
        @apply fill-transparent stroke-5 stroke-label;
    }

    .progress-bar {
        @apply transition-all duration-500 fill-transparent stroke-20;

        stroke-linecap: round;
        stroke-dasharray: calc((50 * 4) * 3.14);
        stroke-dashoffset: 314;
    }
</style>
