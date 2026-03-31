import React, { useEffect, useState, useRef } from 'react';
import { Activity, Circle, AlertCircle } from 'lucide-react';

const LiveLogViewer = ({ runId }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const bottomRef = useRef(null);
  const socketRef = useRef<WebSocket | null>(null);
  const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost/";
  useEffect(() => {
    if (!runId) return;
     if (socketRef.current) return;

    let isCurrentConnection = true;
    const wsUrl = `wss://visivo-server.oact.inaf.it/api/data/ws/logs/${runId}`;
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;
    ws.onopen = () => {
      if (socketRef.current === ws) {
      console.log("Connessione stabilita con successo");
      setIsConnected(true);
      setLogs(["Stream iniziato..."]);
    }
    };

    ws.onmessage = (event) => {
      if (socketRef.current === ws) {
      setLogs((prev) => [...prev, event.data]);
      }
    };

    ws.onerror = (error) => {
      if (!isCurrentConnection) return;
      console.error("Errore WebSocket:", error);
      setLogs(prev => [...prev, "ERROR: Connection failed"]);
      setIsConnected(false);
    };

    ws.onclose = () => {
      if (socketRef.current === ws) {
      console.log("WebSocket chiusa dal server. Codice:", event.code);
      setIsConnected(false);
      }
    };

    return () => {
     if (socketRef.current === ws) {
      console.log("Pulizia: chiusura socket");
      ws.close();
      socketRef.current = null;
    }
    };
  }, [runId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const getLogStyle = (line: string) => {
    if (line.includes('ERROR') || line.includes('failed')) {
      return 'text-red-500';
    }
    if (line.includes('WARNING') || line.includes('WARN')) {
      return 'text-amber-500';
    }
    if (line.includes('Connected') || line.includes('SUCCESS')) {
      return 'text-emerald-500';
    }
    if (line.includes('ended') || line.includes('Stream')) {
      return 'text-blue-400';
    }
    return 'text-slate-300';
  };

  

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-white" />
              <h2 className="text-white">Live Logs</h2>
            </div>
            <div className="flex items-center gap-2">
              <Circle 
                className={`w-2 h-2 ${isConnected ? 'fill-green-400 text-green-400 animate-pulse' : 'fill-slate-400 text-slate-400'}`} 
              />
              <span className="text-white text-sm">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          <p className="text-blue-100 text-sm mt-1">Run ID: {runId}</p>
        </div>

        {/* Log Content */}
        <div className="bg-slate-900 p-6 h-[500px] overflow-y-auto">
          <div className="space-y-1">
            {logs.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-500">
                <div className="text-center">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Waiting for logs...</p>
                </div>
              </div>
            ) : (
              logs.map((line, index) => (
                <div 
                  key={index} 
                  className="flex gap-3 py-1 px-3 rounded hover:bg-slate-800/50 transition-colors"
                >
                  <span className="text-slate-500 text-xs select-none min-w-[40px] mt-0.5">
                    {String(index + 1).padStart(3, '0')}
                  </span>
                  <span className={`font-mono text-sm break-all ${getLogStyle(line)}`}>
                    {line}
                  </span>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{logs.length} log entries</span>
            </div>
            <span>Auto-scroll enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LiveLogViewer;