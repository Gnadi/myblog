import { db, Contact } from 'astro:db';

export default async function() {
    await db.insert(Contact).values([
        { id: 1, mail: "hello@world.com" },
        { id: 2, email: "hell@world.com" },
    ]);
}