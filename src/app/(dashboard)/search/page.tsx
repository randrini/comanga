import { redirect } from "next/navigation";

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  // Redirect to series with search query until search page is implemented
  redirect("/series");
}