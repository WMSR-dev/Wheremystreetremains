import {loadData} from './data.js';
import {showScene} from './scenes.js';
import {t} from './i18n.js'; 

const data = await loadData();
console.log('data loaded', data);

window.data = data; //to view data in the console

showScene('film');

document.getElementById('begin').addEventListener('click',()=>{
    showScene('desktop'); 
})