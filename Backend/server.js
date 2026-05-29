const express =require("express");
const cors=require("cors");
const multer =require("multer");

const app=express();
const fs = require("fs");

require("dotenv").config();
console.log("KEY =", process.env.OPENROUTER_API_KEY);


const OpenAI = require("openai");

const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
});

const pdfParse = require("pdf-parse");
app.use(cors());
const skillsList=[
    "JavaScript","Python", "Java",  "C++","React",   "Node.js","css", "machine learning", "data analysis", "sql","C","ruby","postgreSQL",
    "mongodb",   "aws",  "devops", "docker","kubernetes", "git",  "html","angular", "vue.js","typescript", "swift",  "kotlin","flutter","django",
    "spring", "laravel", "ruby on rails","tensorflow", "pytorch", "natural language processing","computer vision", "deep learning","data science",
    "big data", "hadoop", "spark","scala", "go", "rust", "php", "asp.net", "graphql", "restful api", "microservices", "agile methodologies", "scrum", "kanban", "test-driven development","continuous integration", "continuous deployment",
]


const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,"uploads/");
    },
    filename:function(req,file,cb){
        cb(null,file.originalname);
    }

});

const upload = multer({storage:storage});
app.post("/upload", upload.single("resume"), async (req, res) => {

    const dataBuffer = fs.readFileSync(req.file.path);

    const pdfData = await pdfParse(dataBuffer);

    const extractedSkills = [];
    const requiredSkills = [];

    const lowerText = pdfData.text.toLowerCase();

    const jobDescription = req.body.jobDescription.toLowerCase();

    // Extract skills from resume
    skillsList.forEach((skill) => {

        const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        const regex = new RegExp(escapedSkill, "i");

        if(regex.test(lowerText)){

            if(!extractedSkills.includes(skill)){
                extractedSkills.push(skill);
            }
        }
    });

    // Extract skills from job description
    skillsList.forEach((skill) => {

        const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        const regex = new RegExp(escapedSkill, "i");

        if(regex.test(jobDescription)){

            if(!requiredSkills.includes(skill)){
                requiredSkills.push(skill);
            }
        }
    });

    // Match skills
    const matchedSkills = extractedSkills.filter(skill =>
        requiredSkills.includes(skill)
    );

    // Missing skills
    const missingSkills = requiredSkills.filter(skill =>
        !extractedSkills.includes(skill)
    );

    // ATS Score
    const atsScore = requiredSkills.length > 0
        ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
        : 0;

    // Suggestions
    const suggestions = [];

    if(missingSkills.length > 0){
        suggestions.push(
            `Add these skills: ${missingSkills.join(", ")}`
        );
    }

    if(atsScore < 60){
        suggestions.push(
            "Your ATS Score is low. Improve resume keywords."
        );
    }

    if(atsScore >= 80){
        suggestions.push(
            "Excellent match for this job role."
        );
    }

    const prompt = ` You are an ATS Resume Analyzer. Analyze the following resume and job description, then provide a summary, improvement suggestions, and interview questions professionally.
    Resume: ${pdfData.text}
    Job Description: ${jobDescription}
    Give response in this format:
    1. Write a short professional summary of the candidate based on the resume and job description.
    2. Explain how well the resume matches the job.
    3. Mention important missing skills.
    4. Weaknesses & Strengths in resume.
    5. Give 5 bullet improvement suggestions.
    6. Best Projects Mentioned in Resume.
    6. Give 3 technical interview questions.
    7. Final Hiring Recommendation.
    Keep response clean, modern, and properly formatted.
`;

    let aiResponse = "";

try {

    const completion = await client.chat.completions.create({

        model: "meta-llama/llama-3-8b-instruct",

        messages: [
            {
                role: "user",
                content: prompt
            }
        ]
    });

    aiResponse = completion.choices[0].message.content;

    console.log(aiResponse);

} catch(error) {

    console.error(error);

    aiResponse = "Error generating AI response.";
}

    res.json({
        extractedText: pdfData.text,
        skills: extractedSkills,
        matchedSkills,
        missingSkills,
        atsScore,
        suggestions,
        aiResponse
    });

});


async function testAI() {

    try {

        const completion = await client.chat.completions.create({

           model: "meta-llama/llama-3-8b-instruct",

            messages: [
                {
                    role: "user",
                    content: "Hello"
                }
            ]

        });

        console.log(completion.choices[0].message.content);

    } catch (error) {

        console.log(error);

    }
}

testAI();

app.listen(5000, () => {
    console.log("server is running on port 5000");
});
