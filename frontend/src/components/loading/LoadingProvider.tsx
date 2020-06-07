import * as React from 'react';
import LoadingContext from "./LoadingContext";
import axios from 'axios';
import {useEffect, useState} from "react";

export const LoadingProvider = (props) => {
    const[loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        let isSubscribed = true;
        axios.interceptors.request.use((config) => {
            if (isSubscribed){
                setLoading(true);
            }
            return config;
        });

        axios.interceptors.response.use(
            (response) => {
                if (isSubscribed) {
                    setLoading(false);
                }

                return response;
            },
            (error) => {
                setLoading(false);

                return Promise.reject(error);
            }
        );
        return () => {
            isSubscribed = false;
        }
    }, [])

    return (
        <LoadingContext.Provider value={loading}>
            {props.children}
        </LoadingContext.Provider>
    );
};