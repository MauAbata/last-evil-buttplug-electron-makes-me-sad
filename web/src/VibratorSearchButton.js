import {useContext, useEffect, useState} from 'react'
import { ButtplugDeviceContext } from '@maustec/react-buttplug'

const VibratorSearchButton = () => {
    const { buttplugReady, startScanning } = useContext(ButtplugDeviceContext);
    const [ scanning, setScanning ] = useState(false)

    const handleClick = (e) => {
        e.preventDefault();
        setScanning(true)
        startScanning()
            .then(console.log)
            .catch(console.error)
            .finally(() => {
                setScanning(false);
            })
    }

    if (buttplugReady) {
        if (scanning) {
            return (
                <div>
                    <p>Scanning for Devices...</p>
                </div>
            )
        }

        return (
            <a onClick={handleClick} href='#'>Start Searching</a>
        )
    } else {
        return (
            <p>Waiting for Buttplugs...</p>
        )
    }
}

export default VibratorSearchButton