import { browser } from "$app/environment";

export type Theme = 'light' | 'dark';
export type SystemTheme = Theme | 'system';

let darkModeMediaQuery: MediaQueryList | undefined = undefined;

if (browser) {
    darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
}

export class ThemeManager {
    public constructor() {
        if (!browser) { return; }
        const cookieTheme = (localStorage.getItem('theme') ?? undefined) as Theme | undefined;
        if (cookieTheme) {
            this._theme = cookieTheme;
        } else {
            this._theme = 'system';
            localStorage.setItem('theme', this._theme);
        }

        darkModeMediaQuery?.addEventListener('change', () => {
            if (this._theme !== 'system') { return; }
            this.apply();
        });

        this.apply();
    }

    public get theme(): Theme {
        if (this._theme === 'system') {
            return (darkModeMediaQuery?.matches) ? 'dark' : 'light';
        } else {
            return this._theme;
        }
    }

    public get rawTheme(): SystemTheme {
        return this._theme;
    }

    public set theme(t: SystemTheme) {
        if (!browser) { return; }
        this._theme = t;
        localStorage.setItem('theme', this._theme);
        this.apply();

    }

    private apply() {
        if (!browser) { return; }
        document.body.classList.toggle('dark', this.theme === 'dark');
        document.body.style.colorScheme = this.theme;
    }

    private _theme: SystemTheme = $state('system');
};

export const theme = new ThemeManager();
