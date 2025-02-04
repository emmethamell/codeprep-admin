import OpenAI from "openai"
import dotenv from "dotenv"
dotenv.config()

const openai = new OpenAI({
    apiKey: process.env.OPEN_AI_API_KEY,
    organization: process.env.OPEN_AI_ORGANIZATION,
    project: process.env.OPEN_AI_PROJECT,
});


async function formatContent(question_content) {
    const message = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: "You are a pro in react markdown library. Your role is simple, you get the question given by the user, and you output the question with correct formatting. There is a high chance nothing is to be changed at all, this is fine, in this case just output the original text \
            Here is an example. User input: A string can be abbreviated by replacing any number of non-adjacent, non-empty substrings with their lengths. The lengths should not have leading zeros.\n\nGiven a string word and an abbreviation abbr, return whether the string matches the given abbreviation. \
            You output: A string can be abbreviated by replacing any number of non-adjacent, non-empty substrings with their lengths. The lengths should not have leading zeros.\n\nGiven a string `word` and an abbreviation `abbr`, return whether the string matches the given abbreviation. \
            (end), in this example, all that was needed was to add inline code characters `` around word and abbr" 
        },
            { role: "user", content: question_content }
        ],
    })
    
    return message.choices[0].message.content
}


async function main() {
    const fs = require('fs').promises;

    const rawData = await fs.readFile('qs_1_to_200.json', 'utf8');
    const data = JSON.parse(rawData);

    for (let i = 0; i < data.length; i++) {
        data[i].content = await formatContent(data[i].content); 
    }

    fs.writeFileSync('qs_1_to_200.json', JSON.stringify(data, null, 2), 'utf8');
}
