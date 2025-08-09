import { Client, GatewayIntentBits, ChannelType, VoiceChannel, Guild, VoiceState } from 'discord.js';
import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } from '@discordjs/voice';

interface VoiceSession {
  sessionId: number;
  channelId: string;
  guildId: string;
  participants: string[];
  isActive: boolean;
}

class DiscordVoiceService {
  private client: Client;
  private voiceSessions: Map<number, VoiceSession> = new Map();
  private isReady = false;

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
      ],
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.client.on('ready', () => {
      console.log(`Discord bot logged in as ${this.client.user?.tag}`);
      this.isReady = true;
    });

    this.client.on('voiceStateUpdate', (oldState, newState) => {
      this.handleVoiceStateUpdate(oldState, newState);
    });

    this.client.on('error', (error) => {
      console.error('Discord client error:', error);
    });
  }

  async initialize() {
    if (!process.env.DISCORD_BOT_TOKEN) {
      console.warn('Discord bot token not found. Voice chat will be disabled.');
      return false;
    }

    try {
      await this.client.login(process.env.DISCORD_BOT_TOKEN);
      return true;
    } catch (error) {
      console.error('Failed to initialize Discord bot:', error);
      return false;
    }
  }

  async createVoiceChannel(sessionId: number, sessionName: string): Promise<string | null> {
    if (!this.isReady || !process.env.DISCORD_GUILD_ID) {
      return null;
    }

    try {
      const guild = await this.client.guilds.fetch(process.env.DISCORD_GUILD_ID);
      const channel = await guild.channels.create({
        name: `Session-${sessionId}-${sessionName}`,
        type: ChannelType.GuildVoice,
        permissionOverwrites: [
          {
            id: guild.roles.everyone.id,
            allow: ['Connect', 'Speak', 'UseVAD'],
          },
        ],
      });

      const voiceSession: VoiceSession = {
        sessionId,
        channelId: channel.id,
        guildId: guild.id,
        participants: [],
        isActive: true,
      };

      this.voiceSessions.set(sessionId, voiceSession);
      return channel.id;
    } catch (error) {
      console.error('Failed to create voice channel:', error);
      return null;
    }
  }

  async joinVoiceChannel(sessionId: number, userId: string): Promise<boolean> {
    const session = this.voiceSessions.get(sessionId);
    if (!session || !session.isActive) {
      return false;
    }

    try {
      const guild = await this.client.guilds.fetch(session.guildId);
      const channel = await guild.channels.fetch(session.channelId) as VoiceChannel;

      if (!channel) {
        return false;
      }

      // Add user to participants if not already there
      if (!session.participants.includes(userId)) {
        session.participants.push(userId);
      }

      return true;
    } catch (error) {
      console.error('Failed to join voice channel:', error);
      return false;
    }
  }

  async leaveVoiceChannel(sessionId: number, userId: string): Promise<boolean> {
    const session = this.voiceSessions.get(sessionId);
    if (!session) {
      return false;
    }

    // Remove user from participants
    session.participants = session.participants.filter(id => id !== userId);

    // If no participants left, delete the channel
    if (session.participants.length === 0) {
      await this.deleteVoiceChannel(sessionId);
    }

    return true;
  }

  async deleteVoiceChannel(sessionId: number): Promise<boolean> {
    const session = this.voiceSessions.get(sessionId);
    if (!session) {
      return false;
    }

    try {
      const guild = await this.client.guilds.fetch(session.guildId);
      const channel = await guild.channels.fetch(session.channelId);

      if (channel) {
        await channel.delete();
      }

      this.voiceSessions.delete(sessionId);
      return true;
    } catch (error) {
      console.error('Failed to delete voice channel:', error);
      return false;
    }
  }

  private async handleVoiceStateUpdate(oldState: VoiceState, newState: VoiceState) {
    // Handle when users join/leave voice channels
    const session = Array.from(this.voiceSessions.values()).find(
      s => s.channelId === newState.channelId || s.channelId === oldState.channelId
    );

    if (session) {
      // Update participants list
      const channel = await newState.guild.channels.fetch(session.channelId);
      if (channel && channel.members) {
        session.participants = Array.from(channel.members.keys());
      }
    }
  }

  getSessionParticipants(sessionId: number): string[] {
    const session = this.voiceSessions.get(sessionId);
    return session ? session.participants : [];
  }

  isSessionActive(sessionId: number): boolean {
    const session = this.voiceSessions.get(sessionId);
    return session ? session.isActive : false;
  }

  async generateInviteLink(sessionId: number): Promise<string | null> {
    const session = this.voiceSessions.get(sessionId);
    if (!session || !session.isActive) {
      return null;
    }

    try {
      const guild = await this.client.guilds.fetch(session.guildId);
      const channel = await guild.channels.fetch(session.channelId);

      if (channel) {
        const invite = await channel.createInvite({
          maxAge: 3600, // 1 hour
          maxUses: 10,
          unique: true,
        });

        return invite.url;
      }
    } catch (error) {
      console.error('Failed to generate invite link:', error);
    }

    return null;
  }

  async sendMessageToChannel(sessionId: number, message: string): Promise<boolean> {
    const session = this.voiceSessions.get(sessionId);
    if (!session || !session.isActive) {
      return false;
    }

    try {
      const guild = await this.client.guilds.fetch(session.guildId);
      const channel = await guild.channels.fetch(session.channelId);

      if (channel && channel.isTextBased()) {
        await channel.send(message);
        return true;
      }
    } catch (error) {
      console.error('Failed to send message to channel:', error);
    }

    return false;
  }

  // WebRTC fallback for when Discord is not available
  createWebRTCRoom(sessionId: number): string {
    // Generate a simple room ID for WebRTC
    const roomId = `room_${sessionId}_${Date.now()}`;
    
    // In a real implementation, you would integrate with a WebRTC service
    // like Twilio, Agora, or a custom WebRTC server
    
    return roomId;
  }

  // Get voice chat statistics
  getVoiceStats() {
    const activeSessions = Array.from(this.voiceSessions.values()).filter(s => s.isActive);
    const totalParticipants = activeSessions.reduce((sum, session) => sum + session.participants.length, 0);

    return {
      activeSessions: activeSessions.length,
      totalParticipants,
      sessions: activeSessions.map(session => ({
        sessionId: session.sessionId,
        participants: session.participants.length,
        channelId: session.channelId,
      })),
    };
  }
}

// Export singleton instance
export const discordVoiceService = new DiscordVoiceService();

// Initialize the service when the module is loaded
if (process.env.DISCORD_BOT_TOKEN) {
  discordVoiceService.initialize().then(success => {
    if (success) {
      console.log('Discord voice service initialized successfully');
    } else {
      console.warn('Discord voice service initialization failed');
    }
  });
} 