module.exports = {
    Mode: require('./Mode'),
    FFA: require('./FFA'),
    Teams: require('./Teams'),
    Experimental: require('./Experimental'),
    Tournament: require('./Tournament'),
    HungerGames: require('./HungerGames'),
    Rainbow: require('./Rainbow'),
    LMS: require('./LMS'),
};

var get = function (id) {
    var mode;
    switch (id) {
        case 1: // Teams
            mode = new module.exports.Teams();
            break;
        case 2: // Experimental
            mode = new module.exports.Experimental();
            break;
        case 3: // Tournament
            mode = new module.exports.Tournament();
            break;
        case 4: // Hunger Games
            mode = new module.exports.HungerGames();
            break;
        case 5: // Rainbow
            mode = new module.exports.Rainbow();
            break;
        case 4: // LMS
         	mode = new module.exports.LMS();
         	break;
        default: // FFA is default
            mode = new module.exports.FFA();
            break;
    }
    return mode;
};

module.exports.get = get;
