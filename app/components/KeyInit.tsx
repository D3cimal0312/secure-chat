"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { initUserKeys } from "@/lib/crypto/initKeys";

export default function KeyInit() {
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status !== "authenticated" || !session.user.id) return;
        initUserKeys(session.user.id).catch(console.error);
    }, [status, session?.user.id]);

    return null;
}