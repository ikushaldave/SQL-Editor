/**
 * Plugin system types
 * @packageDocumentation
 */

import type { CompletionProvider } from './autocomplete';
import type { Validator } from './validator';

/**
 * Plugin interface
 */
export interface Plugin {
  /** Plugin name */
  name: string;
  /** Plugin version */
  version: string;
  /** Plugin description */
  description?: string;

  /**
   * Initialize plugin
   * @param context - Plugin context
   */
  onInit?(context: PluginContext): void;

  /**
   * Cleanup plugin
   */
  onDestroy?(): void;

  /** Completion providers */
  completionProviders?: CompletionProvider[];

  /** Validators */
  validators?: Validator[];

  /** Custom commands */
  commands?: Command[];
}

/**
 * Plugin context
 */
export interface PluginContext {
  /** Plugin configuration */
  config?: Record<string, any>;
  /** Logger instance */
  logger?: Logger;
}

/**
 * Command interface
 */
export interface Command {
  /** Command name */
  name: string;
  /** Command description */
  description?: string;
  /** Keybinding */
  bindKey?: KeyBinding;
  /** Execute command */
  exec: (args?: any) => void | Promise<void>;
}

/**
 * Key binding
 */
export interface KeyBinding {
  /** Windows/Linux keybinding */
  win?: string;
  /** Mac keybinding */
  mac?: string;
}

/**
 * Logger interface
 */
export interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

