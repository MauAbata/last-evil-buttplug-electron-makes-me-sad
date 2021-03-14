const FridaInject = require('frida-inject')
const path = require('path')

let injected = false

function inject(name = "LastEvil.exe") {
    if (injected) {
        console.log("already injected");
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
            injected = true;
            script.message.connect(message => {
                console.log('Message: ', message.payload)
                // if (message.payload.message === 'ON_DAMAGE')
                //     win && win.webContents.send("ON_DAMAGE", JSON.stringify(message.payload));
                // if (message.payload.message === 'ON_ANIMATION_EVENT')
                //     win && win.webContents.send("ON_ANIMATION_EVENT", JSON.stringify(message.payload));
            })
        },
        onUnload: script => console.log('Script unloaded')
    })
}

module.exports = inject;