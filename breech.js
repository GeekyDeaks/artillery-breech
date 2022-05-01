'use strict'

const { runner } =  require('artillery/core')

module.exports = async ({ script, ee }) => {

    if(!script) throw Error('no script defined')
    if(!script.config || !script.scenarios) throw Error('no config or scenarios defined')
    
    if(!script.config.phases) {
        script.config.phases = [{ duration: 1, arrivalCount: 1 }]
    }

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