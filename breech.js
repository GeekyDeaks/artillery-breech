'use strict'

const { runner } =  require('artillery/core')

module.exports = async ({ script, ee }) => {
    let r = await runner(script)
    if(ee) {
        for(let name of ee.eventNames()) {
            r.on(name, ee.emit.bind(ee, name))
        }
    }

    let intermediate = []
    r.on('stats', (stats) => {
        intermediate.push(stats)
    })

    let p = new Promise( (resolve, reject) => {
        r.on('done', async (aggregate) => {
            try {
                await r.stop()
                resolve({ aggregate, intermediate })
            } catch(err) {
                reject(err)
            }
        })
    })
    r.run()
    return p
}