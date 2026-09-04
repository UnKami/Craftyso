import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/lib/types";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className="atelier-card group relative flex aspect-[4/3] items-end overflow-hidden rounded-xl"
    >
      {category.imageUrl ? (
        <Image
          src={category.imageUrl}
          alt={category.name}
          fill
          sizes="(min-width: 1024px) 25vw, 50vw"
          className="object-cover transition duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0e0906] via-[#0e0906]/40 to-transparent" />
      <div className="relative z-10 p-4 w-full">
        <span className="block font-serif-hebrew text-base font-semibold text-[#f3ede2] group-hover:text-[#faebd7] transition drop-shadow-sm">
          {category.name}
        </span>
      </div>
    </Link>
  );
}
