<script lang="ts">
    import CloseIcon from "$lib/assets/icons/close.svelte";
    import ResetIcon from "$lib/assets/icons/reset.svelte";
    import TestSound from "$lib/assets/sounds/alarm1.mp3";

    import { m } from "$lib/paraglide/messages";
    import { resolve } from "$app/paths";
    import { onMount } from "svelte";
    import { z } from "zod";
    import { getLocale } from "$lib/paraglide/runtime";

    import SvgIcon from "$lib/components/ui/SvgIcon";
    import { pomodoro } from "$lib/stores";
    import { PomodoroSchema } from "$lib/schema";

    const store = pomodoro.store;
    // console.log(store)
    const data = store.copiedData;
    const fieldValues: Pick<z.infer<typeof PomodoroSchema.schema>, "sessionSec" | "volume" | "longBreakInterval" | "sendNotification"> = $state({
        sessionSec: {
            "working": data.sessionSec["working"] / 60,
            "short-breaking": data.sessionSec["short-breaking"] / 60,
            "long-breaking": data.sessionSec["long-breaking"] / 60,
        },
        volume: data.volume,
        longBreakInterval: data.longBreakInterval,
        sendNotification: data.sendNotification
    });
    // $effect(() => { store.save(data); })

    let testSound: HTMLAudioElement | undefined = $state(undefined);

    $effect(() => {
        if (!testSound) { return; }

        const raw = fieldValues;

        testSound.volume = raw.volume;

        store.save({
            sessionSec: {
                "working": raw.sessionSec["working"] * 60,
                "short-breaking": raw.sessionSec["short-breaking"] * 60,
                "long-breaking": raw.sessionSec["long-breaking"] * 60,
            },
            volume: raw.volume,
            longBreakInterval: raw.longBreakInterval,
            sendNotification: raw.sendNotification
        });
    });

    const onReset = () => {
        fieldValues.sessionSec["working"] = PomodoroSchema.DefaultValues.sessionSec["working"] / 60;
        fieldValues.sessionSec["short-breaking"] = PomodoroSchema.DefaultValues.sessionSec["short-breaking"] / 60;
        fieldValues.sessionSec["long-breaking"] = PomodoroSchema.DefaultValues.sessionSec["long-breaking"] / 60;
        fieldValues.volume = PomodoroSchema.DefaultValues.volume;
        fieldValues.sendNotification = PomodoroSchema.DefaultValues.sendNotification;
        fieldValues.longBreakInterval = PomodoroSchema.DefaultValues.longBreakInterval;
    }

    const onNotificationChanged = async (event: Event & { currentTarget: EventTarget & HTMLInputElement; }) => {
        if (event.currentTarget.checked) {
            const result = await Notification.requestPermission();
            fieldValues.sendNotification = (result === "granted");
        } else {
            fieldValues.sendNotification = false;
        }
    }

    onMount(() => {
        testSound = new Audio(TestSound);
    })
</script>

<svelte:head>
    <title>{m.settings()} | {m.pomodoro_timer()} | moizlu</title>
</svelte:head>

<main class="relative w-full max-w-200 mx-auto px-4 flex flex-col justify-center items-center gap-5">
    <a title={m.return()} href={resolve("/pomodoro")} class="absolute top-0 right-0 rounded-lg bg-base/50 backdrop-blur-sm">
        <SvgIcon Svg={CloseIcon} size={40} />
    </a>

    <h1>{m.pomodoro_timer()} | {m.settings()}</h1>

    <table>
        <tbody class="flex flex-col justify-center items-center gap-4">
            <tr>
                <th>{m.pomodoro_pomodoro_time()}</th>
                <td>
                    <input type="number" bind:value={fieldValues.sessionSec["working"]} min={1} max={99} class="input-general" >
                    <span>{m.minutes()}</span>
                </td>
            </tr>
            <tr>
                <th>{m.short_break()}</th>
                <td>
                    <input type="number" bind:value={fieldValues.sessionSec["short-breaking"]} min={1} max={99} class="input-general" >
                    <span>{m.minutes()}</span>
                </td>
            </tr>
            <tr>
                <th>{m.long_break()}</th>
                <td>
                    <input type="number" bind:value={fieldValues.sessionSec["long-breaking"]} min={1} max={99} class="input-general" >
                    <span>{m.minutes()}</span>
                </td>
            </tr>
            <tr>
                <th>{m.long_break_interval()}</th>
                <td>
                    <input type="number" bind:value={fieldValues.longBreakInterval} min={1} max={99} class="input-general" >
                    <span>{m.times()}</span>
                </td>
            </tr>
            <tr>
                <th>
                    {m.show_notification()}
                    <!-- <p class="text-xs">{m.early_inner_giraffe_trip()}</p> -->
                </th>
                <td class="">
                        <input type="checkbox" bind:checked={fieldValues.sendNotification} onchange={onNotificationChanged} class="toggle-switch" >
                </td>
            </tr>
            <tr class="flex-col">
                <th>{m.volume()}</th>
                <td class="flex flex-col justify-center items-center gap-2">
                    <div class="flex justify-center items-center gap-2">
                        <input type="range" bind:value={fieldValues.volume} min={0} max={1} step={0.1} class="input-range-general" >
                        <button onclick={() => testSound?.play()} class="p-2 button-general button-base cursor-pointer">
                            <p>{m.test()}</p>
                        </button>
                    </div>
                    <p class="text-xs">{m.great_smug_tuna_pause()}</p>
                </td>
            </tr>
        </tbody>
    </table>

    <button onclick={onReset} class="w-50 p-2 flex justify-center items-center button-general button-label cursor-pointer">
        <SvgIcon Svg={ResetIcon} size={40} />
        <p class={["flex-1 text-center", (getLocale() === "en") && "text-xs"]}>{m.restore_to_default_values()}</p>
    </button>
</main>

<style>
    @reference "src/routes/layout.css";

    th {
        @apply text-left font-normal;
    }

    tr {
        @apply w-full flex justify-between items-center gap-3;
    }

    input {
        @apply text-right;
    }
</style>
 