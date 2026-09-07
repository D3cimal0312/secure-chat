import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function ChatLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="flex h-screen w-full overflow-hidden">
            <aside className="w-72 shrink-0 border-r bg-zinc-50  flex flex-col">
                <div className="p-4 font-semibold">
                    {session.user.name}
                </div>
                <nav className="flex-1 overflow-y-auto p-2">
                    Sidebar
                </nav>
            </aside>
            <main className="flex-1 min-w-0 flex flex-col">
                {children}
            </main>
        </div>
    );
}