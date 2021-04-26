#!/bin/sh

# Install all the apps (Ran twice to deal with dependencies)
brew bundle --file="~/.homebrew/Brewfile"
brew bundle --file="~/.homebrew/Brewfile"

# Clone the dotfiles repo and link all of the configs.
# This is a complex command, it's understandable if it fails.
# You can figure out why!
#git clone git@github.com:floatingman/dotfiles ~/.dotfiles &&
#  git submodule update --init --recursive &&
#  rcup -t macos -x README.md -v
