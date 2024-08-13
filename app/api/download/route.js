// app/api/download/route.js
import puppeteer from 'puppeteer';
import path from 'path';
import { exec } from 'child_process';
const shortid = require('shortid');


function execCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve(stdout ? stdout : stderr);
            }
        });
    });
}

export async function GET(request) {
    // Extract and decode the URL from query parameters
    const url = new URL(request.url).searchParams.get('url');

    if (!url) {
        return new Response(JSON.stringify({ error: 'Pinterest URL is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Decode the URL
    const decodedUrl = decodeURIComponent(url);

    try {
        // Launch Puppeteer
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.goto(decodedUrl);

        // Wait for the video element to be available in the DOM
        await page.waitForSelector('video');

        // Extract the video URL from the video element
        const videoUrl = await page.evaluate(() => {
            const video = document.querySelector('video');
            return video ? video.src : null;
        });

        if (!videoUrl || !videoUrl.endsWith('.m3u8')) {
            throw new Error('Failed to extract valid HLS video URL');
        }

        // Log the video URL for debugging
        console.log('HLS Video URL:', videoUrl);

        // // Define the file path for the output video
        const filePath = path.join('public/videos', `${shortid.generate()}.mp4`);

        // Use ffmpeg to download and convert the HLS stream to an MP4 file
        const ffmpegCommand = `ffmpeg -i "${videoUrl}" -c copy "${filePath}"`;
        console.log("Downloading started...");

        // Execute ffmpeg command
        await new Promise((resolve, reject) => {
            exec(ffmpegCommand, (error) => {
                if (error) {
                    console.error(`Error downloading video: ${error.message}`);
                    return reject(error);
                }

                console.log('Video downloaded successfully');
                resolve();
            });
        });

        // Check if the file exists
        const fileExists = await fsPromises.access(filePath).then(() => true).catch(() => false);
        if (!fileExists) {
            console.error('File does not exist after download.');
            return res.status(500).json({ error: 'File not found after download' });
        }
        console.log('File verified to exist.');

        // Close the browser
        await browser.close();

        return new Response(filePath.replace('public', ''));

    } catch (error) {
        console.error('Error downloading video:', error);
        return new Response(JSON.stringify({ error: 'Failed to download the content' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
