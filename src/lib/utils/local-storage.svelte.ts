import { browser } from "$app/environment";
import type { AppName } from "$lib/types"
import type { z } from "zod";

export class LocalStorageManager<T extends z.ZodType> {
    public constructor(name: AppName, schema: T, defaultValue: z.infer<T>) {
        this._name = name;
        this._schema = schema;
        this._data = defaultValue;

        const storedValue = this.storedValue;
        if (storedValue === undefined) {
            this.save(structuredClone(defaultValue));
        } else {
            this._data = storedValue;
        }
    }

    public save(newData: z.infer<T>) {
        if (!browser) { return; }

        this._data = $state.snapshot(newData) as z.infer<T>;
        localStorage.setItem(this.storedName, JSON.stringify(this._data));
    }

    public get copiedData() { return structuredClone(this._data); }
    public get storedName() { return `${this._name}.store`; }

    private get storedValue(): z.infer<T> | undefined {
        if (!browser) { return undefined; }

        const raw = localStorage.getItem(this.storedName);
        if (raw === null) {
            return undefined;
        }

        try {
            const parsed = JSON.parse(raw);
            const validated = this._schema.parse(parsed);
            return validated;
        } catch {
            return undefined;
        }
    }

    private _name: AppName;
    private _schema: T;
    private _data: z.infer<T>;
}
