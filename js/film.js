
const scene = document.getElementById('scene-film');
const frames = Array.from(scene.querySelectorAll('.frame'));

//nav stuff
const dotsContainer = document.getElementById('film-dots');
const backButton = scene.querySelector('.film-nav [data-back]');
const nextButton = scene.querySelector('.film-nav [data-next]');



let current = 0;
//furthest frame reached;
let furthest = 0; 
let whenDone = null; 
export const choices = {}; //to save places or ppl


export function startFilm(onFinish){
    whenDone = onFinish;

    buildDots(); 

    scene.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKey);

    showFrame(0);
}

function buildDots(){
    for(let i=0; i<frames.length; i++){
        const dot=document.createElement('button');
        dot.className = 'dot';
        dot.dataset.dot = i;                       
        dotsContainer.appendChild(dot);
    }
}

function updateNav(){
    const dots = dotsContainer.querySelectorAll('.dot');
    
    for (let i=0; i<dots.length; i++){
        if (i===current){
            dots[i].classList.add('current');
        } else {
            dots[i].classList.remove('current');
        }

        if(i<= furthest){
            dots[i].classList.add('seen');
        } else {
            dots[i].classList.remove('seen');
        }
    }

    if (current ===0){
        backButton.disabled = true;

    } else{
        backButton.disabled = false; 
    }

    const isManual = frames[current].hasAttribute('data-manual');
    if(isManual){
        nextButton.hidden = true;
    } else{
        nextButton.hidden = false; 
    }
}

function showFrame(index){
    frames[current].classList.remove('active');

    current=index;
    frames[current].classList.add('active');

    if (current > furthest) {
    furthest = current;
  }

    //to make sure media doesnt overlap
    for(let i=0; i<frames.length; i++){
        const media = frames[i].querySelectorAll('video, audio');

        for(const item of media){
            if(i===current){
                item.currentTime = 0; 
                item.play(); 
            } else{
                item.pause();
            }
        }
    }
    updateNav();
}

//moving thru chapters/scenes
export function next(){
    const isLastFrame = (current === frames.length -1);

    if(isLastFrame){
        finish();
    }else{
        showFrame(current+1);
    }
}

export function back(){
    if (current > 0){
        showFrame(current-1); 
    }
}


function handleClick(event){
    const clicked = event.target; 

    //detecting nexts
    const nextButton = clicked.closest('[data-next]');
    if(nextButton){
        next();
        return; 
    }

    const backTarget = clicked.closest('[data-back]');
    if(backTarget){
        back();
        return;
    }

    //detecting choices
    const choiceButton = clicked.closest('[data-choice]');
    if(choiceButton){
        const frameId = frames[current].id;
        choices[frameId] = choiceButton.dataset.choice;
        next();
        return;
    }

    const dot = clicked.closest('[data-dot]');

    if(dot){
        const index= Number(dot.dataset.dot);
        if(index<= furthest){
            showFrame(index);
        }
        return
    }

}

function handleKey(event) {
  if (event.key === 'ArrowLeft') {
    back();
  }

  if (event.key === 'ArrowRight') {
    const isManual = frames[current].hasAttribute('data-manual');
    if (!isManual) {
      next();
    }
  }
}


function finish() {
  scene.removeEventListener('click', handleClick);
  document.removeEventListener('keydown', handleKey);

  whenDone();
}