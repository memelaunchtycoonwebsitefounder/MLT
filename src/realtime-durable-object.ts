/**
 * Realtime Durable Object
 * Handles WebSocket connections for real-time updates
 */

export class RealtimeDurableObject {
  private state: DurableObjectState;
  private sessions: Map<WebSocket, { userId?: number; subscribedCoins: Set<number> }>;

  constructor(state: DurableObjectState) {
    this.state = state;
    this.sessions = new Map();
  }

  async fetch(request: Request): Promise<Response> {
    // Upgrade to WebSocket
    if (request.headers.get('Upgrade') === 'websocket') {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      await this.handleSession(server as WebSocket);

      return new Response(null, {
        status: 101,
        webSocket: client as WebSocket,
      });
    }

    return new Response('Expected WebSocket', { status: 400 });
  }

  async handleSession(ws: WebSocket) {
    ws.accept();

    // Initialize session
    this.sessions.set(ws, {
      subscribedCoins: new Set()
    });

    ws.addEventListener('message', async (event) => {
      try {
        const data = JSON.parse(event.data as string);
        await this.handleMessage(ws, data);
      } catch (error) {
        console.error('[WS] Message error:', error);
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'Invalid message format' 
        }));
      }
    });

    ws.addEventListener('close', () => {
      this.sessions.delete(ws);
    });

    ws.addEventListener('error', (error) => {
      console.error('[WS] WebSocket error:', error);
      this.sessions.delete(ws);
    });

    // Send welcome message
    ws.send(JSON.stringify({ 
      type: 'connected', 
      message: 'Connected to MemeLaunch real-time service' 
    }));
  }

  async handleMessage(ws: WebSocket, data: any) {
    const session = this.sessions.get(ws);
    if (!session) return;

    switch (data.type) {
      case 'auth':
        // Authenticate user
        session.userId = data.userId;
        ws.send(JSON.stringify({ 
          type: 'auth_success', 
          userId: data.userId 
        }));
        break;

      case 'subscribe_coin':
        // Subscribe to coin updates
        if (data.coinId) {
          session.subscribedCoins.add(data.coinId);
          ws.send(JSON.stringify({ 
            type: 'subscribed', 
            coinId: data.coinId 
          }));
        }
        break;

      case 'unsubscribe_coin':
        // Unsubscribe from coin updates
        if (data.coinId) {
          session.subscribedCoins.delete(data.coinId);
          ws.send(JSON.stringify({ 
            type: 'unsubscribed', 
            coinId: data.coinId 
          }));
        }
        break;

      case 'ping':
        // Heartbeat
        ws.send(JSON.stringify({ type: 'pong' }));
        break;

      default:
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'Unknown message type' 
        }));
    }
  }

  /**
   * Broadcast update to all subscribed clients
   */
  async broadcastCoinUpdate(coinId: number, data: any) {
    const message = JSON.stringify({
      type: 'coin_update',
      coinId,
      data
    });

    for (const [ws, session] of this.sessions.entries()) {
      if (session.subscribedCoins.has(coinId)) {
        try {
          ws.send(message);
        } catch (error) {
          console.error('[WS] Broadcast error:', error);
          this.sessions.delete(ws);
        }
      }
    }
  }

  /**
   * Broadcast trade notification to all clients
   */
  async broadcastTrade(trade: any) {
    const message = JSON.stringify({
      type: 'trade',
      data: trade
    });

    for (const [ws] of this.sessions.entries()) {
      try {
        ws.send(message);
      } catch (error) {
        console.error('[WS] Broadcast error:', error);
        this.sessions.delete(ws);
      }
    }
  }

  /**
   * Broadcast notification to specific user or all users
   */
  async broadcastNotification(notification: any, userId?: number) {
    const message = JSON.stringify({
      type: 'notification',
      data: notification
    });

    for (const [ws, session] of this.sessions.entries()) {
      if (!userId || session.userId === userId) {
        try {
          ws.send(message);
        } catch (error) {
          console.error('[WS] Broadcast error:', error);
          this.sessions.delete(ws);
        }
      }
    }
  }
}

// Export for Cloudflare Workers
export default {
  RealtimeDurableObject
};
