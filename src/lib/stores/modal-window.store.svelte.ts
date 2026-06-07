import type { Component, Snippet } from "svelte";
import type { ClassValue } from "svelte/elements";

import { browser } from "$app/environment";

export const modalWindowOpenEvent = new Event('modalWindowOpen');
export const modalWindowCloseEvent = new Event('modalWindowClose');

interface ModalData {
    contents: Snippet | Component;
    lock?: boolean;

    blur?: boolean;
    contrast?: boolean;

    windowMode?: 'fullscreen' | 'window' | 'none';
    showCloseButton?: boolean;

    size?: string;

    title?: string | Snippet | Component;
    class?: ClassValue;

    priority?: number;
}

export class ModalWindowManager {
    public constructor() { }

    public open(data: ModalData): boolean {
        if (!browser) return false;

        // 優先度チェック
        if (this._data && ((this._data.priority ?? 0) < (data.priority ?? 0))) {
            return false;
        }

        // デフォルト値の設定
        const finalData: ModalData = {
            blur: true,
            contrast: true,
            windowMode: 'window',
            showCloseButton: true,
            ...data
        };

        document.body.classList.add("overflow-hidden");
        this._data = finalData;
        this._opened = true;

        return true;
    }

    public close(): void {
        if (!browser) return;

        document.body.classList.remove("overflow-hidden");
        this._opened = false;
    }

    public clearData(): void {
        this._data = undefined;
    }

    public get data(): Readonly<ModalData> | undefined { return this._data; }
    public get opened() { return this._opened; }

    private _data: ModalData | undefined = $state(undefined);
    private _opened: boolean = $state(false);
}

export const modalWindow = new ModalWindowManager();
