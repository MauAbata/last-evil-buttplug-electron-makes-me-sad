const FridaInject = require('frida-inject')
const path = require('path')

let injected = false

function inject(name = "LastEvil.exe", ws) {
    const send = (message, args) => {
        if (ws.readyState === 1)
            ws.send(JSON.stringify({
                message: message,
                args: args
            }))
    }

    if (injected) {
        console.log("already injected");
        send('attached')
        return
    }

    console.log("Injecting into " + name);

    FridaInject({
        name: name,
        scripts: [
            path.join(__dirname, 'mono-api.js')
        ],
        onAttach: session => console.log('Attached'),
        onDetach: (session, reason) => console.log('Detached'),
        onLoad: script => {
            console.log('Script injected!')
            send('attached')
            injected = true;
            script.message.connect(message => {
                console.log('Message: ', message.payload)
                if (message.payload.message === 'ON_DAMAGE')
                    send("ON_DAMAGE", message.payload);
                if (message.payload.message === 'ON_ANIMATION_EVENT')
                    send("ON_ANIMATION_EVENT", message.payload);
            })
        },
        onUnload: script => console.log('Script unloaded')
    })
}

module.exports = inject;