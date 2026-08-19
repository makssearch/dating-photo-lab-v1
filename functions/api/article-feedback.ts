/// <reference types="@cloudflare/workers-types" />

interface Env {
    FEEDBACK_DB: D1Database;
}

interface FeedbackRequest {
    article?: unknown;
    vote?: unknown;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    try {
        const body = (await context.request.json()) as FeedbackRequest;

        if (typeof body.article !== "string" || !body.article.trim()) {
            return Response.json(
                { error: "Invalid article." },
                { status: 400 },
            );
        }

        if (body.vote !== "yes" && body.vote !== "no") {
            return Response.json(
                { error: "Invalid vote." },
                { status: 400 },
            );
        }

        await context.env.FEEDBACK_DB
            .prepare(
                "INSERT INTO article_feedback (article, vote) VALUES (?, ?)",
            )
            .bind(body.article.trim(), body.vote)
            .run();

        return Response.json({ success: true });
    } catch {
        return Response.json(
            { error: "Unable to save feedback." },
            { status: 500 },
        );
    }
};