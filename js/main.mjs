import {loadData} from './data.js';
import { startFilm, choices} from './film.js';
import { initMessenger } from './desktop.js';
import { initDesktopIcons } from './desktop-icons.js';
import { initGallery } from './gallery.js';
import {t} from './i18n.js'; 

// const data = await loadData();
// console.log('data loaded', data);

function showScene(name){
    document.querySelectorAll('.scene').forEach(el => {
        el.classList.toggle('active', el.id === `scene-${name}`); 
    });
}

let desktopInitialized = false;

// let messengerInitialized = false;

async function goToDesktop() {

    showScene('desktop');

    if (!desktopInitialized) {

        await initMessenger();

        await initGallery();

        initDesktopIcons();

        desktopInitialized = true;

    }

}


// function goToDesktop(){
//     showScene('desktop'); 
// }

showScene('film');
startFilm(goToDesktop); 

// document.getElementById('begin').addEventListener('click',()=>{
//     showScene('desktop'); 
// })