'use strict'

const t = require('tap')
const http = require('http')
const WebSocket = require('ws')
const breech = require('./breech')
const EventEmitter = require('events')

t.test('should run a websocket scenario', async (t) => {

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
            phases: [{ duration: 1, arrivalCount: 1 }]
        },
        scenarios: [{
            engine: 'ws',
            flow: [
                { send: 'foo' },
                { send: 'bar' },
                { send: 'baz' }
            ]
        }]
    }

    let res = await breech({ script })
    t.equal(res?.aggregate?.counters['vusers.failed'], 0, 'no errors')
    t.equal(res?.aggregate?.counters['websocket.messages_sent'], 3, 'all messages sent')
    targetServer.close(t.end)

})

t.test('should listen for the done event', async (t) => {

    const ee = new EventEmitter()
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
            phases: [{ duration: 1, arrivalCount: 1 }]
        },
        scenarios: [{
            engine: 'ws',
            flow: [
                { send: 'foo' },
                { send: 'bar' },
                { send: 'baz' }
            ]
        }]
    }

    let doneEmitted = 0
    ee.on('done', (stats) => {
        doneEmitted += 1
    })

    let res = await breech({ script, ee })
    t.equal(res?.aggregate?.counters['vusers.failed'], 0, 'no errors')
    t.equal(res?.aggregate?.counters['websocket.messages_sent'], 3, 'all messages sent')
    t.equal(doneEmitted, 1, 'done emitted once')
    targetServer.close(t.end)

})

