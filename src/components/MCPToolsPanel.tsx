import React, { useState, useEffect } from 'react';
import { Wrench, Code, Play, AlertCircle, CheckCircle, Wifi, WifiOff } from 'lucide-react';

interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

interface MCPToolsPanelProps {
  tools: MCPTool[];
  onCallTool: (toolName: string, args: any) => Promise<any>;
  isConnected: boolean;
}

const MCPToolsPanel: React.FC<MCPToolsPanelProps> = ({
  tools,
  onCallTool,
  isConnected,
}) => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [toolArgs, setToolArgs] = useState<Record<string, any>>({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [mcpStatus, setMcpStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  // Check MCP connection status
  useEffect(() => {
    const checkMCPStatus = () => {
      if (tools.length > 0) {
        setMcpStatus('connected');
      } else {
        setMcpStatus('disconnected');
      }
    };

    checkMCPStatus();
  }, [tools]);

  const handleToolCall = async () => {
    if (!selectedTool) return;

    setIsExecuting(true);
    try {
      const result = await onCallTool(selectedTool, toolArgs);
      setLastResult(result);
      console.log('MCP Tool result:', result);
    } catch (error) {
      console.error('MCP Tool error:', error);
      setLastResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsExecuting(false);
    }
  };

  const renderInputField = (propName: string, propSchema: any) => {
    const value = toolArgs[propName] || '';
    
    const handleChange = (newValue: any) => {
      setToolArgs(prev => ({ ...prev, [propName]: newValue }));
    };

    switch (propSchema.type) {
      case 'string':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={propSchema.description || `Enter ${propName}`}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleChange(parseFloat(e.target.value))}
            placeholder={propSchema.description || `Enter ${propName}`}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        );
      case 'boolean':
        return (
          <button
            onClick={() => handleChange(!value)}
            className={`w-12 h-6 rounded-full transition-colors ${
              value ? 'bg-purple-500' : 'bg-white/20'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
              value ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        );
      case 'object':
        return (
          <textarea
            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleChange(parsed);
              } catch {
                handleChange(e.target.value);
              }
            }}
            placeholder="Enter JSON object"
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono text-sm"
            rows={3}
          />
        );
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={`Enter ${propName}`}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        );
    }
  };

  const selectedToolSchema = tools.find(t => t.name === selectedTool);

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold text-lg flex items-center space-x-2">
          <Wrench className="w-5 h-5 text-purple-400" />
          <span>MCP Tools</span>
        </h3>
        
        <div className="flex items-center space-x-4">
          {/* MCP Status */}
          <div className="flex items-center space-x-2">
            {mcpStatus === 'connected' ? (
              <Wifi className="w-4 h-4 text-green-400" />
            ) : mcpStatus === 'disconnected' ? (
              <WifiOff className="w-4 h-4 text-red-400" />
            ) : (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            <span className="text-white/70 text-sm">
              {mcpStatus === 'connected' ? 'MCP Connected' : 
               mcpStatus === 'disconnected' ? 'MCP Disconnected' : 'Checking...'}
            </span>
          </div>
          
          {/* Tool Count */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-400' : 'bg-red-400'
            }`}></div>
            <span className="text-white/70 text-sm">
              {tools.length} tools
            </span>
          </div>
        </div>
      </div>

      {/* MCP Status Info */}
      <div className={`border rounded-lg p-3 ${
        mcpStatus === 'connected' 
          ? 'bg-green-500/10 border-green-500/20' 
          : 'bg-red-500/10 border-red-500/20'
      }`}>
        <div className="flex items-center space-x-2 mb-1">
          {mcpStatus === 'connected' ? (
            <CheckCircle className="w-4 h-4 text-green-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400" />
          )}
          <span className={`font-medium text-sm ${
            mcpStatus === 'connected' ? 'text-green-300' : 'text-red-300'
          }`}>
            {mcpStatus === 'connected' ? 'Smithery MCP Active' : 'MCP Connection Issue'}
          </span>
        </div>
        <p className="text-white/60 text-xs">
          {mcpStatus === 'connected' 
            ? 'Connected to Smithery API with Tavus MCP tools'
            : 'Using fallback simulation - check Smithery API connection'
          }
        </p>
      </div>

      {/* Tool Selection */}
      <div className="space-y-3">
        <label className="text-white/80 text-sm font-medium">Select MCP Tool</label>
        <select
          value={selectedTool || ''}
          onChange={(e) => {
            setSelectedTool(e.target.value || null);
            setToolArgs({});
            setLastResult(null);
          }}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="" className="bg-gray-800">Select an MCP tool...</option>
          {tools.map((tool) => (
            <option key={tool.name} value={tool.name} className="bg-gray-800">
              {tool.name} - {tool.description}
            </option>
          ))}
        </select>
      </div>

      {/* Tool Parameters */}
      {selectedToolSchema && (
        <div className="space-y-4">
          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2 flex items-center space-x-2">
              <Code className="w-4 h-4" />
              <span>MCP Tool Parameters</span>
            </h4>
            <p className="text-white/60 text-sm mb-4">{selectedToolSchema.description}</p>
            
            <div className="space-y-3">
              {Object.entries(selectedToolSchema.inputSchema.properties).map(([propName, propSchema]) => (
                <div key={propName} className="space-y-2">
                  <label className="text-white/80 text-sm font-medium flex items-center space-x-2">
                    <span>{propName}</span>
                    {selectedToolSchema.inputSchema.required?.includes(propName) && (
                      <span className="text-red-400 text-xs">*</span>
                    )}
                  </label>
                  {renderInputField(propName, propSchema)}
                  {(propSchema as any).description && (
                    <p className="text-white/50 text-xs">{(propSchema as any).description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Execute Button */}
          <button
            onClick={handleToolCall}
            disabled={!isConnected || isExecuting}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 disabled:opacity-50 text-white py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 disabled:scale-100 flex items-center justify-center space-x-2"
          >
            {isExecuting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Executing MCP Tool...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Execute MCP Tool</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Last Result */}
      {lastResult && (
        <div className="bg-white/5 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2 flex items-center space-x-2">
            {lastResult.error ? (
              <AlertCircle className="w-4 h-4 text-red-400" />
            ) : (
              <CheckCircle className="w-4 h-4 text-green-400" />
            )}
            <span>MCP Tool Result</span>
          </h4>
          <pre className="text-white/80 text-sm bg-black/20 rounded p-3 overflow-auto max-h-32 font-mono">
            {JSON.stringify(lastResult, null, 2)}
          </pre>
        </div>
      )}

      {/* No Tools Message */}
      {tools.length === 0 && (
        <div className="text-center text-white/50 py-8">
          <WifiOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No MCP tools available</p>
          <p className="text-xs mt-1">Check Smithery API connection</p>
          <div className="mt-4 text-xs text-white/40">
            <p>API Key: 4e10...bb18</p>
            <p>Endpoint: api.smithery.ai/v1/mcp/tavus</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MCPToolsPanel;