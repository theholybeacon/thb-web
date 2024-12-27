"use client";
import { Card, Title, ScrollArea, Box, Flex, Group, Button, Loader, Center } from "@mantine/core";
import styles from "./current-chapter.module.css";
import React from "react";
import { VerseItem } from "./verse-item";
import { Verse } from "@/app/_common/verse/model/Verse";
import { ChapterVerNav } from "@/app/_common/chapter/model/Chapter";
import { useSetState } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { bookGetByIdSS } from "@/app/_common/book/service/server/getByIdSS";
import { chapterGetForMainSS } from "@/app/_common/chapter/service/ChapterForMainService";


export default function CurentChapter() {

	const [state, setState] = useSetState({
		bookId: "08c999d1-b50a-486e-95f4-0d16d26b66d5",
		chapterNumber: 30
	});

	const { data: chapter, isLoading: isChapterLoading } = useQuery({
		queryKey: ['chapter', state],
		queryFn: async () => {
			return await chapterGetForMainSS(state.bookId, state.chapterNumber);
		},
	});

	const { data: book, isLoading: isBookLoading } = useQuery({
		queryKey: ['book', state],
		queryFn: async () => {
			return await bookGetByIdSS(state.bookId);
		},
	});


	if (isChapterLoading && isBookLoading) {
		return <Center className={styles.main}><Loader></Loader></Center>
	}

	return (
		<Box className={styles.main}>
			<Card>
				<Title order={1}>{`${book?.name!}: ${chapter?.chapterNumber}`}</Title>
				<ScrollArea offsetScrollbars>
					<Flex direction="row" wrap="wrap" className={styles.content}>
						{chapter!.verses.map((v) => {
							return <VerseItem verseNumber={v.verseNumber} content={v.content} key={v.id} />
						})}
					</Flex>
				</ScrollArea>
				<Group justify="space-between">
					{
						chapter?.prev ?
							<Button onClick={
								(e) => {
									e.preventDefault();
									setState({
										bookId: chapter?.prev.bookId,
										chapterNumber: chapter?.prev.chapterNumber
									});
								}}
							>Previous</Button> : <></>
					}
					{
						chapter?.next ?
							<Button onClick={
								(e) => {
									e.preventDefault();
									setState({
										bookId: chapter?.next.bookId,
										chapterNumber: chapter?.next.chapterNumber
									})
								}}
							>Next</Button> : <></>
					}
				</Group>

			</Card>
		</Box>
	);
}
