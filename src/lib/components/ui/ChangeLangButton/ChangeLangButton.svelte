<script lang="ts">
    import { getLocale, setLocale } from "$lib/paraglide/runtime";
    import { m } from "$lib/paraglide/messages";

    const textStyle = "h-10 flex justify-center items-center"

    const activeLocale = getLocale();
    const activeLocaleStyle = "relative font-bold text-label after:content-[''] after:absolute after:bottom-1 after:w-5 after:h-[1px] after:bg-label"
    const inactiveLocaleStyle = "font-light text-label/70 group-hover:text-label group-hover:font-normal duration-200";

    const onclick = () => {
        setLocale((activeLocale === "ja") ? "en" : "ja");
    }
</script>

<!-- <button {onclick} class="relative text-2xl cursor-pointer flex justify-center items-center">
        <p class={[activeLocale === "ja" ? activeLocaleStyle : inactiveLocaleStyle, "w-13"]}>JP</p>
        <p class="absolute -top-1 left-[40%] text-4xl">/</p>
        <p class={[activeLocale === "en" ? activeLocaleStyle : inactiveLocaleStyle, "w-13"]}>EN</p>
</button> -->

<button title={m.switch_language()} {onclick} class="group cursor-pointer text-label">
    <div class="text-2xl flex justify-center items-center">
    <p class="text-2xl flex justify-center items-center">
        <!-- <span class="w-8 h-10 flex justify-center items-center mt-0.5 border-b-2">JP</span> -->
        <span class={[textStyle, activeLocale === "ja" ? activeLocaleStyle : inactiveLocaleStyle, "w-10 mb-1"]}>JP</span>
        <span class="w-px h-5 bg-label"></span>
        <span class={[textStyle, activeLocale === "en" ? activeLocaleStyle : inactiveLocaleStyle, "w-10 mb-1"]}>EN</span>
    </p>
    </div>
</button>
