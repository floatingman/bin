#!/bin/sh

# Lynx requires the -cfg to look for configuration in someplace other than
# its own master lynx.cfg file. This requires reloading the shell if these
# files move for any reason. (They are symlinks in this config.) The best
# way to get around this confiruation issue and still allow lynx to be
# called from other programs is to encapsulate it with a function.

lynx=$(which lynx)

mylynx () {
    if [ -z "$lynx" ]; then
        echo "Doesn't look like lynx is installed."
        return 1
    fi
    if [ -r ~/.lynx.cfg ]; then
      lynxcfg="-cfg=$HOME/.lynx.cfg"
    fi
    if [ -r ~/.lynx.lss ]; then
      lynxlss="-lss=$HOME/.lynx.lss"
    fi
    $lynx "$lynxcfg" "$lynxlss" https://"$*"
}

mylynx $*
