<script lang="ts">
    import { m } from "$lib/paraglide/messages";
    import { pomodoro } from "$lib/stores";
    import { modalWindow } from "$lib/stores/modal-window.store.svelte";

    const store = pomodoro.store;
</script>

<div class="w-full h-full flex flex-col justify-center items-center gap-5">
    <p class="text-xl font-bold">{m.want_to_reset()}</p>
    <p class="text-xs">{m.your_history_will_not_saved()}</p>

    <div class="w-50 h-10 flex justify-center items-center gap-5">
        <button onclick={() => { store.resetTimer(); modalWindow.close() }}
                class="flex-1 h-full button-general cursor-pointer bg-danger text-neutral-100 hover:opacity-90 active:opacity-80">
            <p>{m.yes()}</p>
        </button>
        <button onclick={() => modalWindow.close()} class="flex-1 h-full button-general button-base cursor-pointer">
            <p>{m.no()}</p>
        </button>
    </div>
</div>
