import YTDlpWrap from 'yt-dlp-wrap';

async function test() {
    try {
        console.log("Downloading yt-dlp binary...");
        await YTDlpWrap.downloadFromGithub('./yt-dlp_binary');
        console.log("Downloaded!");
        const ytDlpWrap = new YTDlpWrap('./yt-dlp_binary');
        
        console.log("Running...");
        await ytDlpWrap.execPromise([
            'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            '-f', 'bestaudio[ext=m4a]',
            '--no-playlist',
            '-o', 'test_audio_render.m4a'
        ]);
        console.log("Finished!");
    } catch (e) {
        console.error(e);
    }
}
test();
