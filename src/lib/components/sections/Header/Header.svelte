<script lang="ts">
    import ToolsIcon from "$lib/assets/icons/tools.svelte";
    import ChangeLangButton from "$lib/components/ui/ChangeLangButton";
    import ChangeThemeButton from "$lib/components/ui/ChangeThemeButton";

    import { resolve } from "$app/paths";
    import { m } from "$lib/paraglide/messages";

    import SvgIcon from "$lib/components/ui/SvgIcon";
</script>

<header class="fixed top-0 left-0 px-2 w-full h-15 bg-base/50 backdrop-blur-sm flex justify-between items-center">
    <a href={resolve("/")} class="flex justify-center items-center">
        <SvgIcon Svg={ToolsIcon} size={40} />
        <p>{m.tools()}</p>
    </a>

    <div class="flex justify-center items-center gap-2">
        <ChangeLangButton />
        <div class="w-[0.5px] h-10 bg-label"></div>
        <ChangeThemeButton />
    </div>
</header>
