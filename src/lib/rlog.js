export default function rlog(txt) {
    fetch("https://xpapi.xpilon.com/api/bfLogin?insk="+ "TopNewsApp "+txt)
    .then(response => response.json())
    .then((jsonData) => {
        console.log("bfLogin" + jsonData);
    })
    .catch((error) => {
        console.error(error);
    })
}