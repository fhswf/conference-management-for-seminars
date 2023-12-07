import {useEffect, useRef} from "react";

function useInterval(callback: () => void, interval: number) {
    const savedCallback = useRef<() => void | null>(() => {});

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        function tick() {
            savedCallback.current!();
        }

        if (interval !== null) {
            const id = setInterval(tick, interval);
            return () => clearInterval(id);
        }
    }, [interval]);
}

export default useInterval;
