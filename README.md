# VarTrace 
VarTrace is a python debugger that records & analyze your script executions

## Features

* printf debug without modifing your code
  * search & filter by variable name or value
![printf](https://github.com/zat-dev/VarTrace/raw/main/resources/printf_demo.gif)
* step back, jump
![jump](https://github.com/zat-dev/VarTrace/raw/main/resources/step_back_demo.gif)

## quick start
0. search and install "vartrace" vscode extension. then VT icon will appear the left of vscode
1. click VT icon and fill your execution command into sidebar textfield. the command is same as is you run your script 
    * for example, `python demo.py -a arg1`
2. push analyze button
3. do the above Features section

![howto](https://github.com/zat-dev/VarTrace/raw/main/resources/howtorun.png)

## current support

* language : python
* editor: vscode
* single thread only
* platform: windows

# limitation
* heavy performance degradation

## Extension Settings
* fill your python execution commands and push analyze button

# LICENSE
* GPL v3


