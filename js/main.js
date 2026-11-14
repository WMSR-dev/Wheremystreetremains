import {loadData} from './data.js';
import { startFilm, choices} from './film.js';
import {t} from './i18n.js'; 

const data = await loadData();
console.log('data loaded', data);

window.data = data; //to view data in the console
window.choices= choices; 

function showScene(name){
    document.querySelectorAll('.scene').forEach(el => {
        el.classList.toggle('active', el.id === `scene-${name}`); 
    });
}

function goToDesktop(){
    showScene('desktop'); 
}

showScene('film');
startFilm(goToDesktop); 

// document.getElementById('begin').addEventListener('click',()=>{
//     showScene('desktop'); 
// })