import { Character } from "../../character/model/Character";
import { ChatMessage } from "../../chat_message/model/ChatMessage";
import { ContextMessage } from "../model/ContextMessage";
import { IAIDao } from "./IAIDao";
import OpenAI from 'openai';

export class AIOpenAiDao implements IAIDao {



	client = new OpenAI();

	async sendMessageRecieveResponse(messages: ChatMessage[], senderCharacter: Character, respondAsCharacter: Character): Promise<string> {


		var messagesToSend: any[] = [];

		messagesToSend.push({
			role: "system", content: `
			Act as a character I will provide and respond just as the character would take that conversation.
			Keep answers short unless it is absolutely required.
			Only ask follow up questions if you think is relevans.
			The user wants you to write responses in the style of a character named: ${respondAsCharacter.name}.
			With the following instructions: ${respondAsCharacter.promptInstructions}.
			The user name is: ${senderCharacter.name}.
			Some context about the user is: ${senderCharacter.promptInstructions}.
			Here is the conversation so far:
			` });

		messages.map((actual) => {
			const role = actual.senderCharacterId === senderCharacter.id ? "user" : "assistant";
			messagesToSend.push({ role: role, content: actual.content });
		});


		const chatCompletion = await this.client.chat.completions.create({
			messages: messagesToSend,
			model: 'gpt-4o-mini',
		});




		return chatCompletion.choices[0].message.content!;
	}

	async complete(context: ContextMessage[]): Promise<string> {
		const completion = await this.client.chat.completions.create({
			messages: context,
			model: 'gpt-4o',
		});
		return completion.choices[0].message.content!;
	}
}
