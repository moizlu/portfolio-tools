<script lang="ts">
	import { page } from '$app/state';
    import { resolve } from "$app/paths";
    import { getLocale } from '$lib/paraglide/runtime';
    import { m } from '$lib/paraglide/messages';

    const errorMessageJp: Record<number, string> = {
        404: "ページが見つかりませんでした。",
        500: "サーバー側でエラーが発生しました。"
    }
</script>

<main class="w-full h-full flex flex-col justify-center items-center">
    <div class="p-5 flex flex-col justify-center items-center gap-0 md:gap-5 rounded-lg bg-base/70 backdrop-blur-sm">
        <h1 class="font-extrabold text-9xl">{page.status}</h1>
        <h1 class="text-3xl md:text-5xl">{page.error?.message}</h1>

        {#if getLocale() === "ja" && page.status in errorMessageJp}
            <p class="font-medium text-sm sm:text-lg md:text-3xl">{errorMessageJp[page.status]}</p>
        {/if}

        <a href={resolve("/")} data-sveltekit-reload class="p-4 button-general button-label">
            <h3>{m.return_to_home()}</h3>
        </a>
    </div>
</main>
