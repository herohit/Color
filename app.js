//Global selections and variables
const colorDivs =document.querySelectorAll(".color");
const generateBtn=document.querySelector(".generate");
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll('.color h2');
const popup=document.querySelector('.copy-container');
const adjustBtn=document.querySelectorAll('.adjust');
const lockBtn=document.querySelectorAll('.lock');
const closeAdjustments =document.querySelectorAll('.close-adjustment');
const sliderContainer =document.querySelectorAll('.sliders');
let initialColors;
//this is for lock storage
let savedPalettes=[];



//event listeners
generateBtn.addEventListener('click',randomColors);

lockBtn.forEach((button,index) =>{
    button.addEventListener('click',(e)=>{
        lockLayer(e,index);
    });
});


sliders.forEach(slider =>{
    slider.addEventListener('input',hslControls);
});

colorDivs.forEach((div,index)=>{
    div.addEventListener('change',()=>{
        updateTextUI(index);
    })
});


currentHexes.forEach(hex =>{
    hex.addEventListener('click',()=>{
        copyToClipboard(hex);
    });
});


popup.addEventListener('transitionend',()=>{
    const popupBox=popup.children[0];
    popup.classList.remove('active');
    popupBox.classList.remove('active');

});

adjustBtn.forEach((button,index)=>{
    button.addEventListener('click',()=>{
        openAdjustmentPanel(index);
    });
});

closeAdjustments.forEach((button,index)=>{
    button.addEventListener('click',()=>{
        closeAdjustmentPanel(index);
    });
});



//Functions


//Function to genertae hex
function generateHex(){
    // const letters = '0123456789ABCDEF';
    // let hash='#';

    // for(let i = 0;i<6;i++){
    //     hash += letters[Math.floor(Math.random()*16)];
    // }
    // return hash;

    const hexColor = chroma.random();
    return hexColor;
}

//function to random color
function randomColors(){
    
    initialColors=[];
    colorDivs.forEach((div,index)=>{
        const hexText=div.children[0];
        const randomColor = generateHex();

        if(div.classList.contains('locked')){
            initialColors.push(hexText.innerText);
            return;
        }else{
            //add to array
            initialColors.push(chroma(randomColor).hex());

        }
      
        //add color to background
        div.style.backgroundColor=randomColor;
        hexText.innerText=randomColor;

        //check for contract
        checkTextContrast(randomColor,hexText);
        // const activeDiv = colorDivs[index];
        // const icons = activeDiv.querySelectorAll('.controls button');
        // for(icon  of icons){
        //     checkTextContrast(randomColor,icon);
        // }


        //initialize color slider
        const color =chroma(randomColor);
        const sliders = div.querySelectorAll('.sliders input');
        const hue = sliders[0];
        const brightness = sliders[1];
        const saturation = sliders[2];

        colorizeSliders(color,hue,brightness,saturation);
    });
    //reset input slider
    resetInputs();
    //chehck for butoon contrast
    adjustBtn.forEach((button,index)=>{
        checkTextContrast(initialColors[index],button)
        checkTextContrast(initialColors[index],lockBtn[index]) 
    });
}

// function to check contract
function checkTextContrast(color,text){
    const luminance = chroma(color).luminance();
    if(luminance >0.5){
        text.style.color = "black";
    }
    else{
        text.style.color="white";
    }
}

function colorizeSliders(color,hue,brightness,saturation){
    //scale saturation
    const noSat = color.set('hsl.s',0);
    const fullSat = color.set('hsl.s',1);
    const scaleSat =chroma.scale([noSat,color,fullSat]);

    // scale brightness
    const midBright = color.set('hsl.l',0.5);
    const scaleBright = chroma.scale(['black',midBright,'white']);

    //scale hue
     


    //saturation input update
    saturation.style.backgroundImage=`linear-gradient(to right,${scaleSat(0)},${scaleSat(1)})`;
    brightness.style.backgroundImage=`linear-gradient(to right,${scaleBright(0)},${scaleBright(0.5)},${scaleBright(1)})`;
    hue.style.backgroundImage = `linear-gradient(to right,rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`;
}

function hslControls(e){
    const index = e.target.getAttribute('data-bright') || e.target.getAttribute('data-hue') || e.target.getAttribute('data-sat');
    
    let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
    const hue = sliders[0]
    const brightness = sliders[1]
    const saturation = sliders[2]

    // const bgColor = colorDivs[index].querySelector("h2").innerText;
    const bgColor =initialColors[index];
    

    let color = chroma(bgColor)
    .set('hsl.s',saturation.value)
    .set('hsl.l',brightness.value)
    .set('hsl.h',hue.value);


    colorDivs[index].style.backgroundColor = color;
    //colorize input/sliders
    colorizeSliders(color,hue,brightness,saturation);
}


//upadte text ui
function updateTextUI(index){
    const activeDiv = colorDivs[index];
    const color = chroma(activeDiv.style.backgroundColor);
    const textHex = activeDiv.querySelector('h2');
    const icons = activeDiv.querySelectorAll('.controls button');
    textHex.innerText = color.hex();

    //check contract
    checkTextContrast(color,textHex);
    for(icon of icons){
        checkTextContrast(color,icon);
    }
}

function resetInputs(){
    const sliders = document.querySelectorAll('.sliders input');
    sliders.forEach(slider =>{
        if(slider.name == 'hue'){
            const hueColor=initialColors[slider.getAttribute('data-hue')];
            const hueValue = chroma(hueColor).hsl()[0];
            slider.value = Math.floor(hueValue);
        }
        if(slider.name == 'brightness'){
            const brightColor=initialColors[slider.getAttribute('data-bright')];
            const brightValue = chroma(brightColor).hsl()[2];
            slider.value = Math.floor(brightValue*100)/100;
        }
        if(slider.name == 'saturation'){
            const satColor=initialColors[slider.getAttribute('data-sat')];
            const satValue = chroma(satColor).hsl()[1];
            slider.value = Math.floor(satValue*100)/100;
        }

    })
}


function copyToClipboard(hex){
    const el =document.createElement('textarea');
    el.value=hex.innerText;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);

    //pop up nimation
    const popupBox=popup.children[0];
    popup.classList.add('active');
    popupBox.classList.add('active');
}

function openAdjustmentPanel(index){
    sliderContainer[index].classList.toggle('active');
}
function closeAdjustmentPanel(index){
    sliderContainer[index].classList.remove('active');
}

function lockLayer(e,index){
    const lockSvg=e.target.children[0];
    const activeBg = colorDivs[index];
    activeBg.classList.toggle('locked');

    if (lockSvg.classList.contains('fa-lock-open')){
        e.target.innerHTML ='<i class="fas fa-lock"></i>';
    }else{
        e.target.innerHTML='<i class="fas fa-lock-open"></i>';
    }
}

//implementing save to palette and local storage stuff
const saveBtn=document.querySelector('.save');
const submitSave=document.querySelector('.submit-save');
const closeSave=document.querySelector('.close-save');
const saveContainer =document.querySelector('.save-container');
const saveInput =document.querySelector('.save-container input');
const libraryContainer=document.querySelector('.library-container');
const libraryBtn=document.querySelector('.library');
const closeLibraryBtn = document.querySelector('.close-library');

//event listener
saveBtn.addEventListener('click',openPalette);
closeSave.addEventListener('click',closePalette);
submitSave.addEventListener('click',savePalette);
libraryBtn.addEventListener('click',openLibrary);
closeLibraryBtn.addEventListener('click',closeLibrary);

function openPalette(e){
    const popup=saveContainer.children[0];
    saveContainer.classList.add('active');
    popup.classList.add('active');
}

function closePalette(e){
    const popup=saveContainer.children[0];
    saveContainer.classList.remove('active');
    popup.classList.remove('active');
}

function savePalette(e){
    const popup=saveContainer.children[0];
    saveContainer.classList.remove('active');
    popup.classList.remove('active');

    const name=saveInput.value;
    const colors=[];
    
    currentHexes.forEach(hex=>{
        
        colors.push(hex.innerText);
    });
    //generate object
    let paletteNr;
    const paletteObjects =JSON.parse(localStorage.getItem('palettes'));
    if(paletteObjects){
        paletteNr=paletteObjects.length;
    }else{
        paletteNr=savedPalettes.length;
    }
    const paletteObj={
        name:name,
        colors:colors,
        nr:paletteNr
    };
    savedPalettes.push(paletteObj);
    //sace to local storage
    saveToLocal(paletteObj);
    saveInput.value="";
    //generate palette for library
    const palette =document.createElement("div");
    palette.classList.add('custom-palete');
    const title = document.createElement('h4');
    title.innerText=paletteObj.name;
    const preview=document.createElement('div');
    preview.classList.add('small-preview');
    paletteObj.colors.forEach(smallColor=>{
        const smallDiv=document.createElement('div');
        smallDiv.style.backgroundColor=smallColor;
        preview.appendChild(smallDiv);
    });
    const paletteBtn =document.createElement('button');
    paletteBtn.classList.add('pick-palette-btn');
    paletteBtn.classList.add(paletteObj.nr);
    paletteBtn.innerText='Select';

    //attach event listener to btn
    paletteBtn.addEventListener('click',e=>{
        closeLibrary();
        const paletteIndex=e.target.classList[1];
        initialColors=[];
        
        savedPalettes[paletteIndex].colors.forEach((col,index)=>{
            initialColors.push(col);
            colorDivs[index].style.backgroundColor=col;
            const text=colorDivs[index].children[0];

            checkTextContrast(col,text);
            updateTextUI(index);
        })
        resetInputs();
    })
    

    //append to library
    palette.appendChild(title);
    palette.appendChild(preview);
    palette.appendChild(paletteBtn);

    libraryContainer.children[0].appendChild(palette);

}

function saveToLocal(paletteObj){
    let localPalettes;
    if(localStorage.getItem('palettes') === null){
        localPalettes=[];
    }else{
        localPalettes = JSON.parse(localStorage.getItem("palettes"));
    }
    localPalettes.push(paletteObj);
    localStorage.setItem('palettes',JSON.stringify(localPalettes));
}

function openLibrary(){
    const popup=libraryContainer.children[0];
    libraryContainer.classList.add('active');
    popup.classList.add('active');
}

function closeLibrary(){
    const popup=libraryContainer.children[0];
    popup.classList.remove('active');
    libraryContainer.classList.remove('active');
}

function getLocal(){
    if(localStorage.getItem('palettes') === null){
        localPalettes=[];
    }else{
        const paletteObjects=JSON.parse(localStorage.getItem('palettes'));
        savedPalettes=[...paletteObjects];
        paletteObjects.forEach(paletteObj=>{
            const palette =document.createElement("div");
            palette.classList.add('custom-palete');
            const title = document.createElement('h4');
            title.innerText=paletteObj.name;
            const preview=document.createElement('div');
            preview.classList.add('small-preview');
            paletteObj.colors.forEach(smallColor=>{
                const smallDiv=document.createElement('div');
                smallDiv.style.backgroundColor=smallColor;
                preview.appendChild(smallDiv);
            });
            const paletteBtn =document.createElement('button');
            paletteBtn.classList.add('pick-palette-btn');
            paletteBtn.classList.add(paletteObj.nr);
            paletteBtn.innerText='Select';

            //attach event listener to btn
            paletteBtn.addEventListener('click',e=>{
                closeLibrary();
                const paletteIndex=e.target.classList[1];
                initialColors=[];

                paletteObjects[paletteIndex].colors.forEach((col,index)=>{
                initialColors.push(col);
                colorDivs[index].style.backgroundColor=col;
                const text=colorDivs[index].children[0];

                checkTextContrast(col,text);
                updateTextUI(index);
            });
            resetInputs();
        });
    

        //append to library
        palette.appendChild(title);
        palette.appendChild(preview);
        palette.appendChild(paletteBtn);

        libraryContainer.children[0].appendChild(palette);
        
        });
    }
};

getLocal();

randomColors();