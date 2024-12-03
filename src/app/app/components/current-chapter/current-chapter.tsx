import { Card, Title, ScrollArea, Box, Flex } from "@mantine/core";
import styles from "./current-chapter.module.css";
import React from "react";
import { VerseItem } from "./verse-item";
import { ChapterGetForMainService } from "@/app/_common/chapter/service/ChapterForMainService";
import { Verse } from "@/app/_common/verse/model/Verse";
import { ChapterVerNav } from "@/app/_common/chapter/model/Chapter";


export default async function CurentChapter() {

	const currentChapter: ChapterVerNav = await fetchChapter;

	async function fetchChapter(): Promise<ChapterVerNav> {
		"use server";

		const chaptersGetFormMainService = new ChapterGetForMainService();
		return await chaptersGetFormMainService.execute("");
	}



	return (
		<Box className={styles.main}>
			<Card>
				<Title order={1}>Genesis 1</Title>
				<ScrollArea offsetScrollbars>
					<Flex direction="row" wrap="wrap" className={styles.content}>
						{currentChapter.verses.map((verse: Verse, index: number) => (
							<VerseItem verseNumber={index + 1} content={verse.content} key={index + 1} />
						))}
					</Flex>
				</ScrollArea>
			</Card>
		</Box>
	);
}
