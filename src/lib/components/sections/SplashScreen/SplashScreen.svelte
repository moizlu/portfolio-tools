<script lang="ts">
    import { onMount } from "svelte";

    import WarningIcon from "$lib/assets/icons/warning.svelte";

    import { splashStore } from "$lib/stores";

    import SvgIcon from "$lib/components/ui/SvgIcon";
    import LoadingAnimation from "$lib/components/ui/LoadingAnimation";

    onMount(() => {
        // splashStates.appeared = false;
        setTimeout(() => {
            splashStore.appeared = false;
        }, 300);
    });
</script>

<div class={["z-10000 transition-all duration-400 fixed top-0 left-0 w-full h-full bg-base flex flex-col justify-center items-center gap-4", (!splashStore.appeared) && "motion-safe:translate-x-100 opacity-0 pointer-events-none"]}>
    <LoadingAnimation />

    <p class="ml-8 text-2xl font-thin">Now Loading
        <span class="loading-text-dot">.</span>
        <span class="loading-text-dot">.</span>
        <span class="loading-text-dot">.</span>
    </p>

    <div class="slow-loading-caution flex flex-col justify-center items-center gap-2">
        <div class="-mb-3 w-fit h-fit caution-icon">
            <SvgIcon Svg={WarningIcon} size={50} />
        </div>

        <p>読み込みに時間がかかっています。<br>インターネット接続を確認し、再読み込みしてみてください。</p>
        <p>It's taking a while to load.<br>Please check your internet connection and try again.</p>
    </div>
</div>

<style>
    @reference "../../../../routes/layout.css";

    @layer components {
        @keyframes opacity-20-80 {
            20%, 80% {
                opacity: 1;
            }

            50% {
                opacity: 0;
            }
        }

        @keyframes slow-loading-caution {
            from {
                opacity: 0;
            }

            to {
                opacity: 1;
            }
        }

        .loading-text-dot {
            @apply font-normal -ml-0.5;
            animation: 1s ease-in-out infinite both opacity-20-80;
        }
        .loading-text-dot:nth-child(2) { animation-delay: 100ms; }
        .loading-text-dot:nth-child(3) { animation-delay: 200ms; }

        .slow-loading-caution {
            @apply text-xs text-center;
            animation: 200ms ease-in-out 5s 1 both slow-loading-caution;
        }

        .caution-icon {
            animation: 2s ease-in-out infinite both opacity-20-80;
        }
    }
</style>
