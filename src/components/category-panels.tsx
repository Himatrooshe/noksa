"use client";
import { useState } from "react";
import Link from "next/link";
import { Icon } from "./icons";
import { imageUrl } from "@/lib/image-url";

export type CategoryItem = { key: string; label: string; note: string; href: string; image: string | null };

/**
 * Four tall photo panels. One is open at a time (the first by default); hovering
 * or focusing another opens it while the rest narrow to slim, vertically labelled
 * strips. Small screens stack the panels as photo cards, all open.
 */
export function CategoryPanels({ categories }: { categories: CategoryItem[] }) {
  const [active, setActive] = useState(0);
  return (
    <div className="cat-panels">
      {categories.map((category, index) => (
        <Link
          key={category.key}
          href={category.href}
          className={index === active ? "cat-panel is-open" : "cat-panel"}
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse") setActive(index);
          }}
          onFocus={() => setActive(index)}
        >
          {category.image && (
            <img
              className="cat-panel-img"
              src={imageUrl(category.image, 1080)}
              srcSet={[540, 720, 1080, 1440].map((w) => `${imageUrl(category.image!, w)} ${w}w`).join(", ")}
              sizes="(max-width: 900px) 100vw, 55vw"
              alt=""
              loading="lazy"
            />
          )}
          <span className="cat-panel-shade" aria-hidden="true" />
          <span className="cat-panel-index" aria-hidden="true">
            0{index + 1}
          </span>
          <span className="cat-panel-spine" aria-hidden="true">
            {category.label}
          </span>
          <span className="cat-panel-body">
            <span className="cat-panel-name">{category.label}</span>
            <span className="cat-panel-note">{category.note}</span>
            <span className="cat-panel-cta">
              Shop now <Icon name="arrow" />
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}
