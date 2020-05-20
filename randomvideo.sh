#!/bin/bash
find -name "*.avi" | sort --random-sort| head -n 5|xargs -d '\n' mpv
