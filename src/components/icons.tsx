import type { SVGProps } from "react";
export function Icon({
  name,
  ...props
}: SVGProps<SVGSVGElement> & {
  name: "bag" | "close" | "menu" | "arrow" | "leaf" | "hand" | "globe";
}) {
  const paths = {
    bag: (
      <>
        <path d="M5 7h14l1 14H4L5 7Z" />
        <path d="M8 8V6a4 4 0 0 1 8 0v2" />
      </>
    ),
    close: <path d="m6 6 12 12M18 6 6 18" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    leaf: (
      <>
        <path d="M20 4C6 2 2 10 7 17S22 16 20 4Z" />
        <path d="m5 21 11-11" />
      </>
    ),
    hand: (
      <>
        <path d="M4 14h4l3 3h5c3 0 4-3 5-5M8 14l4-2 4 1c2 1 1 3-1 3M4 12v9M12 9c-4-2-3-6 0-4 3-2 4 2 0 4Z" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <ellipse cx="12" cy="12" rx="4" ry="9" />
        <path d="M3 12h18" />
      </>
    ),
  };
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
