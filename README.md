# artillery breech

Programmatically run artillery scenarios

# get started

    npm install --save-dev artillery-breech

# raison d'être

This is intended to allow artillery scenarios to be easily used for end-to-end testing with the potential to re-use the same scenarios for complete load testing.

It simply exposes the artillery launcher around a thin promise wrapper, however this bypasses a lot of the artillery cli initialisation, which means you are responsible for much of the heavy lifting, including loading the script, plugins and processor.  It also only creates one worker instance, so it's not really suitable for launching an actual loadtest

# example

    'use strict'

    const t = require('tap')
    const http = require('http')
    const WebSocket = require('ws')
    const breech = require('artillery-breech)

    t.test('should correctly use variables in the scenario', async (t) => {

        const server = http.createServer()
        const wss = new WebSocket.Server({ server })
        const targetServer = server.listen(0)

        wss.on('connection', function (ws) {
            ws.on('message', ws.send.bind(ws))
        })

        let { port } = targetServer.address()

        const script = {
            config: {
                target: `ws://127.0.0.1:${port}`,
                phases: [{ duration: 1, arrivalCount: 1 }],
                variables: {
                    foo: ['bar', 'baz']
                }
            },
            scenarios: [{
                engine: 'ws',
                flow: [
                    { send: { payload: '{{ foo }}', match: { regexp: 'bar' } } },
                    { send: { payload: '{{ foo }}', match: { regexp: 'baz' } } },
                    { send: { payload: '{{ foo }}', match: { regexp: 'bar' } } }
                ]
            }]
        }

        let res = await breech({ script })
        t.equal(res?.aggregate?.counters['vusers.failed'], 0, 'no errors')
        t.equal(res?.aggregate?.counters['websocket.messages_sent'], 3, 'all messages sent')
        targetServer.close(t.end)

    })

# phases

By default a solo phase of `{ duration: 1, arrivalCount: 1 }` will be injected into the config if `config.phases` is not defined