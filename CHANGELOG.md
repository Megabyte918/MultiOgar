# Changelog
#### 1.6.0:
* Refactored collision and move engine;
* Formatted & simplified some code;
* Refactored splitting cells;
* Tweaked splitting again;
* Fixed bug with mothercells eating viruses;
* Fixed "kickbot" command kicking minions too;
* Fixed playerbots not being able to have minions;
* Reduced rate of cells switching order when doublesplitting;
* ^^ This also fixed pushback with mobile splitting;
* Completely fixed ejected mass dissapearing;
* Fixed connection issues;
* Fixed long distance popsplits;
* Got rid of vegetable bot names;
* Refactored BinaryWriter;
* Refactored BinaryReader;
* Made changes to things regarding packets, thanks to @ItzLevvie;
* Fixed food registering as playercell, thanks to @NuclearC and @ItzLevvie;
* Refactored QuadNode;
* Refactored safe spawning;
* Fixed bug with linux script;
* Fixed error with ws module;
* Made some edits to commands, thanks to @Agarian;
* Implemented vector;
* Added popsplit macro, thanks to @Tyler3D;
* Refactored some of the scripts;
* Fixed leaderboard positioning in FFA;
* Added "calc" command;
* Tweaked eject size and virus explosion multipliers;
* Fixed server not working with uws module, thanks to @Luka967

-------------
#### 1.4.8:
* Added multiple client bindings, thanks to @MastaCoder;
* Cleaned up setNickname function in PacketHandler, thanks to @MastaCoder;
* Improved popsplit/virus explosion physics yet again;
* Disabled html tags in names for console-plus, thanks to @Gimmo;
* Added mobile agar.io physics with config;
* Re-factored autosplits;
* Fixed some bugs with gamemodes;
* Simplified boosted mode calculations for cells;
* Fixed ejected mass bugs;
* Added newest agario skins to randomskins.txt;
* Created new botnames based off of names in spectate on Agar.io party;
* Added movement during linesplits, thanks to @Tyler3D;
* Fixed small bug with botplayers

-------------
#### 1.4.7: 
* Added web console! All thanks to @Gimmo :)
* Cleaned more of CommandList, also thanks to @Gimmo;
* Fixed teleport command, thanks to @Agarian;
* Improved splitting physics;
* Moved changelog and license back to their original places;
* Added guide for web terminal;
* Added explode command;
* Added two new configs: clientBind and ejectVirus

-------------
#### 1.4.5:
* Added playerDecayCap config;
* Fixed some bugs;
* Refactored collision + move engine;
* Fixed cell jittering;
* Cleaned CommandList, thanks to @Gimmo;
* Improved splitting and virus explosion physics;
* Improved performance

--------------
#### 1.4.4:
* Removed verification for most player commands;
* Created the file that you are reading right now;
* Improved installation guide, cleaned up and renamed some files. Thanks to @MastaCoder;
* Greatly improved performance;
* Improved splitting and virus-explosion physics;
* Added two new commands: pop and play;
* Smartened bots, cleaned code;
* Reduced Mothercell spawn amount by 10, thanks to @Fantasy-Agario;
* Fixed some bugs

--------------
#### 1.4.2: 
* Added "replace" command;
* Add srcFiles variable, thanks to @MastaCoder;
* Added ejectSpawnPercent config;
* Refactored some of the collision engine;
* Fixed annoying ejected mass bug;
* Greatly improved performance, now 2x better than original MultiOgar

--------------
#### 1.4.1: 
* Fixed a few bugs;
* Added back old commands;
* Added two new commands, cleaned up "help" command;
* Slightly improved performance;
* Improved splitting and collision

--------------
#### 1.4.0: 
* Added pellet mode for minions! thanks to @ZfsrGhS953;
* Cleaned/refactored the rest of GameServer;
* Improved performance;
* Added controls for pellet mode;
* Refactored minion controls;
* Created "run" folder to hold the server run files/logs;
* Added two new commands: reset and split;
* Made help command look alot better, thanks to @Agarian ;
* Skipped version 1.3.8-1.3.9 for some reason

--------------
#### 1.3.7:
* Fixed some bugs;
* Cleaned/refactored most of GameServer;
* Greatly improved performance;
* Removed/moved some files to different locations;
* Created scripts folder;
* Removed unnecessary commands aswell as functions for said commands

--------------
#### 1.3.5: 
* Added new gamemode: Last Man Standing! Thanks to @Tyler3D;
* Added new minion features;
* Got rid of some more unnecessary gamemodes/commands;
* Improved performance

--------------
#### 1.3.4:
* Fixed minion bugs;
* Improved performance;
* Added random skins feature, and more

--------------
#### 1.3.3:
* Moved files;
* Fixed some bugs;
* Improved popsplits;
* Added some new features for minions

--------------
#### 1.3.0:
* Added minions! With a few new features too :)

--------------
#### 1.2.9:
* Matched virus explosions to vanilla;
* Added anti-bot grow measure from vanilla

--------------
#### 1.2.8:
* Removed unnecessary/broken commands & gamemodes;
* Added some custom commands: rec, speed, freeze

--------------
#### 1.2.7:
* Fixed many bugs that the original MultiOgar had

--------------
#### 1.2.47:
* Improved stability and performance; 
* Added mute/unmute command

--------------
#### What's new from Ogar:
* Added support for secure websocket connections (TLS);
* Fixed mass decay;
* Added ejectSizeLoss;
* Added sub-net ban feature (use `ban xx.xx.xx.*` or `ban xx.xx.*.*` to ban entire sub-network);
* Added performance optimizations, now up to 700 bots with no lags at all;
* Fixed bug when some cell split/eject were shown with delay for some clients;
* Added a lot of protocol optimizations, now server works with no lags at all even with 64 connected players;
* Added server version, now you can check if your MultiOgar code is fresh;
* Significant performance improvement and more smooth physics;
* Added protocol optimizations to reduce lags on cell multi split;
* Fixed pop-split behavior;
* Fixed cell-split order, now split-run works ok;
* A little performance improvement for split/eject;
* Fixed min mass to split/eject;
* Fixed mass-limit behavior;
* Added chat player commands /skin and /kill (to change skin, just type /skin %shark in the chat);
* Added scramble level 3 (anti-bot/anti-minimap protection), unsupported on some clients (unfortunately include vanilla, ogar.mivabe.nl works ok);
* Massive perfromance improvement & reduce network traffic;
* Split behavior - fixed;
* Protocol code - optimized;
* Massive performance improvement with quad-tree lookup;
* Split/Eject - physics code rewritten;
* Player speed - physics code rewritten;
* Cell remerge - physics code rewritten;
* Cell collision - physics code rewritten;
* View area - code rewritten;
* Spectate - code rewritten;
* Mouse control and cell movements - physics code rewritten;
* Border calculations - rewritten;
* Border bouncy physics - fixed and improved;
* mainLoop - cleaned;
* Added support for different protocols (4, early 5, late 5, 6, 7, 8);
* Added automatic mouse message type recognition;
* Added chat support;
* Added anti-spam protection;
* Added skin support (use name "< shark > Fish", remove space);
* Color generator replaced with hsv model;
* Memory leaks - fixed;
* Performance improved and optimized;
* Added support for server tracker ogar.mivabe.nl/master
