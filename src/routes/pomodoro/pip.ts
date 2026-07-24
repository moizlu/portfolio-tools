import { m } from "$lib/paraglide/messages";
import { pomodoro } from "$lib/stores";
import { SessionNames } from "$lib/types/pomodoro";

const sessionName = () => SessionNames[pomodoro.store.session];

function initialHtml(): string {
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

export class PiPManager {
    private _window: Window | undefined = undefined;

    static get available(): boolean {
        return 'documentPictureInPicture' in window;
    }

    get active(): boolean {
        return this._window !== undefined && !this._window.closed;
    }

    update(): void {
        if (!this._window || this._window.closed) return;
        const doc = this._window.document;
        const store = pomodoro.store;
        const sec = store.currentSessionSec - store.data.elapsedSec;
        const minInt = Math.floor(sec / 60);
        const secInt = sec % 60;
        const minStr = minInt.toFixed(0).padStart(2, '0');
        const secStr = secInt.toFixed(0).padStart(2, '0');
        const isWorking = store.session === "working";
        const accentColor = isWorking ? "#E2421F" : "#38bdf8";

        doc.getElementById('pip-timer')!.textContent = `${minStr}:${secStr}`;
        doc.getElementById('pip-session')!.textContent = sessionName();
        doc.getElementById('pip-session')!.style.color = accentColor;
        doc.getElementById('pip-count')!.textContent = m.the_n_th_session({ num: Math.ceil(store.data.stateTransCount / 2) });
    }

    async toggle(): Promise<void> {
        if (this._window && !this._window.closed) {
            this._window.close();
            this._window = undefined;
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
        this._window = pip;

        pip.document.write(initialHtml());
        pip.document.close();

        this.update();

        pip.addEventListener('pagehide', () => {
            this._window = undefined;
        });
    }

    destroy(): void {
        this._window?.close();
        this._window = undefined;
    }
}
