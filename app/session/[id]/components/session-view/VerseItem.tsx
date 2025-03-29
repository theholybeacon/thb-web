import { Box, Text } from "@mantine/core";

interface VerseItemProps {
	verseNumber: number;
	content: string;

}

export function VerseItem({ verseNumber, content }: VerseItemProps) {
	return (

		<Box key={verseNumber}>
			<Text size="md">
				<Text component="sup" size="xs" fw={900}>{verseNumber} </Text>
				{content}
			</Text>
		</Box>
	);
}
