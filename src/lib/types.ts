import { Client as DiscordClient } from 'discord.js';
import { ProviderStore } from './structures/ProviderStore';
import { SerializerStore } from './structures/SerializerStore';
import { GatewayDriver } from './gateway/GatewayDriver';

export type DeepReadonly<T extends object> = {
	readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
}

export type KeyedObject = Record<PropertyKey, unknown>;
export type ReadonlyKeyedObject = DeepReadonly<KeyedObject>;

/**
 * Dummy Client made to ignore the origin's properties, so SG may compile correctly.
 * @internal
 */
export interface Client extends Omit<DiscordClient, 'gateways' | 'providers' | 'serializers'> {
	gateways: GatewayDriver;
	providers: ProviderStore;
	serializers: SerializerStore;
}
