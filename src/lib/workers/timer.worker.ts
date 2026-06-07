let timerId: NodeJS.Timeout | undefined = undefined;
let currentInterval: number | undefined = undefined;

self.onmessage = (event: MessageEvent) => {
    const { command, interval } = event.data;
    if (command === 'update') {
        if (currentInterval === interval) { return; }
        currentInterval = interval;
        clearInterval(timerId);

        timerId = setInterval(() => {
            self.postMessage({ type: 'tick' });
        }, interval);
    }
}