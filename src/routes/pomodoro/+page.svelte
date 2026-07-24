<script lang="ts">
    import FocusIcon from "$lib/assets/icons/focus.svg";
    import BreakIcon from "$lib/assets/icons/coffee-break.svg";
    import PlayIcon from "$lib/assets/icons/play.svelte";
    import PauseIcon from "$lib/assets/icons/pause.svelte";
    import ResetIcon from "$lib/assets/icons/reset.svelte";
    import DoubleArrowIcon from "$lib/assets/icons/double-arrow.svelte";
    import SettingsIcon from "$lib/assets/icons/settings.svelte";
    import ArrowIcon from "$lib/assets/icons/arrow.svelte";
    import HelpIcon from "$lib/assets/icons/help.svelte";
    import StartBreakSound from "$lib/assets/sounds/alarm1.mp3";
    import StartFocusSound from "$lib/assets/sounds/alarm2.mp3";
    import PipIcon from "$lib/assets/icons/pip.svelte";

    import { onDestroy, onMount } from "svelte";
    import { m } from "$lib/paraglide/messages";
    import { resolve } from "$app/paths";

    // import { PomodoroStore } from "$lib/stores";
    import { pomodoro } from "$lib/stores";
    import { SessionNames } from "$lib/types/pomodoro";
    import SvgIcon from "$lib/components/ui/SvgIcon";
    import CircularProgressBar from "$lib/components/ui/CircularProgressBar";
    import { modalWindow } from "$lib/stores/modal-window.store.svelte";
    import DisplayTime from "./DisplayTime.svelte";


    // const store = new pomodoro.Store();
    const store = pomodoro.store;
    const data = $state(store.copiedData);
    let timerWorker: Worker | undefined = $state(undefined);
    let notificationWorker: ServiceWorkerRegistration | undefined = $state(undefined);

    let startBreakSound: HTMLAudioElement | undefined = undefined;
    let startFocusSound: HTMLAudioElement | undefined = undefined;

    const progress = $derived(store.data.elapsedSec / store.currentSessionSec);

    const totalElapsedDisplay = $derived.by(() => {
        const totalSec = store.data.totalElapsedSec;
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    });

    let pipAvailable: boolean = $state(false);
    let pipWindow: Window | undefined = $state(undefined);

    function pipInitialHtml(): string {
        return `<!DOCTYPE html>
<html>
<head>
<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
        background: #1e1e1e;
        color: #f5f5f5;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        font-family: "Noto Sans JP", monospace;
        gap: 2px;
        padding: 8px;
        user-select: none;
    }
    #pip-timer { font-size: 44px; font-weight: bold; letter-spacing: 2px; line-height: 1.2; }
    #pip-session { font-size: 14px; }
    #pip-count { font-size: 11px; opacity: 0.5; }
</style>
</head>
<body>
    <div id="pip-timer">00:00</div>
    <div id="pip-session"></div>
    <div id="pip-count"></div>
</body>
</html>`;
    }

    function updatePiP() {
        if (!pipWindow || pipWindow.closed) return;
        const doc = pipWindow.document;
        const sec = store.currentSessionSec - store.data.elapsedSec;
        const minInt = Math.floor(sec / 60);
        const secInt = sec % 60;
        const minStr = minInt.toFixed(0).padStart(2, '0');
        const secStr = secInt.toFixed(0).padStart(2, '0');
        const isWorking = store.session === "working";
        const accentColor = isWorking ? "#E2421F" : "#38bdf8";

        doc.getElementById('pip-timer')!.textContent = `${minStr}:${secStr}`;
        doc.getElementById('pip-session')!.textContent = sessionName;
        doc.getElementById('pip-session')!.style.color = accentColor;
        doc.getElementById('pip-count')!.textContent = m.the_n_th_session({ num: Math.ceil(store.data.stateTransCount / 2) });
    }

    async function togglePiP() {
        if (pipWindow && !pipWindow.closed) {
            pipWindow.close();
            pipWindow = undefined;
            return;
        }

        if (!('documentPictureInPicture' in window)) return;

        const pip = await (window as Window & {
            documentPictureInPicture: {
                requestWindow: (o: { width: number; height: number }) => Promise<Window>;
            }
        }).documentPictureInPicture.requestWindow({
            width: 280,
            height: 180
        });
        pipWindow = pip;

        pip.document.write(pipInitialHtml());
        pip.document.close();

        updatePiP();

        pip.addEventListener('pagehide', () => {
            pipWindow = undefined;
        });
    }

    let spaceKeyPressing: boolean = false;
    let lastSessionUpdatedMs: number = 0;

    $effect(() => { store.save(data); });

    const sessionName = $derived(SessionNames[store.session]);

    const displayTime = $derived.by(() => {
        const sec = store.currentSessionSec - store.data.elapsedSec
        const minInt = Math.floor(sec / 60);
        const secInt = (sec % 60);
        const minStr = minInt.toFixed(0).padStart(2, '0');
        const secStr = secInt.toFixed(0).padStart(2, '0');

        return {
            str: {
                min: minStr, sec: secStr
            },
            int: {
                min: minInt, sec: secInt
            }
        }
    });

    onMount(async () => {
        const TimerWorkerModule = (await import("$lib/workers/timer.worker?worker")).default;
        timerWorker = new TimerWorkerModule();
        timerWorker.postMessage({ command: "update", interval: 100 });

        timerWorker.onmessage = () => {
            const sessionUpdated = store.update();
            const now = Date.now();

            if (sessionUpdated) {
                switch (store.session) {
                    case "working":
                        startFocusSound?.play();
                        break;
                    case "short-breaking":
                    case "long-breaking":
                        startBreakSound?.play();
                        break;
                }

                if (now - lastSessionUpdatedMs >= (30 * 1000)) {
                    if ((Notification.permission === "granted") && store.data.sendNotification) {
                        notificationWorker?.showNotification(m.pomodoro_timer(), {
                            body: `${m.start()} | ${sessionName}`,
                            icon: (store.session === "working") ? FocusIcon : BreakIcon
                        })
                    }
                }
                lastSessionUpdatedMs = now;
            }

            updatePiP();
        }

        if ('serviceWorker' in navigator) {
            notificationWorker = await navigator.serviceWorker.register("/service-worker.js");
        }
    });

    onMount(() => {
        pipAvailable = 'documentPictureInPicture' in window;

        const onVisibilityChange = () => {
            if (!timerWorker) { return; }

            if (document.hidden) {
                timerWorker.postMessage({ command: "update", interval: 1000 });
            } else {
                timerWorker.postMessage({ command: "update", interval: 100 });
            }
        }

        const onDocumentKeyDown = (event: KeyboardEvent) => {
            if (event.key === " " && !spaceKeyPressing) {
                spaceKeyPressing = true;
                store.paused = !store.paused;
            }
        }

        const onDocumentKeyUp = (event: KeyboardEvent) => {
            if (event.key === " ") {
                spaceKeyPressing = false;
            }
        }

        // const onDocumentKeyDown = () => {
        //     console.log("aaa")
        // }

        startBreakSound = new Audio(StartBreakSound);
        startFocusSound = new Audio(StartFocusSound);

        startBreakSound.volume = data.volume;
        startFocusSound.volume = data.volume;

        document.addEventListener("visibilitychange", onVisibilityChange);

        document.addEventListener("keydown", onDocumentKeyDown);
        document.addEventListener("keyup", onDocumentKeyUp);

        return () => {
            document.removeEventListener("visibilitychange", onVisibilityChange);
            document.removeEventListener("keydown", onDocumentKeyDown);
            document.removeEventListener("keyup", onDocumentKeyUp);
        }
    })

    onDestroy(() => {
        timerWorker?.terminate();
        pipWindow?.close();
        store.paused = true;
    })
</script>

<svelte:head>
    <title>{store.paused ? "⏸| " : ""}{`${displayTime.str.min}:${displayTime.str.sec}`} | {sessionName} | {m.pomodoro_timer()} | moizlu</title>
</svelte:head>

{#snippet resetDialog()}
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
{/snippet}

{#snippet helpDialog()}
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
{/snippet}

<main class="relative w-full max-w-200 mx-auto flex flex-col justify-center items-center gap-5">
    <a title={m.settings()} href={resolve("/pomodoro/settings")} class="absolute top-0 right-0 rounded-lg bg-base/50 backdrop-blur-sm">
        <SvgIcon Svg={SettingsIcon} size={40} />
    </a>

    <div class="flex flex-col justify-center items-center">
        <h1>{m.pomodoro_timer()}</h1>
        <!-- <p class="text-xs">複数のタブで開くと挙動が不安定になります。</p> -->
    </div>

    <div class="flex flex-col justify-center items-center gap-2">
        <p class="text-2xl">{m.the_n_th_session({ num: Math.ceil(store.data.stateTransCount / 2) })}</p>

        <div class="relative w-50 flex flex-col justify-center items-center">
            <p class="font-bold text-center text-3xl">{sessionName}</p>
            <p class="sm:absolute sm:top-[50%] sm:right-0 sm:translate-x-full sm:translate-y-[-50%] sm:text-left">{m.session_next({ next: SessionNames[store.calcSession({ ...data, stateTransCount: store.data.stateTransCount + 1  })] })}</p>
        </div>

        <CircularProgressBar {progress} progressBarClass={[(store.session === "working") ? "stroke-main" : "stroke-information"]}>
            <DisplayTime {...displayTime} />
        </CircularProgressBar>

        <!-- {#if Number(displayTime.min) <= 10}
            <p class="text-xs text-center mb-5">タイマーの処理が長期間行われなかったようです。再生ボタンをおすと固まる可能性がありますが、処理は進行していますのでお待ちください。</p>
        {/if} -->

        <div class="flex justify-center items-center gap-3">
            <p class="text-sm text-center">{m.elapsed_time()}: {totalElapsedDisplay}</p>
            {#if pipAvailable}
                <button onclick={togglePiP} title={pipWindow ? m.pip_exit() : m.pip_enter()} class="p-1.5 button-general button-base cursor-pointer">
                    <SvgIcon Svg={PipIcon} size={18} />
                </button>
            {/if}
        </div>

        <div class="relative flex justify-center items-center gap-5">
            <button onclick={() => modalWindow.open({ contents: helpDialog, size: "mx-4 w-full max-w-100 h-60", title: m.how_to_use()} )} 
                    class="absolute -top-3 -right-3 cursor-pointer">
                <SvgIcon Svg={HelpIcon} size={20} />
            </button>
            <button onclick={() => store.retrySession()} class="p-2 cursor-pointer button-general button-base">
                <SvgIcon Svg={ArrowIcon} size={27} class="rotate-270" />
            </button>
            <button onclick={() => store.paused = !store.paused} class="w-20 h-20 overflow-hidden button-general button-label cursor-pointer">
                <div class={["w-fit h-fit transition-all duration-300 flex justify-center items-center", (store.paused) && "-translate-x-20"]}>
                    <SvgIcon Svg={PauseIcon} size={80} />
                    <SvgIcon Svg={PlayIcon} size={80} />
                </div>
            </button>

            <button onclick={() => modalWindow.open({ contents: resetDialog, size: "mx-4 w-full max-w-100 h-50", showCloseButton: false })} class="p-2 button-general button-base cursor-pointer">
                <SvgIcon Svg={ResetIcon} size={27} />
            </button>
        </div>

        <button onclick={() => store.skip()} class="w-45 p-2 button-general button-base flex justify-center items-center cursor-pointer">
            <SvgIcon Svg={DoubleArrowIcon} size={40} class="rotate-90" />
            <p class="flex-1 text-center">{m.skip()}</p>
        </button>
    </div>
</main>
