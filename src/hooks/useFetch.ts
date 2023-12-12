import {useEffect, useState} from "react";

function useFetch<T>(url: string) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<unknown | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            //sleep TODO remove
            //await new Promise(resolve => setTimeout(resolve, 1000));
            try {
                const response = await fetch(url, {
                    method: "GET",
                    credentials: 'include',
                });
                if (!response.ok) {
                    new Error(`Error: ${response.status}`);
                }

                const result = await response.json();
                setData(result);
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [url]);
    return {data, setData, loading, error};
}

export default useFetch;
