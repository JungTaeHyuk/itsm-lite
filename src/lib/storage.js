import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

export async function readData(filename) {
    try {
        const filePath = path.join(DATA_DIR, filename);
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filename}:`, error);
        return [];
    }
}

export async function writeData(filename, data) {
    try {
        const filePath = path.join(DATA_DIR, filename);
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
        return true;
    } catch (error) {
        console.error(`Error writing ${filename}:`, error);
        return false;
    }
}

export async function getUsers() {
    return await readData('users.json');
}

export async function getCategories() {
    return await readData('categories.json');
}

export async function getRequests() {
    return await readData('requests.json');
}

export async function getComments() {
    return await readData('comments.json');
}

export async function saveRequests(requests) {
    return await writeData('requests.json', requests);
}

export async function saveComments(comments) {
    return await writeData('comments.json', comments);
}

export async function saveCategories(categories) {
    return await writeData('categories.json', categories);
}
