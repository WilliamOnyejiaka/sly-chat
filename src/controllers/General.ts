import Controller from "./bases/Controller";
import { Request, Response } from "express";
import { loadMD } from "../utils";

export default class General {

    public static async docs(req: Request, res: Response) {
        try {
            const query = req.query.doc as string;
            const files: Record<string, string> = {
                'chat': "TransactionChat.md",
                'presence': "Presence.md",
                'general': "General.md",
                'sendFile': "SendFile.md",
                'chatRoutes': "ChatRoutes.md",
                'commentRoutes': "CommentRoutes.md"
            };

            if (!(files as any)[query]) {
                res.render('docs', { title: "General Doc", content: await loadMD(files.general) });
                return;
            }

            const doc = files[query];
            const htmlContent = await loadMD(doc);
            const title: string = doc.split('.')[0];
            res.render('docs', { title: title, content: htmlContent });
        } catch (error) {
            console.error('Error processing markdown:', error);
            res.status(500).render('docs', {
                content: '<h1>Error</h1><p>Failed to load markdown content</p>'
            });
        }
    }

}