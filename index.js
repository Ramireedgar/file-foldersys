#!/usr/bin/env node

const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const questions = [
    {
        type: 'input',
        name: 'projectName',
        message: 'What is your project name?',
        validate: input => input ? true : 'Project name cannot be empty',
    },
    {
        type: 'list',
        name: 'projectType',
        message: 'What type of project is this?',
        choices: ['frontend', 'backend', 'fullstack'],
    },
    {
        type: 'list',
        name: 'mainTechnology',
        message: 'What is the main technology?',
        choices: ['React', 'Vue', 'Express', 'Koa'],
    },
    {
        type: 'confirm',
        name: 'confirm',
        message: 'Are you sure you want to create the project with the above details?',
    },
];

async function getCustomStructure(projectName, projectType, mainTechnology) {
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    const prompt = `Design a file structure for a ${projectType} project using ${mainTechnology}. Provide a JSON array of directory paths.`;

    const response = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: prompt,
        max_tokens: 150,
    });

    let structure;
    try {
        structure = JSON.parse(response.data.choices[0].text.trim());
    } catch (error) {
        console.error('Failed to parse API response:', error);
        return [];
    }

    return structure;
}

async function createDirectories(projectName, structure) {
    structure.forEach(dir => {
        const fullPath = path.join(process.cwd(), projectName, dir);
        fs.mkdirpSync(fullPath);
        console.log(`Created directory: ${fullPath}`);
    });
}

async function createProjectStructure() {
    try {
        const answers = await inquirer.prompt(questions);
        const { projectName, projectType, mainTechnology, confirm } = answers;

        if (!confirm) {
            console.log('Project creation aborted.');
            return;
        }

        const structure = await getCustomStructure(projectName, projectType, mainTechnology);
        createDirectories(projectName, structure);

        console.log('Project structure created successfully!');
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

createProjectStructure();
