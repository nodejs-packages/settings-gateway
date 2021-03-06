import unknownTest, { TestInterface } from 'ava';
import { createClient } from './lib/MockClient';
import { GatewayStorage, Schema, Client, Provider } from '../dist';

const ava = unknownTest as TestInterface<{
	client: Client,
	schema: Schema
}>;

ava.beforeEach(async (test): Promise<void> => {
	test.context = {
		client: createClient(),
		schema: new Schema()
	};
});

ava('GatewayStorage Properties', (test): void => {
	test.plan(9);

	const gateway = new GatewayStorage(test.context.client, 'MockGateway', { provider: 'Mock' });
	test.is(gateway.client, test.context.client);
	test.is(gateway.name, 'MockGateway');
	test.is(gateway.provider, test.context.client.providers.get('Mock'));
	test.is(gateway.ready, false);

	test.true(gateway.schema instanceof Schema);
	test.is(gateway.schema.size, 0);
	test.is(gateway.schema.path, '');
	test.is(gateway.schema.type, 'Folder');
	test.deepEqual(gateway.toJSON(), {
		name: 'MockGateway',
		provider: 'Mock',
		schema: {}
	});
});

ava('GatewayStorage#schema', (test): void => {
	const gateway = new GatewayStorage(test.context.client, 'MockGateway', { schema: test.context.schema });
	test.is(gateway.schema, test.context.schema);
});

ava('GatewayStorage#init', async (test): Promise<void> => {
	test.plan(7);

	const gateway = new GatewayStorage(test.context.client, 'MockGateway', { schema: test.context.schema, provider: 'Mock' });
	const provider = gateway.provider as Provider;

	// Uninitialized gateway
	test.false(gateway.ready);
	test.false(gateway.schema.ready);
	test.false(await provider.hasTable(gateway.name));

	// Initialize gateway
	test.is(await gateway.init(), undefined);

	// Initialized gateway
	test.true(gateway.ready);
	test.true(gateway.schema.ready);
	test.true(await provider.hasTable(gateway.name));
});

ava('GatewayStorage#init (No Provider)', async (test): Promise<void> => {
	test.plan(2);

	const gateway = new GatewayStorage(test.context.client, 'MockGateway', { schema: test.context.schema, provider: 'Mock' });
	test.context.client.providers.clear();

	test.is(gateway.provider, null);
	await test.throwsAsync(() => gateway.init(), { message: 'The gateway "MockGateway" could not find the provider "Mock".' });
});

ava('GatewayStorage#init (Ready)', async (test): Promise<void> => {
	const gateway = new GatewayStorage(test.context.client, 'MockGateway', { schema: test.context.schema, provider: 'Mock' });
	await gateway.init();
	await test.throwsAsync(() => gateway.init(), { message: 'The gateway "MockGateway" has already been initialized.' });
});

ava('GatewayStorage#init (Broken Schema)', async (test): Promise<void> => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
	// @ts-ignore
	test.context.schema.add('key', 'String', { array: null });

	const gateway = new GatewayStorage(test.context.client, 'MockGateway', { schema: test.context.schema, provider: 'Mock' });

	await test.throwsAsync(() => gateway.init(), { message: [
		'[SCHEMA] There is an error with your schema.',
		"[KEY] key - Parameter 'array' must be a boolean."
	].join('\n') });
});

ava('GatewayStorage#sync', async (test): Promise<void> => {
	const gateway = new GatewayStorage(test.context.client, 'MockGateway', { schema: test.context.schema, provider: 'Mock' });
	test.is(await gateway.sync(), gateway);
});

// TODO(kyranet): Test SQL mode as well
