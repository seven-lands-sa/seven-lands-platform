import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/** Locale-aware navigation primitives. Always import Link from here, not from next/link. */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
