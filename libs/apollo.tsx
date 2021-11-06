import { useMemo } from "react";
import {
    ApolloClient,
    ApolloLink,
    InMemoryCache,
    NormalizedCacheObject
} from "@apollo/client";
import merge from 'deepmerge';
import { HttpLink} from "@apollo/client";
import { IncomingHttpHeaders } from "http";
import fetch from 'isomorphic-unfetch';
import isEqual from 'lodash/isEqual';
import { AppProps } from "next/app";
import {onError} from "@apollo/client/link/error";

const APOLLO_STATE_PROP_NAME = '__APOLLO_STATE__';

let apolloClient: ApolloClient<NormalizedCacheObject> | undefined;

const createApolloClient = (headers: IncomingHttpHeaders | null = null): ApolloClient<any> => {
    return new ApolloClient({
        // SSR for Node.Js
        ssrMode: typeof window === 'undefined',
        link: ApolloLink.from([
            onError(({ graphQLErrors, networkError}) => {
                if(graphQLErrors) {
                    graphQLErrors.forEach(({message, locations, path}) => {
                        console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
                    })
                }
                if(networkError) {
                    console.log(`[Network error]: ${networkError}. Backend is unreachable. Is it running?`)
                }
            }),
            new HttpLink({
                uri: 'http://localhost:4000/api-graphql',
                // credentials: 'include',
                includeExtensions: false,
                fetch,
            })
        ]),
        cache: new InMemoryCache({
            addTypename: false
        })

    })
}

type InitialState = NormalizedCacheObject | undefined;

interface InitializeApollo {
    headers?: IncomingHttpHeaders | null;
    initialState?: InitialState | null;
}

export const initializeApollo = (
    {headers, initialState}: InitializeApollo = { headers: null, initialState: null }
) => {
    const _apolloClient = apolloClient ?? createApolloClient(headers)
    // If your page has Next.js data fetching methods that use Apollo Client, the initial state
    // get hydrated here

    if(initialState) {
        // Get existing cache, loaded during client side data fetching
        const existingCache = _apolloClient.extract();

        // Merge the existing cache into data passed from getStaticProps/getServerSideProps
        const data = merge(initialState, existingCache, {
            arrayMerge: (destinationArray: any, sourceArray: any) => [
                ...sourceArray,
                ...destinationArray.filter((d: any) => sourceArray.every((s: any) => !isEqual(d, s)))
            ]
        });

        // Restore the cache with merged data
        _apolloClient.cache.restore(data)
    }

    // For SSG and SSR always create a new Apollo Client
    if(typeof window === 'undefined') return _apolloClient;

    // Create the Apollo Client once in the client
    if(!apolloClient) apolloClient = _apolloClient;

    return _apolloClient;
}

export const addApolloState = (
    client: ApolloClient<NormalizedCacheObject>,
    pageProps: AppProps['pageProps'],
) => {
    if(pageProps?.props) {
        pageProps.props[APOLLO_STATE_PROP_NAME] = client.cache.extract();
    }
    return pageProps
}

export const useApollo = (pageProps: AppProps['pageProps']) => {
    const state = pageProps[APOLLO_STATE_PROP_NAME];
    return useMemo(() => initializeApollo(
        {initialState: state}),
        [state]
    );
}
