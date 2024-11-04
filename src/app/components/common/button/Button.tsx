"use client";
import React from 'react';
import { Button } from '@mantine/core';

export enum AppButtonType {
	primary = "primary",
	secondary = "secondary",
	accent = "accent",
	success = "success",
	error = "error",
	warning = "warning",
	info = "info",
	neutral = "neutral"
}

interface AppButtonProps {
	onClick?: () => void;
	className?: string;
	children: React.ReactNode;
	type: AppButtonType
	disabled?: boolean | undefined;
}

const AppButton: React.FC<AppButtonProps> = ({ children, onClick, disabled }) => {
	return (
		<Button
			color='yellow'
			disabled={disabled}
			onClick={onClick}
		>
			{children}
		</Button >
	);
};

export default AppButton;

