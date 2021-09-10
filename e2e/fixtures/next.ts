/* eslint-disable sort-keys */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-empty-pattern */

import { AddressInfo } from 'net';
import { test as base } from '@playwright/test';
// @ts-ignore
import fetch from 'node-fetch';
import moxy from 'moxy';
import next from 'next';
import { parse } from 'url';
import path from 'path';
import { createServer, Server } from 'http';

import RosaLuxemburg from '../mockData/users/RosaLuxemburg';
import { ZetkinAPIResponse } from '../types';
import { ZetkinSession, ZetkinUser } from '../../src/types/zetkin';

type MoxyHTTPMethod = 'get' | 'post' | 'put' | 'patch' | 'delete'

interface Mock<G> {
    data?: G;
    headers?: Record<string, string>;
    status?: number;
}

interface NextTestFixtures {
    login: () => Promise<void>;
}

interface NextWorkerFixtures {
    next: {
        appUri: string;
        moxy: {
            removeMock: (path?: string, method?: MoxyHTTPMethod, ) => Promise<void>;
            setMock: <G>(path: string, method: MoxyHTTPMethod, response?: Mock<G>) => Promise<void>;
        };
    };
}

const test = base.extend<NextTestFixtures, NextWorkerFixtures>({
    next: [
        async ({}, use, workerInfo) => {
            /**
             * Setup Moxy
             */

            const PROXY_FORWARD_URI = 'http://api.dev.zetkin.org';
            const MOXY_PORT = 60000 - workerInfo.workerIndex;
            const URL_BASE = `http://localhost:${MOXY_PORT}/v1`;

            const { start: startMoxy, stop: stopMoxy } = moxy({ forward: PROXY_FORWARD_URI, port: MOXY_PORT });

            startMoxy();

            const setMock = async <G>(path: string, method: MoxyHTTPMethod, response?: Mock<G>) => {
                const url = `${URL_BASE}${path}/_mocks/${method}`;

                const res = await fetch(url, {
                    body: JSON.stringify({ response }),
                    headers: [
                        ['Content-Type', 'application/json'],
                    ],
                    method: 'PUT',
                });

                if (res.status === 409) {
                    throw Error(`
                        Mock already exists with method ${method} at path ${path}.
                        You must delete it with removeMock before you can assign a new mock with these parameters
                    `);
                }
            };

            const removeMock = async(path?: string, method?: MoxyHTTPMethod) => {
                let url = `${URL_BASE}/_mocks`; // Remove all mocks
                if (path && method) url = `${URL_BASE}${path}/_mocks/${method}`; // Remove mock from path and method
                if (path) url = `${URL_BASE}${path}/_mocks`; // Remove all mocks on path
                await fetch(url, {
                    method: 'DELETE',
                });
            };

            /**
             * Setup Next App
             */

            process.env.ZETKIN_API_PORT= MOXY_PORT.toString();

            const app = next({
                dev: false,
                dir: path.resolve(__dirname, '../..'), // Find production build
            });

            await app.prepare();
            const handle = app.getRequestHandler();

            // Start next server on arbitrary port
            const server: Server = await new Promise((resolve) => {
                const server = createServer((req, res) => {
                    const parsedUrl = parse(req.url as string, true);
                    handle(req, res, parsedUrl);
                });
                server.listen((error: unknown) => {
                    if (error) throw error;
                    resolve(server);
                });
            });

            // Get the port from the next server
            const NEXT_PORT = String((server.address() as AddressInfo).port);

            await use({
                appUri: `http://localhost:${NEXT_PORT}`,
                moxy: {
                    setMock,
                    removeMock,
                },
            });

            // Close server when worker stops
            await new Promise(cb => {
                server.close(cb);
                stopMoxy();
            });

        },
        {
            auto: true,
            scope: 'worker',
        },
    ],
    login: async ({ next: { moxy } }, use) => {
        /**
         * Mocks the responses for getting the current user and the user session.
         *
         * The default user is Rosa Luxumburg. Pass in a ZetkinUser object to override.
         */
        const login = async (user: ZetkinUser = RosaLuxemburg) => {
            await moxy.setMock<ZetkinAPIResponse<ZetkinUser>>( '/users/me', 'get', {
                data: {
                    data: user,
                },
            });

            await moxy.setMock<ZetkinAPIResponse<ZetkinSession>>('/session', 'get', {
                data: {
                    data: {
                        created: '2020-01-01T00:00:00',
                        level: 2,
                        user: user,
                    },
                },
            });

        };
        await use(login);
    },
});

export default test;
