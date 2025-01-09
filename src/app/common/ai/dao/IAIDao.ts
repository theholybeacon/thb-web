import { Character } from "../../character/model/Character";
import { ChatMessage } from "../../chat_message/model/ChatMessage";
import { ContextMessage } from "../model/ContextMessage";

export interface IAIDao {
	sendMessageRecieveResponse(messages: ChatMessage[], senderCharacter: Character, respondAsCharacter: Character): Promise<string>;
	complete(context: ContextMessage[]): Promise<string>;
}
