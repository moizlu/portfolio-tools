<script lang="ts">
    import LightIcon from "$lib/assets/icons/theme-light.svelte";
    import DarkIcon from "$lib/assets/icons/theme-dark.svelte";

    import { m } from "$lib/paraglide/messages";

    import { theme } from "$lib/stores";

    import SvgIcon from "../SvgIcon";

    const onclick = () => {
        if (theme.theme === "light") {
            theme.theme = "dark";
        } else {
            theme.theme = "light";
        }
    }
</script>

<button {onclick} class="group cursor-pointer relative w-7.5 h-7.5 overflow-clip">
    <div title={m.switch_theme()} class={["transition-all duration-300 absolute w-full top-0 left-0 flex flex-col justify-center items-center", (theme.theme === "light") && "-translate-y-7.5"]}>
        <SvgIcon Svg={DarkIcon} size={30} class="stroke-30 stroke-label fill-transparent group-hover:fill-label group-hover:stroke-transparent group-active:fill-label group-active:stroke-transparent" />
        <SvgIcon Svg={LightIcon} size={30} class="stroke-30 stroke-label fill-transparent group-hover:fill-label group-hover:stroke-transparent group-active:fill-label group-active:stroke-transparent" />
    </div>
</button>
