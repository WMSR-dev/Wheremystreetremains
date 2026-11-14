export function showScene(name){
    document.querySelectorAll('.scene').forEach(el => {
        el.classList.toggle('active', el.id === `scene-${name}`); 
    });
}