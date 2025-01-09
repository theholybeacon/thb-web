"use server";

import { characterGetAllCharactersByChatIdSS } from "@/app/common/character/service/server/characterGetAllCharactersByChatIdSS";
import { AIRepository } from "../../repository/AIRepository";
import { Character } from "@/app/common/character/model/Character";
import { ChatMessageInsert, ChatMessageWithSender } from "@/app/common/chat_message/model/ChatMessage";
import { chatMessageCreateSS } from "@/app/common/chat_message/service/server/chatMessageCreateSS";
import { randomUUID } from "@/app/util/Uuid";
import { chatMessageGetAllByChatIdSS } from "@/app/common/chat_message/service/server/chatMessageGetAllByChatIdSS";

export async function aISendMessageRecieveResponseSS(sentMessage: ChatMessageWithSender): Promise<void> {


	const aiRepository: AIRepository = new AIRepository();


	const chatHistory = await chatMessageGetAllByChatIdSS(sentMessage.chatId);

	var senderCharacter: Character;
	var respondAsCharacters: Character[] = [];


	const chat = await characterGetAllCharactersByChatIdSS(sentMessage.chatId);

	chat.members.map((actual) => {
		if (actual.character.id === sentMessage.senderCharacterId) {
			senderCharacter = actual.character;
		} else {
			if (!actual.character.isPersona) {
				respondAsCharacters.push(actual.character);
			}
		}
	});

	for (const respondAsCharacter of respondAsCharacters) {
		const recievedMessageContent = await aiRepository.sendMessageRecieveResponse(chatHistory, senderCharacter!, respondAsCharacter);

		const recievedMessage: ChatMessageInsert = {
			eid: randomUUID(),
			chatId: sentMessage.chatId,
			content: recievedMessageContent,
			senderCharacterId: respondAsCharacter!.id!,
		};

		const output = await chatMessageCreateSS(recievedMessage);
		chatHistory.push(output);
	}
}
