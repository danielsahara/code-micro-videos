import * as React from 'react';
import {useEffect, useMemo, useState} from 'react';
import LoadingContext from "./LoadingContext";
import {
    addGlobalRequestInterceptor,
    addGlobalResponseInterceptor,
    removeGlobalRequestInterceptor,
    removeGlobalResponseInterceptor
} from "../../util/http";

export const LoadingProvider = (props) => {
    const[loading, setLoading] = useState<boolean>(false);

    useMemo(() => {
        let isSubscribed = true;

        const requestIds = addGlobalRequestInterceptor((config) => {
            if (isSubscribed){
                setLoading(true);
            }
            return config;
        })

        const responseIds = addGlobalResponseInterceptor((response) => {
            if (isSubscribed) {
                setLoading(false);
            }

            return response;
            },
        (error) => {
            setLoading(false);

            return Promise.reject(error);
        })

        return () => {
            isSubscribed = false;
            removeGlobalRequestInterceptor(requestIds);
            removeGlobalResponseInterceptor(responseIds);
        }
    }, [true])

    return (
        <LoadingContext.Provider value={loading}>
            {props.children}
        </LoadingContext.Provider>
    );
};