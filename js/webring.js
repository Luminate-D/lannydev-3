document.addEventListener('DOMContentLoaded', async () => {
    const back = document.getElementById('webring-back');
    const forward = document.getElementById('webring-forward');

    const previous = await fetch('https://webring.c6oi.ru/previous?host=lanny.dev&redirect=false')
    const next = await fetch('https://webring.c6oi.ru/next?host=lanny.dev&redirect=false');

    back.innerText = (await previous.json()).host;
    forward.innerText = (await next.json()).host;
});