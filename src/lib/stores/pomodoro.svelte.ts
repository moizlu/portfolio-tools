import { z } from "zod";

import { PomodoroType } from "$lib/types";
import { PomodoroSchema } from "$lib/schema";
import { LocalStorageManager } from "$lib/utils";
import type { Session } from "$lib/types/pomodoro";

const pomodoroTimerUpdatedEvent = new Event('PomodoroTimer.Updated');

export class Store {
    public constructor() {
        this._dataManager = new LocalStorageManager("pomodoro", PomodoroSchema.schema, PomodoroSchema.DefaultValues);
        this._data = $state(this._dataManager.copiedData);
        this._session = $state(this.calcSession(this._data));
    }

    public get copiedData(): z.infer<typeof PomodoroSchema.schema> {
        return this._dataManager.copiedData;
    }

    public save(newData: z.infer<typeof PomodoroSchema.schema>) {
        this._data = newData;
        this.saveToManager();
    }

    public skip() {
        this._data.elapsedSec = this._data.sessionSec[this.session];
        this._lastUpdatedMs = undefined;
        this.saveToManager();
    }

    public resetTimer() {
        this._paused = true;
        this._session = "working";
        this._data.elapsedSec = 0;
        this._data.stateTransCount = 1;
        this._lastUpdatedMs = undefined;
        this.saveToManager();
    }

    public get paused() { return this._paused; }
    public set paused(value: boolean) {
        this._paused = value;
        if (this.paused === true) {
            this._lastUpdatedMs = undefined;
        }
    }

    public get session() { return this._session; }

    public update(): boolean {
        if (this.paused) { return false; }
        let sessionUpdated = false;

        const now = Date.now();
        let elapsedSec = 0;
        let delay = 0;

        // lastUpdatedMsの初期化が済んだ後だけ実行
        if (this._lastUpdatedMs !== undefined) {
            const elapsedMs = now - this._lastUpdatedMs;
            elapsedSec = Math.floor(elapsedMs / 1000);
            delay = now - (this._lastUpdatedMs + (elapsedSec * 1000));

            if (elapsedSec <= 0) { return sessionUpdated; }
        }

        this._lastUpdatedMs = now - delay;
        this._data.elapsedSec += elapsedSec;

        if (this._data.elapsedSec >= this.currentSessionSec) {
            this._data.elapsedSec = this._data.elapsedSec - this.currentSessionSec;
            this._data.stateTransCount += 1;
            this._session = this.calcSession(this._data);
            sessionUpdated = true;
        }

        document.dispatchEvent(pomodoroTimerUpdatedEvent);

        this.saveToManager();

        return sessionUpdated;
    }

    public get currentSessionSec() {
        return this._data.sessionSec[this.session];
    }

    public calcSession({ stateTransCount, longBreakInterval }: {
        stateTransCount: number,
        longBreakInterval: number
    }): PomodoroType.Session {
        // カウントが1スタートのため
        if ((stateTransCount % 2) === 0) {
            if (Math.ceil(stateTransCount / 2) % longBreakInterval === 0) {
                return "long-breaking";
            } else {
                return "short-breaking";
            }
        } else {
            return "working"
        }
    }

    private saveToManager() {
        this._dataManager.save(this._data);
    }

    private _dataManager: LocalStorageManager<typeof PomodoroSchema.schema>;
    private _data: z.infer<typeof PomodoroSchema.schema>;
    private _lastUpdatedMs: number | undefined = undefined;
    private _paused: boolean = $state(true);
    private _session: Session;
}

export const store = new Store();
