
function onNewEmotionData(data) {}

function getEmotions() {
    fetch('http://127.0.0.1:5000/get-emotions')
        .then(response => {
            response.json()
                .then(data => {
                    onNewEmotionData(data)
                })
                .catch(console.error);
        })
}
function startGetEmotions() {
    setInterval(getEmotions, 250);
}

let age, gender
async function getAgeAndGender() {
    while (!age && !gender) {
        res = await fetch('http://127.0.0.1:5000/start')
        res = await res.json()
        if (res.age &&res.gender){
            age = res.age
            gender = res.dominant_gender
        } else {
            await new Promise(resolve => setTimeout(resolve, 500))
        }
    }
}