const runTest = async () => {
    console.log("Fetching YouTube video and analyzing content...");
    
    try {
        const response = await fetch('http://localhost:3000/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                topic: "React UseState Hook", 
                youtubeUrl: "https://www.youtube.com/watch?v=O6P86uwfdR0"
            })
        });

        const data = await response.json();
        console.log("\n✅ AI Response Received!\n");
        console.log(JSON.stringify(data, null, 2));

    } catch (err) {
        console.error("Failed to connect. Is the server running on port 3000?", err);
    }
};

runTest();
