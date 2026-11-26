"use client";

/** A submit button that asks for confirmation before its form's action runs. */
export function ConfirmSubmit({
  message,
  className,
  children,
  ...rest
}: { message: string; className: string; children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
