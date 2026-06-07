export const splashHiddenEvent = new Event('splashHidden');

export class SplashStore {
    public get appeared() { return this._appeared; }
    public set appeared(value: boolean) {
        this._appeared = value;

        if (!this._appeared) {
            document.dispatchEvent(splashHiddenEvent);
        }
    }
    private _appeared = $state(true);
}

export const splashStore = new SplashStore();
