<script lang="ts">
    import { fade, fly } from "svelte/transition";
    import { m } from "$lib/paraglide/messages";
    import CloseIcon from "$lib/assets/icons/close.svelte";
    import SvgIcon from "../SvgIcon"; // パスは適宜調整してください
    import { modalWindow } from "$lib/stores/modal-window.store.svelte";
    import { isComponent } from "$lib/utils";

    const data = $derived(modalWindow.data);

    // 背景のクラス指定
    const backgroundClass = $derived([
        "z-[1002] fixed top-0 left-0 w-full h-dvh flex justify-center items-center",
        data?.blur && "backdrop-blur-sm",
        data?.contrast && "bg-base/20",
        data?.class
    ]);

    // ウィンドウのベースクラス
    const windowClass = $derived([
        "bg-base relative flex flex-col justify-center items-center transition-all duration-300",
        data?.windowMode === 'fullscreen' && "w-full h-full",
        data?.windowMode === 'window' && "md:m-10 border-2 border-label/5 rounded-sm",
        data?.size,
        // デフォルトサイズ
        data?.windowMode === 'window' && !data.size && "w-full h-full md:max-w-300",
        data?.windowMode === 'window' && !data.size && "w-full h-full md:max-h-200",
    ]);

    const handleKeydown = (event: KeyboardEvent) => {
        if (event.key === 'Enter' && !data?.lock) {
            modalWindow.close();
        }
    };

    const handleBackgroundClick = (event: MouseEvent) => {
        // クリックされたのが背景（コンテナ）自身である場合のみ閉じる
        if (!data?.lock && event.target === event.currentTarget) {
            modalWindow.close();
        }
    };
</script>

{#if modalWindow.opened && data}
    <div transition:fade={{ duration: 300 }} role="button"  tabindex="0"
        onkeydown={handleKeydown} onclick={handleBackgroundClick}
        class={backgroundClass}>
        <div in:fly={{ y: 80, duration: 300, delay: 50 }} out:fly={{ y: 80, duration: 250 }}
            onoutroend={() => modalWindow.clearData()}
            role="dialog" 
            aria-modal="true"
            class={windowClass}
        >
            {#if data.title}
                <div class="z-100 absolute top-0 left-0 w-full h-15 rounded-sm bg-base/50">
                    {#if typeof data.title === "string"}
                        <p class="w-full h-full flex justify-center items-center text-xl md:text-2xl font-bold">
                            {data.title}
                        </p>
                    {:else if isComponent(data.title)}
                        <data.title />
                    {:else}
                        {@render data.title()}
                    {/if}
                </div>
            {/if}

            {#if data.showCloseButton}
                <button 
                    title={m.close()} onclick={() => modalWindow.close()} 
                    class="z-100 transition-all duration-300 absolute top-0 right-0 bg-base/50 m-1 rounded-sm cursor-pointer hover:scale-110">
                    <SvgIcon Svg={CloseIcon} size={50} />
                </button>
            {/if}

            {#if isComponent(data.contents)}
                <data.contents />
            {:else}
                {@render data.contents()}
            {/if}
        </div>
    </div>
{/if}
