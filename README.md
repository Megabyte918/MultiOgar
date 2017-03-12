# MultiOgar-Edited

A fast, open source server that supports multiple protocol versions and smooth vanilla physics.

Since August of 2016, [Barbosik](https://github.com/Barbosik) has stopped working on this project. So I forked the code and remade it into MultiOgar-Edited. An updated version of the previous MultiOgar.

## Information
Current version : **1.6.0**

![Language](https://img.shields.io/badge/language-node.js-yellow.svg)
[![License](https://img.shields.io/badge/license-APACHE2-blue.svg)](https://github.com/Barbosik/OgarMulti/blob/master/LICENSE.md)

Original MultiOgar code is based on the private server implementation [Ogar](https://github.com/OgarProject/Ogar). The original code rightfully belongs to the [OgarProject](https://github.com/OgarProject).

MultiOgar-Edited code however, is based on MultiOgar code that has been heavily modified and improved by many collaborators. The overall goal of this fork is to make physics as vanilla as possible, cleanup most of the code, and add lots of new features while maintaining better performance than the original MultiOgar.

## MultiOgar-Edited Wiki
Please see the issue templete before you make an issue, you can find it [here](https://github.com/Megabyte918/MultiOgar-Edited/wiki/Issue-Template). Along with client information, and a FAQ section. More coming soon!

## Installation
### Windows:
* Download and install node.js: https://nodejs.org/en/download/ 
* Download this repo
* Unzip MultiOgar code into some folder.

1. Run the win-Install_Dep.bat file.
2. Run win-Start.bat
* All these files can be found in the *run* folder.

*Manual*
Installing required modules.
```batch
:: Install Required Modules.
npm install

:: Starting the server. 
cd src
node index.js
```

#### Linux:
```bash
# First update your packages:
sudo apt-get update

# Install git:
sudo apt-get install git

# Install node.js:
sudo apt-get install nodejs-legacy npm

# Clone MultiOgar:
git clone git://github.com/Megabyte918/MultiOgar-Edited.git

# Install dependencies:
cd MultiOgar
npm install

# Run the server:
cd src
sudo node index.js
```

## Gallery
### Console:
![Console](http://i.imgur.com/bS5ToRD.png)

### Gameplay:
![Gameplay](http://i.imgur.com/XsXjT0o.png)

### Performance:
Version 1.2.8 (Original MultiOgar): 
* 1000 bots, 500 viruses, 1000 foods, map 14142x14142
* Works slightly slower than normal, speed decreases gradually as bots get larger.
* CPU load: 14% (x4 cores)
* Memory usage: 70 MB
* MS [lag]: Minimum of around 78

Version 1.6.0 (MultiOgar-Edited):
* 1000 bots, 500 viruses, 1000 foods, map 14142x14142
* Works very-very smooth, speed decreases gradually as bots get larger.
* CPU load: 24% (x2 cores)
* Memory usage: 35 MB
* MS [lag]: Minimum of around 45
