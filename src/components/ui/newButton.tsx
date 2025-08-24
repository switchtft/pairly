"use client";

import React, { forwardRef } from "react";
import Link from "next/link";
import clsx from "clsx";

const FONT_CLASSES = {
  fugaz: "font-fugaz",
  "montserrat-medium": "font-montserrat-medium",
};

const VARIANTS = {
  primary:
    "inline-flex items-center justify-center gap-2 px-6 py-3 text-sm uppercase font-montserrat-medium rounded-full  " +
    "bg-primary text-white shadow-lg transition duration-200 ease-out " +
    "hover:shadow-[0_0_12px_2px_rgba(230,145,91,0.7)] hover:bg-primary-hover active:scale-95",

  secondary:
    "inline-flex items-center justify-center gap-2 px-6 py-3 text-sm uppercase font-montserrat-medium rounded-full " +
    "bg-card-background text-white border-2 border-primary transition duration-200 ease-out " +
    "hover:bg-primary hover:text-white active:scale-95",

  primary_2:
    "inline-flex items-center justify-center gap-2 px-6 py-3 text-sm uppercase font-montserrat-medium rounded-md  " +
    "bg-primary text-white shadow-lg transition duration-200 ease-out " +
    "hover:shadow-[0_0_12px_2px_rgba(230,145,91,0.7)] hover:bg-primary-hover active:scale-95",

  tertiary:
    "inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-montserrat-medium rounded-none " +
    "bg-gray-200 text-gray-800 shadow-sm transition duration-200 ease-out " +
    "hover:bg-gray-300 active:scale-95",

  success:
    "inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-montserrat-medium rounded-none " +
    "bg-green-600 text-white shadow-md transition duration-200 ease-out " +
    "hover:bg-green-700 active:scale-95",

  danger:
    "inline-flex items-center justify-center gap-2 px-6 py-3 text-sm uppercase font-montserrat-medium rounded-full  " +
    "bg-red-600 text-white shadow-lg transition duration-200 ease-out " +
    "hover:shadow-[0_0_12px_2px_rgba(220,38,38,0.7)] hover:bg-transparent active:scale-95",

  outline:
    "inline-flex items-center justify-center gap-2 px-6 py-3 text-sm uppercase font-montserrat-medium rounded-none " +
    "border-2 border-white/40 bg-transparent text-white transition duration-200 ease-out " +
    "hover:bg-white/10 active:scale-95",

  google:
    "inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-montserrat-medium rounded  " +
    "bg-red-600 text-white shadow-lg transition duration-200 ease-out " +
    "hover:shadow-[0_0_12px_2px_rgba(220,38,38,0.7)] hover:bg-transparent active:scale-95 font-montserrat-medium font-semibold",

  discord:
    "inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-montserrat-medium rounded  " +
    "bg-[#5865f2] text-white shadow-lg transition duration-200 ease-out " +
    "hover:shadow-[0_0_12px_2px_rgba(88,101,242,0.7)] hover:bg-transparent active:scale-95 font-montserrat-medium font-semibold",

  sidebar:
    "inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-none " +
    "bg-transparent text-[#d4d4d4] transition duration-150 ease-out " +
    "hover:bg-[#232746] hover:text-white active:bg-[#1a1c2c] focus:outline-none",

  flatglow:
    "inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-none " +
    "bg-gradient-to-r from-primary to-primary-hover text-white shadow transition duration-200 ease-out " +
    "hover:opacity-90 active:scale-95",

  pulseglowclean:
    "inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm uppercase tracking-wide font-semibold rounded-none " +
    "bg-primary text-white transition duration-200 ease-in-out active:scale-95",
};

const SIZES = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
  xl: "px-10 py-4 text-lg",
};

const RAW_VARIANTS = new Set(["pulseglowclean", "flatglow"]);

type NewButtonProps = {
  href?: string;
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  font?: keyof typeof FONT_CLASSES;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
} & React.ButtonHTMLAttributes<HTMLButtonElement> & React.AnchorHTMLAttributes<HTMLAnchorElement>;

const NewButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, NewButtonProps>(function NewButton(
  {
    href,
    variant = "primary",
    size = "md",
    font = "montserrat-medium",
    children,
    className = "",
    disabled = false,
    type,
    ...props
  },
  ref
) {
  const variantClasses = VARIANTS[variant] || VARIANTS.primary;
  const fontClass = FONT_CLASSES[font] || FONT_CLASSES["montserrat-medium"];
  const sizeClass = SIZES[size] || SIZES.md;

  const classes = RAW_VARIANTS.has(variant)
    ? variantClasses
    : clsx(variantClasses, fontClass, sizeClass, className);

  if (href) {
    return (
      <Link
        href={href}
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={classes}
        {...(disabled && { "aria-disabled": true, tabIndex: -1 })}
        {...props}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      className={classes}
      disabled={disabled}
      type={type || "button"}
      {...props}
    >
      {children}
    </button>
  );
});

NewButton.displayName = "NewButton";

export default NewButton;
