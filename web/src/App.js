import React, {useContext, useEffect, useState} from 'react';
import VibratorSearchButton from './VibratorSearchButton'
import {ButtplugDeviceContext, ButtplugDeviceController} from "@maustec/react-buttplug";
import useWebSocket, { ReadyState } from 'react-use-websocket';

const App = () => {
    const [damage, setDamage] = useState(0);
    const [attached, setAttached] = useState(false);
    const [vibrateSpeed, setVibrateSpeed] = useState(0);

    const { sendMessage, lastMessage, readyState } = useWebSocket('ws://localhost:3169/socket')

    const { devices } = useContext(ButtplugDeviceContext);
    let timeout = null;
    let interval = null;
    let taperSpeed = 0;

    const handleMessage = (message, args) => {
        switch(message) {
            case 'attached':
                setAttached(true);
                break;
            case 'ON_DAMAGE':
                onDamage(args)
                break;
            case 'ON_ANIMATION_EVENT':
                onAnimationEvent(args)
                break;
            default:
                console.log(message, args);
                break;
        }
    }

    useEffect(() => {
        const { data } = lastMessage || {};
        try {
            const {message, args} = JSON.parse(data) || {};
            console.log(message, args);
            handleMessage(message, args);
        } catch(e) {
            console.warn(e);
        }
    }, [lastMessage]);

    const onDamage = ({ damage }) => {
        setDamage(damage)

        const buzzDuration = 100 * Math.abs(damage)
        const buzzAmount = Math.max(0.5 + (damage / 40), 1.0)

        if (buzzDuration > 0) {
            if (timeout) clearTimeout(timeout)
            timeout = setTimeout(() => {
                setVibrateSpeed(0);
            }, buzzDuration);
            setVibrateSpeed(buzzAmount);
        }
    }

    const send = (message, args) => {
        sendMessage(JSON.stringify({
            message: message,
            args: args
        }))
    }

    let lastIndex = 0;

    const onAnimationEvent = ({ index, type }) => {
        if (interval) clearInterval(interval)
        if (index === 'none') {
            index = lastIndex
        } else if(type === 'GetIncrease') {
            lastIndex = index * 2
        } else {
            lastIndex = index
        }

        taperSpeed = 0.7 + Math.min(0.3, (index/3) * 0.3)
        console.log(taperSpeed, index)
        setVibrateSpeed(taperSpeed)
        let pulseCount = 0;
        let delay = 300 * (index + 1)

        if (lastIndex > 3) {
            delay = 300
        }

        interval = setInterval(() => {
            if (lastIndex >= 2) {
                taperSpeed = (!taperSpeed) * 1.0
                setVibrateSpeed(Math.min(1.0, taperSpeed));
                pulseCount++;
                console.log("pulse: " , pulseCount, taperSpeed)
                if (pulseCount > lastIndex * 2) {
                    clearInterval(interval)
                }
                return
            }
            taperSpeed = taperSpeed - 0.1
            setVibrateSpeed(Math.max(taperSpeed, 0))
            console.log("vibrate speed", taperSpeed)
            if (taperSpeed <= 0)
                clearInterval(interval);
        }, delay);
    }

    useEffect(() => {
        // ipcRenderer.off('ON_DAMAGE', onDamage)
        // ipcRenderer.on('ON_DAMAGE', onDamage)
        //
        // ipcRenderer.off('ON_ANIMATION_EVENT', onAnimationEvent)
        // ipcRenderer.on('ON_ANIMATION_EVENT', onAnimationEvent)
        //
        // ipcRenderer.on('ATTACHED', (event, data) => {
        //     setAttached(true);
        // })
    }, [])

    const handleAttach = (e) => {
        e.preventDefault();
        setAttached(null)
        send("inject")
    }

    if (readyState !== ReadyState.OPEN) {
        return (
            <div>Connecting...</div>
        )
    }

    if (attached) {
        return (
            <div>
                <VibratorSearchButton />
                <ul>
                    { devices.map((device) => (
                        <ButtplugDeviceController key={device.Index} device={device} vibrate={vibrateSpeed}>
                            <li>{device.Name}</li>
                        </ButtplugDeviceController>
                    ))}
                </ul>
                <h1>Last Damage: { damage }</h1>
            </div>
        )
    }

    if (attached === null) {
        return (
            <p>Attaching...</p>
        )
    }

    return (
        <a href={"#"} onClick={handleAttach}>attach to game</a>
    )

}

export default App