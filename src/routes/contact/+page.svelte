<script lang="ts">
    import { getLocale } from "$lib/paraglide/runtime";
    import { m } from "$lib/paraglide/messages";
</script>

<svelte:head>
    <title>{m.contact_me()} | moizlu</title>
</svelte:head>

<main class="w-full flex flex-col justify-center items-center gap-5 text-center">
    {#if getLocale() === "ja"}
        <h1>ご意見・ご感想等ありましたら、<br class="md:hidden">こちらよりお気軽にご連絡ください。</h1>
    {:else}
        <h1>If you have any comments or feedback,<br>please feel free to contact me here.</h1>
    {/if}
    <a target="_blank" href="https://moiz.lu/contact" class="p-4 button-general button-label">{m.contact_me()} ↗</a>
</main>
