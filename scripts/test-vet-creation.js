const testPost = async () => {
    const res = await fetch("http://localhost:3000/api/veterinarias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: "Test Vet Comm",
            fixedFee: 750,
            contactName: "Dr. Test"
        })
    });
    const data = await res.json();
    console.log("Creation Response:", data);
};
testPost();
