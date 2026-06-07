<script lang="ts">
    import PlusIcon from "$lib/assets/icons/plus.svelte";
    import MinusIcon from "$lib/assets/icons/minus.svelte";
    import ResetIcon from "$lib/assets/icons/reset.svelte";

    import { m } from "$lib/paraglide/messages";

    import { CounterSchema } from "$lib/schema";
    import SvgIcon from "$lib/components/ui/SvgIcon";
    import { LocalStorageManager } from "$lib/utils";

    const dataManager = new LocalStorageManager("counter", CounterSchema.schema, { value: 0, incremental: 1 });
    const data = $state(dataManager.copiedData);

    $effect(() => { dataManager.save(data); });

    const handleIncrease = () => { data.value += data.incremental; }
    const handleDecrease = () => { data.value -= data.incremental; }
    const handleReset = () => { data.value = 0; }
</script>

<svelte:head>
    <title>{data.value} | {m.counter()} | moizlu</title>
</svelte:head>

<main class="w-full flex flex-col justify-center items-center gap-5">
    <h1>{m.counter()}</h1>

    <p class="text-6xl font-bold">{data.value}</p>

    <div class="flex flex-col justify-center items-center gap-5">
        <label class="flex flex-col sm:flex-row justify-center items-center sm:gap-2">
            <p>{m.incremental()}</p>
            <input title={m.incremental()} bind:value={data.incremental} type="number" class="input-general text-right">
        </label>
        <div class="flex justify-center items-center gap-5">
            <button title={m.increase()} onclick={handleIncrease} class="p-2 cursor-pointer button-general button-base"><SvgIcon Svg={PlusIcon} size={40} class="w-15 h-15" /></button>
            <button title={m.decrease()} onclick={handleDecrease} class="p-2 cursor-pointer button-general button-base"><SvgIcon Svg={MinusIcon} size={40} class="w-15 h-15" /></button>
            <button title={m.reset()} onclick={handleReset} class="p-2 cursor-pointer button-general button-base"><SvgIcon Svg={ResetIcon} size={40} class="w-7 h-7" /></button>
        </div>
    </div>
</main>
