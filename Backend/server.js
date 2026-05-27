const express =require("express");
const cors=require("cors");
const multer =require("multer");

const app=express();
const fs = require("fs");
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

    res.json({
        extractedText: pdfData.text,
        skills: extractedSkills,
        matchedSkills,
        missingSkills,
        atsScore,
        suggestions
    });

});
app.listen(5000, () => {
    console.log("server is running on port 5000");
});
