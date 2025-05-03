const noteBtn = document.getElementById("noteBtn");
const formContainer = document.getElementById("formContainer");
const shareBtn = document.getElementById("shareBtn");
const sharingDiv = document.getElementById("sharingDiv");

function addNote() {
    if (noteBtn.value == "+ Add Note") {
        noteBtn.value = "X";
        formContainer.style.display = "flex";
        formContainer.style.animationDuration = "2s"

    } else {
        noteBtn.value = "+ Add Note";
        formContainer.style.display = "none";
    }
}

// function shareFun(){
//     shareBtn.addEventListener("click", function(e){
//         sharingDiv.style.display = "flex";
//         sharingDiv.style.left = e.x+"px";
//         sharingDiv.style.top = e.y+"px";
//     })
// }


// shareBtn.addEventListener('click', function(e){
//     console.log(e.x)
// })