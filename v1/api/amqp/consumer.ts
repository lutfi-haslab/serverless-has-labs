import * as amqp from 'amqplib';
import { lavinMQ } from '../config/amqp';

export const ConsumeMessageInfo = async () => {
	const connection = await amqp.connect(lavinMQ.url);
	const channel = await connection.createChannel();

	await channel.assertExchange("logExchange", "direct");

	const q = await channel.assertQueue("InfoQueue");

	await channel.bindQueue(q.queue, "logExchange", "Info");

	channel.consume(q.queue, (msg) => {
		const data = JSON.parse(msg.content);
		console.log(data);
		channel.ack(msg);
	});
}

export const ConsumeMessageWarningAndError = async () => {
	const connection = await amqp.connect(lavinMQ.url);
	const channel = await connection.createChannel();

	await channel.assertExchange("logExchange", "direct");

	const q = await channel.assertQueue("WarningAndErrorsQueue");

	await channel.bindQueue(q.queue, "logExchange", "Warning");
	await channel.bindQueue(q.queue, "logExchange", "Error");

	channel.consume(q.queue, (msg) => {
		const data = JSON.parse(msg.content);
		console.log(data);
		channel.ack(msg);
	});
}