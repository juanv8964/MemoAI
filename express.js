import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
const app = express();
const PORT = 8000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MCP Error Codes
const MCP_ERRORS = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
};
// Tool implementations
const tools = {
  add: (args) => {
    if (typeof args.a !== 'number' || typeof args.b !== 'number') {
      throw new Error('Parameters a and b must be numbers');
    }
    return `Result: ${args.a + args.b}`;
  },
  
  reverse: (args) => {
    if (typeof args.text !== 'string') {
      throw new Error('Parameter text must be a string');
    }
    return `Result: ${args.text.split('').reverse().join('')}`;
  },
  
  multiply: (args) => {
    if (typeof args.a !== 'number' || typeof args.b !== 'number') {
      throw new Error('Parameters a and b must be numbers');
    }
    return `Result: ${args.a * args.b}`;
  },
  saveconversation: async (args) => {
    if(typeof args.content !== 'string') {
      throw new Error("Parameter text must be a string")
    }
    if (typeof args.model != null && typeof args.model !== 'string'){
      throw new Error('model must be a string if given');
    }
    const body = new FormData();
    body.append('htmlDoc', new Blob([content], { type: 'text/html'}));
    body.append('model', model);
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 15000);
    try {
    const response = await fetch(`${url}/api/conversation`,{
      method:'POST',
      headers: {
        'Accept': 'application/json'},
      body,
      signal: ac.signal,
    });
    if (!response.ok){
      const text = await response.text().catch(() => '');
      throw new Error(`API error ${res.status}: ${text.slice(0,200)}`);
    }
    const data = await response.json().catch(() => ({}));
    if (!data?.url) throw new Error('API did not return a url');
    return `sucessfully saved conversation to my website: ${data.url}`;
  } catch (err){
      throw new Error(`request failed: ${err.message}`);
    } finally {
    clearTimeout(timer);
  }
},
}


// Tool schemas
const toolSchemas = [
  {
    name: 'add',
    description: 'Add two numbers together',
    inputSchema: {
      type: 'object',
      properties: {
        a: { type: 'number', description: 'First number' },
        b: { type: 'number', description: 'Second number' }
      },
      required: ['a', 'b']
    }
  },
  {
    name: 'reverse',
    description: 'Reverse a string',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Text to reverse' }
      },
      required: ['text']
    }
  },
  {
    name: 'multiply',
    description: 'Multiply two numbers',
    inputSchema: {
      type: 'object',
      properties: {
        a: { type: 'number', description: 'First number' },
        b: { type: 'number', description: 'Second number' }
      },
      required: ['a', 'b']
    }
  },
  {
  name: 'saveconversation',
  description: 'Save a conversation as an HTML or plain text, then upload to my websites database. make sure it is a string',
  inputSchema: {
  type: 'object',
  properties: {
    content: { type: 'string', description: 'the conversation as a string. this is what you will upload. make sure the question i asked is also in here'},
    model: {type: 'string', description: 'claude is the model. you will have claude as the model and you will upload it regardless of the user giving the model or not'}
  },
  required:['content']
  }
  }
];

// Main MCP endpoint
app.post('/mcp', (req, res) => {
  console.log('📨 Received MCP request:', JSON.stringify(req.body, null, 2));
  
  const { method, params, id, jsonrpc } = req.body;
  
  try {
    // Handle notifications (no response needed)
    if (id === undefined && method) {
      console.log(`🔔 Handling notification: ${method}`);
      switch (method) {
        case 'notifications/initialized':
          console.log('✅ Client initialized successfully');
          break;
        case 'notifications/cancelled':
          console.log('❌ Request cancelled');
          break;
        default:
          console.log(`❓ Unknown notification: ${method}`);
      }
      res.status(204).end();
      return;
    }

    // Validate required fields for requests
    if (!jsonrpc || jsonrpc !== '2.0') {
      return res.status(400).json({
        jsonrpc: '2.0',
        id: id || null,
        error: {
          code: MCP_ERRORS.INVALID_REQUEST,
          message: 'Invalid or missing jsonrpc field'
        }
      });
    }

    if (!method) {
      return res.status(400).json({
        jsonrpc: '2.0',
        id: id || null,
        error: {
          code: MCP_ERRORS.INVALID_REQUEST,
          message: 'Missing method field'
        }
      });
    }

    if (id === undefined) {
      return res.status(400).json({
        jsonrpc: '2.0',
        id: null,
        error: {
          code: MCP_ERRORS.INVALID_REQUEST,
          message: 'Missing id field for request'
        }
      });
    }

    // Handle method calls
    switch (method) {
      case 'initialize':
        console.log('🤝 Initializing MCP connection');
        res.json({
          jsonrpc: '2.0',
          id: id,
          result: {
            protocolVersion: '2025-06-18',
            capabilities: {
              tools: {}
            },
            serverInfo: {
              name: 'Demo MCP Server',
              version: '1.0.0'
            }
          }
        });
        break;
        
      case 'tools/list':
        console.log('📋 Listing available tools');
        res.json({
          jsonrpc: '2.0',
          id: id,
          result: {
            tools: toolSchemas
          }
        });
        break;
        
      case 'tools/call':
        if (!params || !params.name || !params.arguments) {
          return res.status(400).json({
            jsonrpc: '2.0',
            id: id,
            error: {
              code: MCP_ERRORS.INVALID_PARAMS,
              message: 'Missing required parameters: name and arguments'
            }
          });
        }

        const { name, arguments: args } = params;
        console.log(`🔧 Calling tool: ${name} with args:`, args);

        if (!tools[name]) {
          return res.status(400).json({
            jsonrpc: '2.0',
            id: id,
            error: {
              code: MCP_ERRORS.METHOD_NOT_FOUND,
              message: `Unknown tool: ${name}`
            }
          });
        }

        try {
          const result = tools[name](args);
          console.log(`✅ Tool ${name} result:`, result);
          
          res.json({
            jsonrpc: '2.0',
            id: id,
            result: {
              content: [
                { type: 'text', text: result }
              ]
            }
          });
        } catch (toolError) {
          console.error(`❌ Tool ${name} error:`, toolError.message);
          res.status(400).json({
            jsonrpc: '2.0',
            id: id,
            error: {
              code: MCP_ERRORS.INVALID_PARAMS,
              message: toolError.message
            }
          });
        }
        break;
        
      default:
        res.status(400).json({
          jsonrpc: '2.0',
          id: id,
          error: {
            code: MCP_ERRORS.METHOD_NOT_FOUND,
            message: `Method not found: ${method}`
          }
        });
    }
  } catch (error) {
    console.error('💥 Server error:', error);
    res.status(500).json({
      jsonrpc: '2.0',
      id: id || null,
      error: {
        code: MCP_ERRORS.INTERNAL_ERROR,
        message: error.message
      }
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    server: 'Demo MCP Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Debug endpoint
app.get('/mcp', (req, res) => {
  res.json({ 
    message: 'MCP Server is running',
    note: 'Use POST requests for MCP protocol communication',
    endpoints: {
      '/mcp': 'POST - MCP protocol endpoint',
      '/health': 'GET - Health check',
      '/debug': 'GET - Server debug info'
    }
  });
});

// Debug info endpoint
app.get('/debug', (req, res) => {
  res.json({
    server: 'Demo MCP Server',
    version: '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    availableTools: toolSchemas.map(tool => ({
      name: tool.name,
      description: tool.description
    }))
  });
});
// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 =================================');
  console.log(`🚀 MCP Server running on port ${PORT}`);
  console.log('🚀 =================================');
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 MCP endpoint: http://localhost:${PORT}/mcp`);
  console.log(`🐛 Debug info: http://localhost:${PORT}/debug`);
  console.log('🚀 =================================');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});