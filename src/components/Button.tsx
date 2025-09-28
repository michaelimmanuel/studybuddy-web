import React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "outline" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
	children: React.ReactNode;
	onClick?: (e?: any) => void;
	type?: "button" | "submit" | "reset";
	className?: string;
	disabled?: boolean;
	variant?: ButtonVariant;
	size?: ButtonSize;
	loading?: boolean;
};

const Button: React.FC<ButtonProps> = ({
	children,
	onClick,
	type = "button",
	className = "",
	disabled = false,
	variant = "default",
	size = "md",
	loading = false,
}) => {
	const baseStyles = "rounded font-medium transition-all duration-200 focus:outline-none focus:ring-2 inline-flex items-center justify-center";
	
	const variantStyles = {
		default: "bg-green-500 text-white hover:bg-green-600 focus:ring-green-300",
		outline: "border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-300",
		secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-300",
		ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-300"
	};

	const sizeStyles = {
		sm: "px-3 py-1.5 text-sm",
		md: "px-4 py-2 text-base", 
		lg: "px-6 py-3 text-lg"
	};

	return (
		<button
			type={type}
			onClick={onClick}
			className={cn(
				baseStyles,
				variantStyles[variant],
				sizeStyles[size],
				disabled && "opacity-50 cursor-not-allowed",
				loading && "cursor-wait",
				className
			)}
			disabled={disabled || loading}
		>
			{loading ? (
				<span className="flex items-center gap-2">
					<svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
						<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25"/>
						<path fill="currentColor" opacity="0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
					</svg>
					Loading...
				</span>
			) : children}
		</button>
	);
};

export default Button;
