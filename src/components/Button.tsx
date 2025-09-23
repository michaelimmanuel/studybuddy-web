import React from "react";

type ButtonProps = {
	children: React.ReactNode;
	onClick?: () => void;
	type?: "button" | "submit" | "reset";
	className?: string;
	disabled?: boolean;
};

const Button: React.FC<ButtonProps> = ({
	children,
	onClick,
	type = "button",
	className = "",
	disabled = false,
}) => {
	return (
		<button
			type={type}
			onClick={onClick}
			className={`px-4 py-2 rounded bg-green text-white hover:bg-green-600 transition ${className}`}
			disabled={disabled}
		>
			{children}
		</button>
	);
};

export default Button;
