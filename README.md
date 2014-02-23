MavensMate for Brackets
===================

Prototype MavensMate plugin for the Brackets text editor

###Overview

[MavensMate][mm] is a tool for building rich IDE functionality for Force.com developers in various text editors. The most well-known plugin for MavensMate is [MavensMate for Sublime Text 3][mmst3]. MavensMate for Brackets is currently a prototype plugin for the Brackets text editor. Over time, the goal is to match the MavensMate for Sublime Text 3 feature set.

**REMEMBER: this is a PROTOTYPE**

###How to Contribute

####OSX

If you're on OSX and you already have MavensMate.app installed, then it's quite easy. Just install Brackets and clone this project into the Brackets user extensions directory:

```
$ cd ~/Library/Application\ Support/Brackets/extensions/user
$ git clone https://github.com/joeferraro/MavensMate-Brackets.git mavensmate
```

Create a file called `mavensmate-user-settings.json` in `~/Library/Application\ Support/Brackets/extensions/user` and populate it with your MavensMate for Brackets user settings.

####Windows

If you have MavensMate for Sublime Text installed, you can use the `python` interpreter bundled with MavensMate.exe:

1. Clone this project to the Brackets extensions directory `$ git clone https://github.com/joeferraro/MavensMate-Brackets.git mavensmate`
2. Create a file in the Brackets user extensions directory called `mavensmate-user-settings.json` and populate it with your MavensMate for Brackets user settings.
3. In `mavensmate-user-settings.json`, set `mm_python_location` to the location of `python.exe` in `Program Files/MavensMate/App`
4. In `mavensmate-user-settings.json`, set `mm_debug_location` to the location of `mm.py` in `Sublime Text 3/Packages/MavensMate/mm`

[mm]: http://mavensmate.com
[mmst3]: https://github.com/joeferraro/MavensMate-SublimeText
