<div class="container w-50 h-5 flex flex-row-reverse justify-center items-center gap-2">
    <div class="dot"></div>
    <div class="dot"></div>
    <div class="dot"></div>
    <div class="dot"></div>
</div>

<style>
    @reference "../../../../routes/layout.css";

    @layer components {
        @keyframes dot-move {
            from { translate: -2.5rem 0rem; } /* 移動開始 */
            10% { translate: 0.5rem 0rem; }   /* 移動完了(バウンド) */
            20% { translate: 0rem 0rem; }     /* バウンド完了 */
            50% { translate: 0rem 0rem; }      /* 移動開始 */
            70%   { translate: 2.5rem 0rem; }   /* 移動完了 */
            to   { translate: 2.5rem 0rem; }   /* 移動完了 */
        }

        @keyframes dot-opacity {
            from { opacity: 0; }
            10% { opacity: 1; }
            50% { opacity: 1; }
            70% { opacity: 0; }
            to { opacity: 0; }
        }

        .dot {
            @apply w-5 h-5 rounded-sm bg-main;
            animation: 1.5s ease-in-out infinite both dot-move, 1.5s ease-in infinite both dot-opacity;
        }

        .dot:nth-child(2) {
            animation-delay: 125ms;
        }
        .dot:nth-child(3) {
            animation-delay: 250ms;
        }
        .dot:nth-child(4) {
            animation-delay: 375ms;
        }
    }
</style>
