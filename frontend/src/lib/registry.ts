import registry from '../../agent_registry.json';

export type AgentRoleKey = keyof typeof registry;

export interface AgentConfig {
    role: string;
    treasury_address: string;
    token_address: string;
    token_symbol: string;
    token_name: string;
}

export const AGENT_REGISTRY = registry as Record<string, AgentConfig>;

export const AGENT_IDS = Object.keys(registry) as AgentRoleKey[];
