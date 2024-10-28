"use client";
import React from 'react';
import styles from './Button.module.css';

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

const AppButton: React.FC<AppButtonProps> = ({ children, onClick, className, type, disabled }) => {
	return (
		<button
			className={`${styles.AppButton} ${className || ""} ${styles[type]} ${disabled ? styles.disabled : ""}`}
			disabled={disabled}
			onClick={onClick}
		>
			{children}
		</button >
	);
};

export default AppButton;

