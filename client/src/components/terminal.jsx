import { Terminal as XTerminal } from '@xterm/xterm'
import { useEffect, useRef } from 'react'
import socket from '../socket';
import '@xterm/xterm/css/xterm.css'

export default function terminal() {
    const terminalRef = useRef();
    const isRendered = useRef(false)
    const terminalInstance = useRef(null);

    useEffect(() => {
        // if (isRendered.current) return;
        // isRendered.current = true;

        if (!terminalRef.current || terminalInstance.current) return;

        console.log('Terminal Ref:', terminalRef.current);

        const term = new XTerminal({ rows: 20 });
        terminalInstance.current = term;

        term.open(terminalRef.current);

        term.onData(data => {
            socket.emit("terminal:write", data)
        })

        function onTerminalData(data) {
            term.write(data);
            console.log('Received data from backend:', data);
        }

        socket.on('terminal:data', onTerminalData)

        return () => {
            socket.off("terminal:data", onTerminalData)
            term.dispose();
            terminalInstance.current = null;
        }


    }, [])

    return (
        <div ref={terminalRef} id="terminal"></div>
    )
}
