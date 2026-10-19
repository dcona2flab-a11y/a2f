import type { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
  size?: "md" | "sm";
};

// Shared A2F button. Primary follows the Figma selected-state treatment (green, white text).
export default function Button({ variant = "primary", size = "md", className, type = "button", ...rest }: ButtonProps) {
  const classes = [styles.button, styles[variant], styles[size], className].filter(Boolean).join(" ");
  return <button type={type} className={classes} {...rest} />;
}
