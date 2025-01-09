import { Character } from "../../character/model/Character";
import { ChatMessage } from "../../chat_message/model/ChatMessage";
import { AIOpenAiDao } from "../dao/AIOpenAiDao";

export class AIRepository {

	dao: AIOpenAiDao;

	constructor() {
		this.dao = new AIOpenAiDao();
	}


	sendMessageRecieveResponse(messages: ChatMessage[], senderCharacter: Character, respondAsCharacter: Character): Promise<string> {
		return this.dao.sendMessageRecieveResponse(messages, senderCharacter, respondAsCharacter);
	}

}
