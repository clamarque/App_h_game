document.addEventListener('deviceready', init);

var MONSTER_DELAY = 500; // durée entre chaque création de nouveau monstre
var monsters = []; //Création tableau vide qui va contenir les # monstres
var canvas, context; //contexte du canvas HTML
var TakePicture;


// compatibilité requestAnimationFrame selon différents navigateurs
window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.oRequestAnimationFrame;


function init() {

    $('#game__btn').click(LaunchCamera);
    Monster.initialize(); // initialisaion classe Monster pour lancer le téléchargement de l'image à afficher dans le canvas
    canvas = $('canvas');
    context = canvas[0].getContext('2d');
    LaunchAccelerometre();
}

//Fonction d'appel du plugin CAMERA
function LaunchCamera(event) {

    function onSuccess(imageData) {
        Picture.initialize("data:image/jpeg;base64," + imageData)
        startGame();
    }

    function onFail(message) {
        console.log('Failed because: ' + message);
    }

    navigator.camera.getPicture(onSuccess, onFail, {
        quality: 50,
        destinationType: Camera.DestinationType.DATA_URL
    });
}

//Fonction d'appel du plugin ACCELEROMETRE
function LaunchAccelerometre() {

    var vx = 0; // Axe de velocité X
    var vy = 0; // Axe de velocité Y

    function onSuccess(accel) {
        //données accélération pour l'animation
        TakePicture.vx = -1 * (accel.x);
        TakePicture.vy = (accel.y);
    }

    function onError(error) {
        alert('Erreur code: ' + error);
    }

    navigator.accelerometer.watchAcceleration(onSuccess, onError, {
        frequency: 25
    });
}


//Fonction d'appel du lancement du jeu -> affiche le canvas et démarre le jeu
//@param  {Event} event événement click lancé par le bouton startGame
function startGame(event) {

    $('.game').hide(); // cache la partie menue du jeu
    canvas.css('display', 'block'); // on affiche le canvas à la place
    canvas.click(canvas_clickHandler); // on écoute le click sur le canvas
    setInterval(createMonster, MONSTER_DELAY); // lancement du processus de création de monstres à intervalles régulier
    createPicture(); // 
    requestAnimationFrame(render); // on lance le processus de rendu du canvas

}

//Fonction création de monstre à une position aléatoire appelée par le setInterval toutes les 500ms (MONSTER_DELAY)
function createMonster() {
    // si l'on a 50 monstres déjà à l'écran, on n'en crée pas de nouveau
    if (monsters.length < 50) {
        // on crée un nouveau monstre
        var monster = new Monster();
        // position x et y aléatoire, en fonction des dimensions du canvas
        monster.y = Math.random() * $('canvas').height();
        monster.x = Math.random() * $('canvas').width();
        // taille du nouveau monstre aléatoire également
        monster.size = monster.size * (0.5 + 0.5 * Math.random())
            // on enregistre le monstre dans notre tableau de monstres
            // pour un affichage ultérieur dans le canvas
        monsters.push(monster);
    }
}
//Fonction création de l'objet de l'image
function createPicture() {
    TakePicture = new Picture();
}

/**
 * Fonction appelée au click sur le canvas
 * teste si l'utilisateur a cliqué sur un monstre ou non
 * @param  {Event} event événement click lancé par le canvas
 */
function canvas_clickHandler(event) {
    // on calcule les coordonnées du point cliqué
    // relativement au canvas
    var offset = canvas.offset();
    var x = event.pageX - offset.left,
        y = event.pageY - offset.top;
    // on parcours la liste des monstres
    for (var i = monsters.length - 1; i >= 0; i--) {
        var monster = monsters[i];
        // si l'utilisateur a touché un monstre...
        if (monster.hits(x, y)) {
            // ... alors on le supprime du tableau
            // (attention au sens de lecture du tableau)
            monsters.splice(i, 1);
        }
    }
}


//Fonction qui affiche les monstres dans le canvas
function render() {

    var bounds = canvas[0].getBoundingClientRect(); // calcul des dimensions du canvas
    context.clearRect(0, 0, canvas.width(), canvas.height()); // effacement du canvas
    TakePicture.move(bounds); // on déplace la photo
    TakePicture.renderTo(context); // Affiche la photo dans le canvas
    // on affiche un à un les monstres dans le canvas
    for (var i = 0, monstersLength = monsters.length; i < monstersLength; i++) {
        var monster = monsters[i];
        monster.move(bounds); // déplace le monstre
        monster.renderTo(context); // affiche dans le canvas
    }
    requestAnimationFrame(render); // on redemande un nouveau render à la frame suivante

}