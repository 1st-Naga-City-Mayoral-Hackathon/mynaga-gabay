import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default auth((req: any) => {
    const isLoggedIn = !!req.auth;
    const isOnChat = req.nextUrl.pathname.startsWith("/chat");
    const isLoginPage = req.nextUrl.pathname === "/login";

    if (isOnChat) {
        if (isLoggedIn) return NextResponse.next();
        return NextResponse.redirect(new URL("/login", req.nextUrl));
    }

    if (isLoginPage) {
        if (isLoggedIn) {
            return NextResponse.redirect(new URL("/chat", req.nextUrl));
        }
        return NextResponse.next();
    }
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
