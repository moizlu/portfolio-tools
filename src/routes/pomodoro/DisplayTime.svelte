<script lang="ts">
    import { onMount } from "svelte";

    interface Props {
        str: {
            min: string;
            sec: string;
        };
        int: {
            min: number;
            sec: number;
        }
    }
    const { str, int }: Props = $props();

    let timerColonEl: HTMLSpanElement | undefined = $state(undefined);
    let timerColonAnimation: Animation | undefined = $state(undefined);
    let lastSec: string | undefined = $state(undefined);

    $effect(() => {
        if (!timerColonAnimation) { return; }

        if (lastSec !== undefined && lastSec === str.sec) {
            return;
        }

        lastSec = str.sec;

        // timerColonAnimation.cancel();
        timerColonAnimation.play();
    });

    onMount(() => {
        if (!timerColonEl) { return; }

        timerColonAnimation = timerColonEl.animate([
            { opacity: 1, offset: 0.0 }, 
            { opacity: 0, offset: 0.5 }, 
            { opacity: 1, offset: 1.0 }, 
        ],
        {
            duration: 800,
            easing: 'ease',
            iterations: 1,
            fill: 'backwards'
        });

        timerColonAnimation.pause();
    })
</script>

<p class="h-full flex justify-center items-center text-6xl font-bold">
    {(int.min > 0) ? str.min : "00"}<span bind:this={timerColonEl} class="timer-colon">:</span>{(int.sec > 0) ? str.sec : "00"}
</p>

<style>
    @reference "src/routes/layout.css";

    @keyframes opacity-20-80 {
        20%, 80% {
            opacity: 1;
        }

        50% {
            opacity: 0;
        }
    }

    .timer-colon {
        animation: 1s ease-in-out 1 both paused opacity-20-80;
    }
</style>
