import React, { useState } from "react";
import PortSelector from "./components/PortSelector";
import ConnectionStatus from "./components/ConnectionStatus";
import CommandSender from "./components/CommandSender";

const App = () => {
    const [selectedPort, setSelectedPort] = useState("");

    return (
        <div style={{ padding: "20px" }}>
            <h1>Arduino Control Application</h1>
            <PortSelector onPortSelect={setSelectedPort} />
            {selectedPort && (
                <>
                    <p>Selected Port: {selectedPort}</p>
                    <ConnectionStatus selectedPort={selectedPort} />
                    <CommandSender />
                </>
            )}
        </div>
    );
};

export default App;
