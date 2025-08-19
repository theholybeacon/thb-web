
interface VerseItemProps {
	verseNumber: number;
	content: string;

}

export function VerseItem({ verseNumber, content }: VerseItemProps) {
	return (

		<div key={verseNumber}>
			<div>{verseNumber} </div>
			{content}
		</div>
	);
}
