# MultiOgar-Edited

[![Discord](https://discordapp.com/api/guilds/407210435721560065/embed.png?style=banner2)](https://discord.gg/27v68Sb)

A fast, open source [Agar.io](http://agar.io/) server that supports multiple protocol versions and smooth vanilla physics.

Since August of 2016, [Barbosik](https://github.com/Barbosik) has stopped working on this project. So I forked the code and remade it into MultiOgar-Edited, an updated version of the previous MultiOgar.

>---

# Information
Current version : **1.6.1**

![Language](https://img.shields.io/badge/language-node.js-yellow.svg)
[![License](https://img.shields.io/badge/license-APACHE2-blue.svg)](https://github.com/Barbosik/OgarMulti/blob/master/LICENSE.md)

Original MultiOgar code is based on the private server implementation [Ogar](https://github.com/OgarProject/Ogar). The original code rightfully belongs to the [OgarProject](https://github.com/OgarProject).

MultiOgar-Edited code however, is based on MultiOgar code that has been heavily modified and improved by many collaborators. The overall goal of this fork is to make physics as vanilla as possible, cleanup most of the code, and add lots of new features while maintaining better performance than the original MultiOgar.

>---

# Installation
## Windows

1. Download and install node.js: https://nodejs.org/en/download/ 
2. Download this repo
3. Unzip MultiOgar-Edited code into some folder.
4. Run the win-Install_Dep.bat file.
5. Run win-Start.bat

**All these files can be found in the `run` folder.**


### Installing required modules.

```batch
:: Install Required Modules.
npm install

:: Starting the server. 
cd src
node index.js
```

## Linux:
```bash
# First update your packages:
sudo apt-get update

# Install git:
sudo apt-get install git

# Install node.js:
sudo apt-get install nodejs-legacy npm

# Clone MultiOgar-Edited:
git clone git://github.com/Megabyte918/MultiOgar-Edited.git

# Install dependencies:
cd MultiOgar-Edited
npm install

# Run the server:
cd src
sudo node index.js
```

##### **For further details on running the server, please take a look inside the 'run' folder.**

>---

# Creating Issues

### Before you create your issue you ***MUST*** follow these rules: 

1. **The issue is in written in English.**
2. **The issue is directly related to the project.**
3. **Your issue is not a duplicate of a previous issue.**
4. **Descriptive information must be provided, so that we can reproduce the error you are experiencing**
5. **Error logs must be provided if any crashing is experienced.**

>**Please note that we will *NOT* provide assistance if the issue is with your own code, your issue WILL be locked if this is the case.**

## Issue Formatting

**In order for us to provide you with the best assistance we kindly ask you to present your issues in the best way that you can.**

Please read through [this guide](https://guides.github.com/features/mastering-markdown) to learn how you can apply [Markdown](https://en.wikipedia.org/wiki/Markdown) to your issues.

>---

# Gallery

>### Console
>![Console](http://i.imgur.com/bS5ToRD.png)

>### Gameplay
>![Gameplay](http://i.imgur.com/XsXjT0o.png)

>---

# Performance
>Version 1.2.8 (Original MultiOgar): 
>>* 1000 bots, 500 viruses, 1000 foods, map 14142x14142
>>* Works slightly slower than normal, speed decreases gradually as bots get larger.
>>* CPU load: 14% (x4 cores)
>>* Memory usage: 70 MB
>>* MS response time: Minimum of around 78

>Version 1.6.0 (MultiOgar-Edited):
>>* 1000 bots, 500 viruses, 1000 foods, map 14142x14142
>>* Works very-very smooth, speed decreases gradually as bots get larger.
>>* CPU load: 24% (x2 cores)
>>* Memory usage: 35 MB
>>* MS response time: Minimum of around 45



# Discord Bot Support

If you would like to allow a moderator to get direct access to your server's commands, you may want to set up a Discord bot on your server.

The setup is very simple, all you need is a Discord App Token and a role on your server.
Both can be specified in the config within the file.

After this is complete just run the `console-discord.js` file in the `run` folder and your server will start along with the bot.
