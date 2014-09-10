Detour - lyft styled
====================

"Calculate the detour distance between two different rides. Given four latitude / longitude pairs, where driver one is traveling from point A to point B and driver two is traveling from point C to point D, write a function (in your language of choice) to calculate the shorter of the detour distances the drivers would need to take to pick-up and drop-off the other driver."


P.S.
for a real-world solution, you'd require a graph (streets graph) and it'll depend obviously on many factors but generally speaking, a Dijkstra's / Bellman-ford algo combination, would take part as well as some DP algo for visualization. This wasn't the purpose though.



Used technologies: html5, css3, jquery, grunt.js, bower.js, google maps v3 api


it requires a Google maps api v3 API key [main.js]

I've used Lyft's logo - http://www.lyft.com and style 


ToC
---------------------

1. [Main app](#main)


<a name="main">Main app</a>
---------------------

just a quick implementation of the detour text, in a very quick time, i like Lyft's design.. 
check out https://www.lyft.com/style for me, i haven't actually used it, but still, FFU

there is a build version under "public" [auto grunt taskGruntfile.js] which does some tasks for optimization


responsive - mobile size
![](https://raw.githubusercontent.com/xmen4u/detour/master/img1.png)
![](https://raw.githubusercontent.com/xmen4u/detour/master/img2.png)

desktop size:
![](https://raw.githubusercontent.com/xmen4u/detour/master/img3.png)
