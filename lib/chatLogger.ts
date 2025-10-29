import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const LOG_DIR = path.join(process.cwd(), 'log');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

export interface ChatLogEntry {
  timestamp: string;
  sessionId: string;
  type: 'user' | 'assistant' | 'system' | 'error';
  message: string;
  metadata?: Record<string, any>;
}

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  return uuidv4();
}

/**
 * Get log file path for a session
 */
function getLogFilePath(sessionId: string): string {
  const filename = `chat-${sessionId}.log`;
  return path.join(LOG_DIR, filename);
}

/**
 * Format timestamp for logging
 */
function formatTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Log a chat message to the session log file
 */
export function logChatMessage(
  sessionId: string,
  type: 'user' | 'assistant' | 'system' | 'error',
  message: string,
  metadata?: Record<string, any>
): void {
  const entry: ChatLogEntry = {
    timestamp: formatTimestamp(),
    sessionId,
    type,
    message,
    metadata,
  };

  const logLine = JSON.stringify(entry) + '\n';
  const logFilePath = getLogFilePath(sessionId);

  try {
    fs.appendFileSync(logFilePath, logLine, 'utf8');
  } catch (error) {
    console.error('Error writing to chat log:', error);
  }
}

/**
 * Log user message
 */
export function logUserMessage(sessionId: string, message: string, metadata?: Record<string, any>): void {
  logChatMessage(sessionId, 'user', message, metadata);
}

/**
 * Log assistant response
 */
export function logAssistantMessage(sessionId: string, message: string, metadata?: Record<string, any>): void {
  logChatMessage(sessionId, 'assistant', message, metadata);
}

/**
 * Log system message
 */
export function logSystemMessage(sessionId: string, message: string, metadata?: Record<string, any>): void {
  logChatMessage(sessionId, 'system', message, metadata);
}

/**
 * Log error
 */
export function logError(sessionId: string, error: string | Error, metadata?: Record<string, any>): void {
  const errorMessage = error instanceof Error ? error.message : error;
  logChatMessage(sessionId, 'error', errorMessage, metadata);
}

/**
 * Read all log entries for a session
 */
export function readSessionLog(sessionId: string): ChatLogEntry[] {
  const logFilePath = getLogFilePath(sessionId);

  if (!fs.existsSync(logFilePath)) {
    return [];
  }

  try {
    const content = fs.readFileSync(logFilePath, 'utf8');
    const lines = content.trim().split('\n').filter(line => line.length > 0);
    return lines.map(line => JSON.parse(line) as ChatLogEntry);
  } catch (error) {
    console.error('Error reading session log:', error);
    return [];
  }
}

/**
 * Get all session log files
 */
export function getAllSessionIds(): string[] {
  try {
    const files = fs.readdirSync(LOG_DIR);
    return files
      .filter(file => file.startsWith('chat-') && file.endsWith('.log'))
      .map(file => file.replace('chat-', '').replace('.log', ''));
  } catch (error) {
    console.error('Error reading log directory:', error);
    return [];
  }
}

/**
 * Delete old log files (older than specified days)
 */
export function cleanOldLogs(daysToKeep: number = 30): void {
  try {
    const files = fs.readdirSync(LOG_DIR);
    const now = Date.now();
    const maxAge = daysToKeep * 24 * 60 * 60 * 1000; // Convert days to milliseconds

    files.forEach(file => {
      if (file.startsWith('chat-') && file.endsWith('.log')) {
        const filePath = path.join(LOG_DIR, file);
        const stats = fs.statSync(filePath);
        const age = now - stats.mtimeMs;

        if (age > maxAge) {
          fs.unlinkSync(filePath);
          console.log(`Deleted old log file: ${file}`);
        }
      }
    });
  } catch (error) {
    console.error('Error cleaning old logs:', error);
  }
}
