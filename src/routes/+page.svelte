<script lang="ts">
    import { resolve } from "$app/paths";

    import { m } from "$lib/paraglide/messages";
</script>

<main class="w-60 mx-auto flex flex-col justify-center items-center text-xl font-bold gap-3 text-center">
    <a title={m.pomodoro_timer()} href={resolve("/pomodoro")} class="w-full p-2 button-general button-label">{m.pomodoro_timer()}</a>
    <a title={m.pomodoro_timer()} href={resolve("/counter")} class="w-full p-2 button-general button-label">{m.counter()}</a>
</main>
