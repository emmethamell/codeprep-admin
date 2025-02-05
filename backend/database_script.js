import pgPromise from 'pg-promise';
import dotenv from 'dotenv';
import { readFile } from 'fs/promises';

dotenv.config();

const pgp = pgPromise();
const db = pgp(process.env.DATABASE_URL_LOCAL);

async function insert_question(id, content, difficulty, name, topics) {
    try {
        // Start a transaction
        const result = await db.tx(async t => {
            const question = await t.one(
                `INSERT INTO questions (id, content, difficulty, name) 
                 VALUES ($1, $2, $3, $4) RETURNING id`,
                [id, content, difficulty.toUpperCase(), name]
            );

            const questionId = question.id;
            for (const topicName of topics) {
                const tag = await t.oneOrNone(
                    `INSERT INTO tags (name) 
                     VALUES ($1) 
                     ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name 
                     RETURNING id`,
                    [topicName]
                );

                // If tag was just inserted, use its id, otherwise get existing id
                const tagId = tag 
                    ? tag.id 
                    : (await t.one('SELECT id FROM tags WHERE name = $1', [topicName])).id;

                // Insert into question_tag table
                await t.none(
                    `INSERT INTO question_tag (question_id, tag_id) VALUES ($1, $2)`,
                    [questionId, tagId]
                );
            }

            return question;
        });

        console.log('Inserted question with topics:', result);
    } catch (error) {
        console.error('Error inserting question with topics:', error);
    }
}

async function main(file_name) {
    try {
        const rawData = await readFile(file_name, 'utf8');
        const data = JSON.parse(rawData);

        for (let i = 0; i < data.length; i++) {
            await insert_question(data[i].id, data[i].content, data[i].difficulty, data[i].name, data[i].topics);
            console.log("Processed question", i);
        }
    } catch (error) {
        console.error('Error processing file:', error);
    }
}

main('qs_401_to_500.json').catch(console.error);
