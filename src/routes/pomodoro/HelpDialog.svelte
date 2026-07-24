<script lang="ts">
    import { m } from "$lib/paraglide/messages";
    import ArrowIcon from "$lib/assets/icons/arrow.svelte";
    import PlayIcon from "$lib/assets/icons/play.svelte";
    import ResetIcon from "$lib/assets/icons/reset.svelte";
    import SvgIcon from "$lib/components/ui/SvgIcon";
</script>

<div class="w-full h-full pt-15 p-2 flex text-xs">
    <div class="w-full grid grid-rows-2 grid-cols-3 place-items-center gap-5">
        <div class="p-2 w-fit h-fit rounded-lg shadow-black shadow-md/50"><SvgIcon Svg={ArrowIcon} size={27} class="rotate-270" /></div>
        <SvgIcon Svg={PlayIcon} size={60} class="w-15 h-15 p-2 rounded-lg bg-label shadow-black shadow-md/50 text-base" />
        <SvgIcon Svg={ResetIcon} size={40} class="p-2 rounded-lg shadow-black shadow-md/50" />

        <p>{m.sunny_plane_opossum_expand()}</p>
        <p>{m.play_pause()}</p>
        <p>{m.reset_everything()}</p>
    </div>
</div>
