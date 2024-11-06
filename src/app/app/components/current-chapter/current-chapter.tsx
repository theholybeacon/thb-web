"use client";

import { Card, Title, ScrollArea, Box, Flex } from "@mantine/core";
import { useState } from "react";
import styles from "./current-chapter.module.css";
import React from "react";
import { VerseItem } from "./verse-item";


export default function CurentChapter() {

	const [verses] = useState<string[]>([]);



	return (
		<Box className={styles.main}>
			<Card>
				<Title order={1}>Genesis 1</Title>
				<ScrollArea offsetScrollbars>
					<Flex direction="row" wrap="wrap" className={styles.content}>
						{verses.map((verse, index) => (
							<VerseItem verseNumber={index + 1} content={verse} key={index + 1} />
						))}
					</Flex>
				</ScrollArea>
			</Card>
		</Box>
	);
}
